from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import timedelta
import os
import shutil
from PIL import Image
import json

import models
import auth
from database import engine, get_db
from google_play_api import GooglePlayAPI
from translator import TranslationService
from aab_parser import extract_version_from_aab, validate_aab_file
from pydantic import BaseModel, EmailStr

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Play Console Automation")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://nexusdeploy.pro", "https://nexusdeploy.pro", "http://www.nexusdeploy.pro", "https://www.nexusdeploy.pro"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
os.makedirs("service_accounts", exist_ok=True)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class ListingData(BaseModel):
    package_name: str
    language: str
    title: str
    short_description: str
    full_description: str

class TranslateRequest(BaseModel):
    title: str
    short_description: str
    full_description: str
    source_language: str = "en"

class TemplateCreate(BaseModel):
    name: str
    title: str
    short_description: str
    full_description: str

@app.post("/api/auth/register", response_model=TokenResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = auth.create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer", "is_admin": new_user.is_admin or False}

@app.post("/api/auth/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = auth.create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer", "is_admin": db_user.is_admin or False}

@app.get("/api/auth/me")
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "is_admin": current_user.is_admin or False,
        "full_name": current_user.full_name,
        "created_at": current_user.created_at
    }

@app.post("/api/service-accounts/upload")
async def upload_service_account(
    name: str = Form(...),
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith('.json'):
        raise HTTPException(status_code=400, detail="Only JSON files are allowed")
    
    file_path = f"service_accounts/{current_user.id}_{file.filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        api = GooglePlayAPI(file_path)
    except Exception as e:
        os.remove(file_path)
        raise HTTPException(status_code=400, detail=f"Invalid service account file: {str(e)}")
    
    service_account = models.ServiceAccount(
        user_id=current_user.id,
        name=name,
        json_key_path=file_path
    )
    db.add(service_account)
    db.commit()
    db.refresh(service_account)
    
    return {
        "id": service_account.id,
        "name": service_account.name,
        "created_at": service_account.created_at
    }

@app.get("/api/service-accounts")
def get_service_accounts(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    accounts = db.query(models.ServiceAccount).filter(
        models.ServiceAccount.user_id == current_user.id,
        models.ServiceAccount.is_active == True
    ).all()
    
    return [{
        "id": acc.id,
        "name": acc.name,
        "created_at": acc.created_at
    } for acc in accounts]

@app.get("/api/apps")
def get_apps(
    service_account_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    service_account = db.query(models.ServiceAccount).filter(
        models.ServiceAccount.id == service_account_id,
        models.ServiceAccount.user_id == current_user.id
    ).first()
    
    if not service_account:
        raise HTTPException(status_code=404, detail="Service account not found")
    
    apps = db.query(models.App).filter(
        models.App.service_account_id == service_account_id
    ).all()
    
    result = []
    for app in apps:
        # Agar icon_url bo'sh bo'lsa, local grafikadan olish
        icon_url = app.icon_url
        if not icon_url:
            icon_graphic = db.query(models.Graphic).filter(
                models.Graphic.app_id == app.id,
                models.Graphic.graphic_type == 'icon'
            ).first()
            if icon_graphic:
                icon_url = f"/{icon_graphic.file_path}"
        
        result.append({
            "id": app.id,
            "package_name": app.package_name,
            "app_name": app.app_name,
            "icon_url": icon_url,
            "status": getattr(app, 'status', 'draft'),
            "default_language": getattr(app, 'default_language', 'en-US'),
            "has_aab": bool(getattr(app, 'aab_file_path', None)),
            "draft_title": getattr(app, 'draft_title', None),
            "draft_short_description": getattr(app, 'draft_short_description', None),
            "draft_full_description": getattr(app, 'draft_full_description', None),
            "draft_language": getattr(app, 'draft_language', 'en')
        })
    
    return result

@app.delete("/api/apps/{app_id}")
def delete_app(
    app_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Ilovani o'chirish"""
    app = db.query(models.App).filter(models.App.id == app_id).first()
    
    if not app:
        raise HTTPException(status_code=404, detail="App not found")
    
    # AAB faylni o'chirish
    if app.aab_file_path and os.path.exists(app.aab_file_path):
        try:
            os.remove(app.aab_file_path)
        except:
            pass
    
    # Listing'larni o'chirish
    db.query(models.Listing).filter(models.Listing.app_id == app_id).delete()
    
    # Grafiklarni o'chirish
    graphics = db.query(models.Graphic).filter(models.Graphic.app_id == app_id).all()
    for g in graphics:
        if os.path.exists(g.file_path):
            try:
                os.remove(g.file_path)
            except:
                pass
    db.query(models.Graphic).filter(models.Graphic.app_id == app_id).delete()
    
    # Ilovani o'chirish
    db.delete(app)
    db.commit()
    
    return {"message": "Ilova o'chirildi", "package_name": app.package_name}

@app.get("/api/apps/{app_id}/listing")
def get_app_listing(
    app_id: int,
    language: str = 'en',
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Ilova uchun saqlangan listing ma'lumotlarini olish"""
    app = db.query(models.App).filter(models.App.id == app_id).first()
    
    if not app:
        raise HTTPException(status_code=404, detail="App not found")
    
    # Listing ma'lumotlarini olish
    listing = db.query(models.Listing).filter(
        models.Listing.app_id == app_id,
        models.Listing.language == language
    ).first()
    
    # 1. DB listing
    if listing:
        return {
            "title": listing.title or "",
            "short_description": listing.short_description or "",
            "full_description": listing.full_description or "",
            "language": listing.language,
            "source": "listing"
        }
    
    # 2. Draft (faqat mos tilga)
    draft_lang = getattr(app, 'draft_language', 'en')
    if hasattr(app, 'draft_title') and app.draft_title and draft_lang == language:
        return {
            "title": app.draft_title or "",
            "short_description": app.draft_short_description or "",
            "full_description": app.draft_full_description or "",
            "language": draft_lang,
            "source": "draft"
        }
    
    # 3. Google Play'dan olish
    try:
        sa = db.query(models.ServiceAccount).filter(
            models.ServiceAccount.id == app.service_account_id
        ).first()
        if sa:
            api = GooglePlayAPI(sa.json_key_path)
            listings = api.get_listings(app.package_name)
            play_listings = listings.get('listings', [])
            
            # Tanlangan tilda yoki birinchi mavjud tildan olish
            play_data = None
            for pl in play_listings:
                if pl.get('language') == language:
                    play_data = pl
                    break
            if not play_data and play_listings:
                play_data = play_listings[0]
            
            if play_data:
                return {
                    "title": play_data.get('title', ''),
                    "short_description": play_data.get('shortDescription', ''),
                    "full_description": play_data.get('fullDescription', ''),
                    "language": play_data.get('language', language),
                    "source": "google_play"
                }
    except Exception as e:
        print(f"Google Play listing olishda xatolik: {e}")
    
    # 4. Bo'sh
    return {
        "title": "",
        "short_description": "",
        "full_description": "",
        "language": language,
        "source": "empty"
    }

class PackageNameAdd(BaseModel):
    package_names: List[str]

@app.post("/api/apps/add")
def add_apps(
    data: PackageNameAdd,
    service_account_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    service_account = db.query(models.ServiceAccount).filter(
        models.ServiceAccount.id == service_account_id,
        models.ServiceAccount.user_id == current_user.id
    ).first()
    
    if not service_account:
        raise HTTPException(status_code=404, detail="Service account not found")
    
    try:
        api = GooglePlayAPI(service_account.json_key_path)
        
        added_apps = []
        failed_apps = []
        
        for package_name in data.package_names:
            package_name = package_name.strip()
            if not package_name:
                continue
            
            # Tekshirish - shu service account'da allaqachon mavjudmi?
            existing_app = db.query(models.App).filter(
                models.App.package_name == package_name,
                models.App.service_account_id == service_account_id
            ).first()
            
            if existing_app:
                failed_apps.append(f"{package_name} (allaqachon qo'shilgan)")
                continue
            
            # Package'ga kirish borligini tekshirish
            try:
                if api.verify_access(package_name):
                    # Google Play'dan real ma'lumotlarni olish
                    app_name = package_name.split('.')[-1].title()
                    default_lang = 'en-US'
                    try:
                        listings = api.get_listings(package_name)
                        play_listings = listings.get('listings', [])
                        if play_listings:
                            default_lang = play_listings[0].get('language', 'en-US')
                            app_name = play_listings[0].get('title', app_name)
                    except:
                        pass
                    
                    new_app = models.App(
                        service_account_id=service_account_id,
                        package_name=package_name,
                        app_name=app_name,
                        default_language=default_lang
                    )
                    db.add(new_app)
                    added_apps.append(package_name)
                else:
                    failed_apps.append(f"{package_name} (ruxsat yo'q)")
            except Exception as ve:
                failed_apps.append(f"{package_name} ({str(ve)[:80]})")
        
        db.commit()
        return {
            "message": f"Added {len(added_apps)} apps",
            "added": added_apps,
            "failed": failed_apps,
            "count": len(added_apps)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding apps: {str(e)}")

@app.post("/api/listings/save-draft")
def save_draft(
    data: dict,
    service_account_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Ma'lumotlarni faqat DB'da saqlash (Google'ga yubormasdan)"""
    app_record = db.query(models.App).filter(
        models.App.package_name == data['package_name']
    ).first()
    
    if not app_record:
        raise HTTPException(status_code=404, detail="App not found")
    
    # Draft ma'lumotlarni saqlash
    app_record.draft_title = data.get('title')
    app_record.draft_short_description = data.get('short_description')
    app_record.draft_full_description = data.get('full_description')
    app_record.draft_language = data.get('language', 'en')
    app_record.draft_updated_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": "Draft saqlandi", "updated_at": app_record.draft_updated_at}

@app.post("/api/listings/update")
def update_listing(
    listing: ListingData,
    service_account_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    service_account = db.query(models.ServiceAccount).filter(
        models.ServiceAccount.id == service_account_id,
        models.ServiceAccount.user_id == current_user.id
    ).first()
    
    if not service_account:
        raise HTTPException(status_code=404, detail="Service account not found")
    
    try:
        api = GooglePlayAPI(service_account.json_key_path)
        success = api.update_listing(
            listing.package_name,
            listing.language,
            listing.title,
            listing.short_description,
            listing.full_description
        )
        
        if success:
            app = db.query(models.App).filter(
                models.App.package_name == listing.package_name
            ).first()
            
            if app:
                db_listing = db.query(models.Listing).filter(
                    models.Listing.app_id == app.id,
                    models.Listing.language == listing.language
                ).first()
                
                if db_listing:
                    db_listing.title = listing.title
                    db_listing.short_description = listing.short_description
                    db_listing.full_description = listing.full_description
                else:
                    db_listing = models.Listing(
                        app_id=app.id,
                        language=listing.language,
                        title=listing.title,
                        short_description=listing.short_description,
                        full_description=listing.full_description
                    )
                    db.add(db_listing)
                
                db.commit()
            
            return {"message": "Listing updated successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to update listing")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/listings/submit-for-review")
def submit_for_review(
    data: dict,
    service_account_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Play Market'ga tekshirishga yuborish - listing + grafikalar"""
    service_account = db.query(models.ServiceAccount).filter(
        models.ServiceAccount.id == service_account_id,
        models.ServiceAccount.user_id == current_user.id
    ).first()
    
    if not service_account:
        raise HTTPException(status_code=404, detail="Service account not found")
    
    package_name = data.get('package_name')
    title = data.get('title', '')
    short_description = data.get('short_description', '')
    full_description = data.get('full_description', '')
    
    if not package_name or not title:
        raise HTTPException(status_code=400, detail="Package name va title kerak")
    
    # App'ning haqiqiy default tilini olish
    app_record = db.query(models.App).filter(
        models.App.package_name == package_name
    ).first()
    
    language = getattr(app_record, 'default_language', None) or 'en-US'
    
    try:
        api = GooglePlayAPI(service_account.json_key_path)
        
        # Grafiklarni to'plash
        graphics_list = []
        if app_record:
            graphics = db.query(models.Graphic).filter(
                models.Graphic.app_id == app_record.id
            ).all()
            for g in graphics:
                graphics_list.append((g.graphic_type, g.file_path))
        
        # Bitta edit ichida hamma narsani yuborish
        results = api.submit_all(
            package_name=package_name,
            language=language,
            title=title,
            short_desc=short_description,
            full_desc=full_description,
            graphics=graphics_list
        )
        results['language_used'] = language
        
        print(f"Submit results: {results}")
        
        # DB'da listing saqlash
        if app_record:
            db_listing = db.query(models.Listing).filter(
                models.Listing.app_id == app_record.id,
                models.Listing.language == language
            ).first()
            
            if db_listing:
                db_listing.title = title
                db_listing.short_description = short_description
                db_listing.full_description = full_description
            else:
                db_listing = models.Listing(
                    app_id=app_record.id,
                    language=language,
                    title=title,
                    short_description=short_description,
                    full_description=full_description
                )
                db.add(db_listing)
            
            app_record.status = 'review'
            db.commit()
        
        return {
            "message": "Play Market'ga yuborildi!",
            "results": results,
            "success": results.get('listing_updated', False)
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/full-deploy")
def full_deploy(
    data: dict,
    service_account_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Bitta tugma bilan hamma narsani Play Market'ga yuborish:
    1. Contact details
    2. Store listing (title, short/full description)
    3. Grafikalar (icon, feature, screenshots)
    4. AAB yuklash + release yaratish
    Hamma API orqali bo'ladigan ishlarni bajaradi.
    """
    service_account = db.query(models.ServiceAccount).filter(
        models.ServiceAccount.id == service_account_id,
        models.ServiceAccount.user_id == current_user.id
    ).first()
    if not service_account:
        raise HTTPException(status_code=404, detail="Service account topilmadi")
    
    package_name = data.get('package_name')
    title = data.get('title', '')
    short_description = data.get('short_description', '')
    full_description = data.get('full_description', '')
    contact_email = data.get('contact_email', '')
    contact_phone = data.get('contact_phone', '')
    contact_website = data.get('contact_website', '')
    
    if not package_name or not title:
        raise HTTPException(status_code=400, detail="Package name va title kerak")
    
    app_record = db.query(models.App).filter(
        models.App.package_name == package_name
    ).first()
    
    language = getattr(app_record, 'default_language', None) or 'en-US'
    
    all_results = {
        'steps': [],
        'errors': [],
        'manual_tasks': []
    }
    
    try:
        api = GooglePlayAPI(service_account.json_key_path)
        
        # === STEP 1: Listing + Grafikalar + Contact details ===
        graphics_list = []
        if app_record:
            graphics = db.query(models.Graphic).filter(
                models.Graphic.app_id == app_record.id
            ).all()
            for g in graphics:
                graphics_list.append((g.graphic_type, g.file_path))
        
        submit_result = api.submit_all(
            package_name=package_name,
            language=language,
            title=title,
            short_desc=short_description,
            full_desc=full_description,
            graphics=graphics_list,
            contact_email=contact_email or 'dev@example.com',
            contact_phone=contact_phone,
            contact_website=contact_website
        )
        
        if submit_result.get('listing_updated'):
            all_results['steps'].append('✅ Store Listing yangilandi')
        if submit_result.get('details_updated'):
            all_results['steps'].append('✅ Contact details yangilandi')
        if submit_result.get('graphics_uploaded', 0) > 0:
            all_results['steps'].append(f"✅ {submit_result['graphics_uploaded']} ta grafika yuklandi")
        if submit_result.get('committed'):
            all_results['steps'].append('✅ Play Market\'ga commit qilindi')
        all_results['errors'].extend(submit_result.get('errors', []))
        
        # === STEP 2: AAB yuklash + Release yaratish ===
        if app_record and app_record.aab_file_path and os.path.exists(app_record.aab_file_path):
            release_result = api.create_release_and_submit(
                package_name=package_name,
                aab_path=app_record.aab_file_path,
                track='internal',
                release_notes=f'{title} - new release',
                language=language
            )
            
            if release_result.get('aab_uploaded'):
                all_results['steps'].append(f"✅ AAB yuklandi (v{release_result.get('version_code')})")
            if release_result.get('release_created'):
                all_results['steps'].append('✅ Internal test release yaratildi')
            if release_result.get('committed'):
                all_results['steps'].append('✅ Release commit qilindi')
            all_results['errors'].extend(release_result.get('errors', []))
        else:
            all_results['manual_tasks'].append('⚠️ AAB fayl yuklanmagan — AAB yuklang va qayta urining')
        
        # === API orqali bajarib bo'lmaydigan tasklar ===
        all_results['manual_tasks'].extend([
            '🔧 Set privacy policy — Play Console\'da URL kiriting',
            '🔧 App access — Play Console\'da tanlang (All functionality available without restrictions)',
            '🔧 Ads — Play Console\'da belgilang (Contains ads / No ads)',
            '🔧 Content rating — Play Console\'da so\'rovnomani to\'ldiring',
            '🔧 Target audience — Play Console\'da yosh guruhini tanlang',
            '🔧 Data safety — Play Console\'da to\'ldiring',
        ])
        all_results['play_console_url'] = f'https://play.google.com/console/u/0/developers/app/{package_name}/app-dashboard'
        
        # DB saqlash
        if app_record:
            db_listing = db.query(models.Listing).filter(
                models.Listing.app_id == app_record.id,
                models.Listing.language == language
            ).first()
            if db_listing:
                db_listing.title = title
                db_listing.short_description = short_description
                db_listing.full_description = full_description
            else:
                db_listing = models.Listing(
                    app_id=app_record.id,
                    language=language,
                    title=title,
                    short_description=short_description,
                    full_description=full_description
                )
                db.add(db_listing)
            if contact_email:
                app_record.contact_email = contact_email
            app_record.status = 'review'
            db.commit()
        
        print(f"Full deploy results: steps={len(all_results['steps'])}, errors={len(all_results['errors'])}")
        
        return {
            "success": len(all_results['errors']) == 0,
            "results": all_results,
            "language_used": language
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/analyze")
def ai_analyze_app(
    data: dict,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Groq AI bilan dasturni analiz qilib Play Store listing'ni avtomatik to'ldirish"""
    package_name = data.get('package_name')
    service_account_id = data.get('service_account_id')
    groq_api_key = data.get('groq_api_key', '')
    user_prompt = data.get('prompt', '')
    
    if not package_name:
        raise HTTPException(status_code=400, detail="Package name kerak")
    
    if not groq_api_key:
        raise HTTPException(status_code=400, detail="Groq API key kerak")
    
    # App ma'lumotlarini olish
    app_record = db.query(models.App).filter(
        models.App.package_name == package_name
    ).first()
    
    if not app_record:
        raise HTTPException(status_code=404, detail="App topilmadi")
    
    # Google Play'dan mavjud listing olish
    existing_listing = {}
    if service_account_id:
        sa = db.query(models.ServiceAccount).filter(
            models.ServiceAccount.id == service_account_id,
            models.ServiceAccount.user_id == current_user.id
        ).first()
        if sa:
            try:
                api = GooglePlayAPI(sa.json_key_path)
                listings = api.get_listings(package_name)
                play_listings = listings.get('listings', [])
                if play_listings:
                    existing_listing = play_listings[0]
            except:
                pass
    
    # App holati analiz
    graphics = db.query(models.Graphic).filter(models.Graphic.app_id == app_record.id).all()
    has_icon = any(g.graphic_type == 'icon' for g in graphics)
    has_feature = any(g.graphic_type == 'featureGraphic' for g in graphics)
    screenshot_count = sum(1 for g in graphics if g.graphic_type == 'phoneScreenshots')
    has_aab = bool(app_record.aab_file_path)
    
    # Groq AI bilan analiz
    try:
        from groq import Groq
        client = Groq(api_key=groq_api_key)
        
        aab_status = "Ha" if has_aab else "Yoq"
        icon_status = "Bor" if has_icon else "Yoq"
        feature_status = "Bor" if has_feature else "Yoq"
        context = f"""Package name: {package_name}
App name: {app_record.app_name or package_name}
Status: {app_record.status}
Default language: {getattr(app_record, 'default_language', 'en-US')}
AAB yuklangan: {aab_status}
Icon: {icon_status}
Feature Graphic: {feature_status}
Screenshots: {screenshot_count} ta"""
        
        if existing_listing:
            context += f"""

Mavjud title: {existing_listing.get('title', '')}
Mavjud short description: {existing_listing.get('shortDescription', '')}
Mavjud full description: {existing_listing.get('fullDescription', '')}"""
        
        if user_prompt:
            context += f"\n\nDasturchi izohi: {user_prompt}"
        
        system_prompt = """Sen Google Play Store listing mutaxassisi va ASO (App Store Optimization) ekspertisan. Sening vazifang:
Berilgan dastur haqidagi ma'lumotlar asosida Google Play Store uchun professional listing yoz va dasturchi uchun qolgan tasklar ro'yxatini tuzib ber.

Quyidagi formatda FAQAT JSON qaytarishing kerak (boshqa hech narsa yo'q):
{
  "title": "max 30 belgi, dastur nomi — SEO optimized",
  "short_description": "max 80 belgi, qisqa va jozibali tavsif, asosiy kalitso'zlar bilan",
  "full_description": "max 4000 belgi, to'liq professional tavsif. Key features, emoji bilan chiroyli, SEO kalit so'zlar bilan",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "category_suggestion": "tavsiya etiladigan kategoriya",
  "improvements": ["konkret maslahat 1", "konkret maslahat 2"],
  "remaining_tasks": ["qolgan task 1", "qolgan task 2"],
  "aso_score": 75,
  "aso_tips": ["ASO maslahat 1", "maslahat 2"]
}

Qoidalar:
- Title 30 belgidan oshmasin, SEO uchun muhim kalit so'zlarni qo'sh
- Short description 80 belgidan oshmasin, call-to-action bo'lsin
- Full description professional, emoji va formatting bilan bo'lsin, 500+ so'z
- Agar mavjud listing bo'lsa, uni yaxshila va kuchaytir
- Foydalanuvchi izohi bo'lsa, unga asoslanib yoz
- remaining_tasks: dasturchi hali qilmagan ishlar (icon yo'q bo'lsa ayt, screenshot kam bo'lsa ayt, AAB yuklanmagan bo'lsa ayt)
- aso_score: 0-100 orasida, hozirgi holat baholash
- aso_tips: ASO yaxshilash bo'yicha konkret maslahatlar
- Har doim FAQAT JSON format qaytarishing kerak, boshqa hech narsa yo'q"""

        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": context}
            ],
            temperature=0.3,
            max_tokens=3000,
            response_format={"type": "json_object"}
        )
        
        ai_response = completion.choices[0].message.content.strip()
        print(f"AI raw response: {ai_response[:300]}")
        
        # JSON parse — bir necha usulda
        result = None
        
        # 1. To'g'ridan-to'g'ri parse
        try:
            result = json.loads(ai_response)
        except json.JSONDecodeError:
            pass
        
        # 2. ```json ... ``` formatni tozalash
        if result is None and '```' in ai_response:
            try:
                code_block = ai_response.split('```')[1]
                if code_block.startswith('json'):
                    code_block = code_block[4:]
                result = json.loads(code_block.strip())
            except (json.JSONDecodeError, IndexError):
                pass
        
        # 3. { dan } gacha kesib olish
        if result is None:
            try:
                start = ai_response.index('{')
                end = ai_response.rindex('}') + 1
                result = json.loads(ai_response[start:end])
            except (ValueError, json.JSONDecodeError):
                pass
        
        if result is None:
            return {
                "success": False,
                "error": "AI javobini parse qilib bo'lmadi",
                "raw_response": ai_response[:500]
            }
        
        # Limitlarni enforce qilish
        if result.get('title') and len(result['title']) > 30:
            result['title'] = result['title'][:30]
        if result.get('short_description') and len(result['short_description']) > 80:
            result['short_description'] = result['short_description'][:80]
        if result.get('full_description') and len(result['full_description']) > 4000:
            result['full_description'] = result['full_description'][:4000]
        
        return {
            "success": True,
            "data": result,
            "existing_listing": bool(existing_listing)
        }
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"AI analiz xatosi: {str(e)}")

@app.post("/api/translate")
def translate_listing(
    data: TranslateRequest,
    current_user: models.User = Depends(auth.get_current_user)
):
    try:
        translator = TranslationService()
        translations = translator.translate_listing(
            data.title,
            data.short_description,
            data.full_description,
            data.source_language
        )
        return translations
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation error: {str(e)}")

@app.post("/api/apps/upload-aab")
async def upload_aab(
    package_name: str = Form(...),
    service_account_id: int = Form(...),
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """AAB (Android App Bundle) faylini yuklash va versiyani avtomatik olish"""
    
    # Faqat .aab fayllarni qabul qilish
    if not file.filename.endswith('.aab'):
        raise HTTPException(status_code=400, detail="Faqat .aab fayllar qabul qilinadi")
    
    # Service account tekshirish
    service_account = db.query(models.ServiceAccount).filter(
        models.ServiceAccount.id == service_account_id,
        models.ServiceAccount.user_id == current_user.id
    ).first()
    
    if not service_account:
        raise HTTPException(status_code=404, detail="Service account not found")
    
    # Ilova topish
    app = db.query(models.App).filter(
        models.App.package_name == package_name
    ).first()
    
    if not app:
        raise HTTPException(status_code=404, detail="App not found")
    
    # AAB faylni vaqtincha saqlash
    temp_dir = "temp_uploads"
    os.makedirs(temp_dir, exist_ok=True)
    temp_path = os.path.join(temp_dir, file.filename)
    
    with open(temp_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # AAB faylni validatsiya qilish
    validation = validate_aab_file(temp_path)
    if not validation['valid']:
        os.remove(temp_path)
        raise HTTPException(status_code=400, detail=validation['error'])
    
    # Versiya ma'lumotlarini olish
    version_info = extract_version_from_aab(temp_path)
    
    if not version_info['success']:
        # Agar avtomatik olish ishlamasa, faylni saqlaymiz
        version_code = None
        version_name = "Unknown"
    else:
        version_code = version_info.get('version_code')
        version_name = version_info.get('version_name', 'Unknown')
        
        # Package name tekshirish
        extracted_package = version_info.get('package_name')
        if extracted_package and extracted_package != package_name:
            os.remove(temp_path)
            raise HTTPException(
                status_code=400, 
                detail=f"Package name mos kelmaydi! Kutilgan: {package_name}, AAB da: {extracted_package}"
            )
    
    # Version code tekshirish (oldingi versiyadan katta bo'lishi kerak)
    if app.aab_version_code and version_code:
        if version_code <= app.aab_version_code:
            os.remove(temp_path)
            raise HTTPException(
                status_code=400,
                detail=f"Version code kichik yoki teng! Oldingi: {app.aab_version_code}, Yangi: {version_code}"
            )
    
    # AAB faylni asosiy papkaga ko'chirish
    aab_dir = "aab_files"
    os.makedirs(aab_dir, exist_ok=True)
    
    filename = f"{package_name}_{version_code or 'unknown'}.aab"
    file_path = os.path.join(aab_dir, filename)
    
    # Eski faylni o'chirish (agar mavjud bo'lsa)
    if os.path.exists(file_path):
        os.remove(file_path)
    
    # Yangi faylni ko'chirish
    os.rename(temp_path, file_path)
    
    # DB'ni yangilash
    app.aab_file_path = file_path
    app.aab_version_code = version_code
    app.aab_version_name = version_name
    app.aab_uploaded_at = datetime.utcnow()
    
    db.commit()
    
    # Fayl hajmini aniqlash
    file_size = os.path.getsize(file_path)
    file_size_mb = round(file_size / (1024 * 1024), 2)
    
    return {
        "message": "AAB fayli muvaffaqiyatli yuklandi",
        "filename": filename,
        "version_code": version_code,
        "version_name": version_name,
        "file_size_mb": file_size_mb,
        "uploaded_at": app.aab_uploaded_at,
        "auto_detected": version_info.get('success', False),
        "package_validated": version_info.get('package_name') == package_name if version_info.get('package_name') else False
    }

@app.post("/api/graphics/upload")
async def upload_graphic(
    package_name: str = Form(...),
    service_account_id: int = Form(...),
    language: str = Form(...),
    graphic_type: str = Form(...),
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    service_account = db.query(models.ServiceAccount).filter(
        models.ServiceAccount.id == service_account_id,
        models.ServiceAccount.user_id == current_user.id
    ).first()
    
    if not service_account:
        raise HTTPException(status_code=404, detail="Service account not found")
    
    allowed_types = {
        'icon': (512, 512),
        'featureGraphic': (1024, 500),
        'phoneScreenshots': None,
        'sevenInchScreenshots': None,
        'tenInchScreenshots': None
    }
    
    if graphic_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid graphic type")
    
    os.makedirs("uploads", exist_ok=True)
    file_path = f"uploads/{current_user.id}_{package_name}_{graphic_type}_{file.filename}"
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fayl saqlashda xatolik: {str(e)}")
    
    # Avtomatik crop + resize
    required_size = allowed_types[graphic_type]
    resized = False
    if required_size:
        try:
            img = Image.open(file_path)
            if img.mode == 'RGBA':
                img = img.convert('RGB')
            
            if img.size != required_size:
                target_w, target_h = required_size
                target_ratio = target_w / target_h
                img_ratio = img.width / img.height
                
                # Crop: eng kerakli qismini kesish (markazdan)
                if img_ratio > target_ratio:
                    # Keng rasm — ikki yonidan kesish
                    new_w = int(img.height * target_ratio)
                    left = (img.width - new_w) // 2
                    img = img.crop((left, 0, left + new_w, img.height))
                elif img_ratio < target_ratio:
                    # Uzun rasm — tepadan-pastdan kesish
                    new_h = int(img.width / target_ratio)
                    top = (img.height - new_h) // 2
                    img = img.crop((0, top, img.width, top + new_h))
                
                # Resize
                img = img.resize(required_size, Image.LANCZOS)
                img.save(file_path, 'PNG')
                resized = True
        except Exception as e:
            if os.path.exists(file_path):
                os.remove(file_path)
            raise HTTPException(status_code=400, detail=f"Rasm o'qishda xatolik: {str(e)}")
    
    # DB'da saqlash (Google Play'ga yubormasdan ham)
    app_record = db.query(models.App).filter(
        models.App.package_name == package_name
    ).first()
    
    if app_record:
        # Eski grafikani o'chirish
        old_graphic = db.query(models.Graphic).filter(
            models.Graphic.app_id == app_record.id,
            models.Graphic.graphic_type == graphic_type
        ).first()
        if old_graphic and graphic_type != 'phoneScreenshots':
            if os.path.exists(old_graphic.file_path):
                os.remove(old_graphic.file_path)
            db.delete(old_graphic)
        
        graphic = models.Graphic(
            app_id=app_record.id,
            graphic_type=graphic_type,
            file_path=file_path
        )
        db.add(graphic)
        db.commit()
    
    # Google Play'ga yuklash
    try:
        api = GooglePlayAPI(service_account.json_key_path)
        success = api.upload_image(package_name, language, graphic_type, file_path)
        
        resize_msg = " (avtomatik kesildi)" if resized else ""
        if success:
            return {"message": f"Rasm yuklandi!{resize_msg}", "path": file_path, "uploaded_to_play": True, "resized": resized}
        else:
            return {"message": f"Rasm saqlandi{resize_msg} (Play'ga yuklash muvaffaqiyatsiz)", "path": file_path, "uploaded_to_play": False, "resized": resized}
    except Exception as e:
        return {"message": f"Rasm saqlandi{' (kesildi)' if resized else ''} (Play xatolik: {str(e)[:80]})", "path": file_path, "uploaded_to_play": False, "resized": resized}

@app.delete("/api/graphics/delete/{graphic_id}")
def delete_graphic(
    graphic_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Rasmni o'chirish"""
    graphic = db.query(models.Graphic).filter(
        models.Graphic.id == graphic_id
    ).first()
    
    if not graphic:
        raise HTTPException(status_code=404, detail="Rasm topilmadi")
    
    # Faylni o'chirish
    if os.path.exists(graphic.file_path):
        os.remove(graphic.file_path)
    
    db.delete(graphic)
    db.commit()
    
    return {"message": "Rasm o'chirildi"}

@app.get("/api/graphics/list/{app_id}")
def get_graphics(
    app_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Ilovaning barcha rasmlarini olish"""
    graphics = db.query(models.Graphic).filter(
        models.Graphic.app_id == app_id
    ).all()
    
    return [{
        "id": g.id,
        "graphic_type": g.graphic_type,
        "file_path": g.file_path,
        "url": f"/{g.file_path}",
        "uploaded_at": g.uploaded_at
    } for g in graphics]

@app.post("/api/templates")
def create_template(
    template: TemplateCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    new_template = models.Template(
        user_id=current_user.id,
        name=template.name,
        title=template.title,
        short_description=template.short_description,
        full_description=template.full_description
    )
    db.add(new_template)
    db.commit()
    db.refresh(new_template)
    
    return {
        "id": new_template.id,
        "name": new_template.name,
        "created_at": new_template.created_at
    }

@app.get("/api/templates")
def get_templates(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    templates = db.query(models.Template).filter(
        models.Template.user_id == current_user.id
    ).all()
    
    return [{
        "id": t.id,
        "name": t.name,
        "title": t.title,
        "short_description": t.short_description,
        "full_description": t.full_description,
        "created_at": t.created_at
    } for t in templates]

@app.get("/")
def read_root():
    return {"message": "Play Console Automation API"}

@app.post("/api/testing/add-testers")
def add_testers(
    data: dict,
    service_account_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Test track'ga testerlar qo'shish"""
    service_account = db.query(models.ServiceAccount).filter(
        models.ServiceAccount.id == service_account_id,
        models.ServiceAccount.user_id == current_user.id
    ).first()
    
    if not service_account:
        raise HTTPException(status_code=404, detail="Service account not found")
    
    try:
        api = GooglePlayAPI(service_account.json_key_path)
        
        package_name = data.get('package_name')
        emails = data.get('emails', [])
        track = data.get('track', 'internal')
        
        if not package_name:
            raise HTTPException(status_code=400, detail="Package name kerak")
        if not emails:
            raise HTTPException(status_code=400, detail="Kamida bitta email kerak")
        
        result = api.add_testers(package_name, emails, track)
        
        if result.get('success'):
            return {
                "message": f"{result['added_count']} ta tester qo'shildi",
                "added_count": result['added_count'],
                "emails": result['emails'],
                "track": track,
                "test_link": api.get_test_link(package_name, track)
            }
        else:
            raise HTTPException(status_code=500, detail=result.get('error', 'Tester qo\'shishda xatolik'))
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/testing/create-release")
def create_test_release(
    package_name: str,
    track: str = 'internal',
    release_notes: str = 'Test release',
    service_account_id: int = None,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Test release yaratish"""
    service_account = db.query(models.ServiceAccount).filter(
        models.ServiceAccount.id == service_account_id,
        models.ServiceAccount.user_id == current_user.id
    ).first()
    
    if not service_account:
        raise HTTPException(status_code=404, detail="Service account not found")
    
    # Ilovani topish
    app_record = db.query(models.App).filter(
        models.App.package_name == package_name,
        models.App.service_account_id == service_account_id
    ).first()
    
    if not app_record or not app_record.aab_file_path:
        raise HTTPException(status_code=404, detail="AAB file not found")
    
    try:
        api = GooglePlayAPI(service_account.json_key_path)
        
        result = api.create_test_release(
            package_name,
            app_record.aab_file_path,
            app_record.aab_version_name,
            app_record.aab_version_code,
            track,
            release_notes
        )
        
        if result['success']:
            # App status'ni yangilash
            app_record.status = 'test'
            db.commit()
            
            return result
        else:
            raise HTTPException(status_code=500, detail=result.get('error', 'Failed to create release'))
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/testing/link")
def get_test_link(
    package_name: str,
    track: str = 'internal',
    service_account_id: int = None,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Test link olish"""
    service_account = db.query(models.ServiceAccount).filter(
        models.ServiceAccount.id == service_account_id,
        models.ServiceAccount.user_id == current_user.id
    ).first()
    
    if not service_account:
        raise HTTPException(status_code=404, detail="Service account not found")
    
    try:
        api = GooglePlayAPI(service_account.json_key_path)
        link = api.get_test_link(package_name, track)
        
        return {
            "test_link": link,
            "track": track,
            "package_name": package_name
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/testing/track-status")
def get_track_status(
    package_name: str,
    service_account_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Ilovaning test track holati - test ruxsati bormi?"""
    service_account = db.query(models.ServiceAccount).filter(
        models.ServiceAccount.id == service_account_id,
        models.ServiceAccount.user_id == current_user.id
    ).first()
    
    if not service_account:
        raise HTTPException(status_code=404, detail="Service account not found")
    
    try:
        api = GooglePlayAPI(service_account.json_key_path)
        result = api.get_track_status(package_name)
        
        # DB'da app status'ni yangilash
        app_record = db.query(models.App).filter(
            models.App.package_name == package_name,
            models.App.service_account_id == service_account_id
        ).first()
        
        if app_record:
            if result.get('has_production') and result['tracks'].get('production', {}).get('has_active'):
                app_record.status = 'live'
            elif any(result['tracks'].get(t, {}).get('has_active') for t in ['internal', 'alpha', 'beta']):
                app_record.status = 'test'
            db.commit()
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/testing/stats")
def get_app_stats(
    package_name: str,
    service_account_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Ilova statistikasi - reviewlar, rating"""
    service_account = db.query(models.ServiceAccount).filter(
        models.ServiceAccount.id == service_account_id,
        models.ServiceAccount.user_id == current_user.id
    ).first()
    
    if not service_account:
        raise HTTPException(status_code=404, detail="Service account not found")
    
    try:
        api = GooglePlayAPI(service_account.json_key_path)
        return api.get_app_stats(package_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

## ===================== ADMIN PANEL ===================== ##

def require_admin(current_user: models.User = Depends(auth.get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin ruxsati kerak")
    return current_user

@app.on_event("startup")
def startup():
    # Run database migrations
    import sqlite3
    db_path = "data/play_deploy.db"
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("PRAGMA table_info(apps)")
    columns = [col[1] for col in cursor.fetchall()]
    
    columns_to_add = [
        ("aab_file_path", "TEXT"),
        ("aab_version_code", "INTEGER"),
        ("aab_version_name", "TEXT"),
        ("aab_uploaded_at", "DATETIME"),
        ("status", "TEXT DEFAULT 'draft'"),
        ("draft_title", "TEXT"),
        ("draft_short_description", "TEXT"),
        ("draft_full_description", "TEXT"),
        ("draft_language", "TEXT DEFAULT 'en'"),
        ("draft_updated_at", "DATETIME"),
        ("default_language", "TEXT DEFAULT 'en-US'"),
        ("contact_email", "TEXT"),
    ]
    
    for col_name, col_type in columns_to_add:
        if col_name not in columns:
            cursor.execute(f"ALTER TABLE apps ADD COLUMN {col_name} {col_type}")
            conn.commit()
    
    conn.close()
    
    # Create admin user
    db = next(get_db())
    admin = db.query(models.User).filter(models.User.email == "kaxorovorif6@gmail.com").first()
    if admin:
        admin.is_admin = True
        db.commit()
    else:
        admin = models.User(
            email="kaxorovorif6@gmail.com",
            hashed_password=auth.get_password_hash("azam_770"),
            full_name="Admin",
            is_admin=True
        )
        db.add(admin)
        db.commit()
    db.close()

@app.get("/api/admin/stats")
def admin_stats(admin: models.User = Depends(require_admin), db: Session = Depends(get_db)):
    total_users = db.query(models.User).count()
    total_apps = db.query(models.App).count()
    total_accounts = db.query(models.ServiceAccount).count()
    total_listings = db.query(models.Listing).count()
    total_graphics = db.query(models.Graphic).count()
    total_tickets = db.query(models.SupportTicket).count()
    open_tickets = db.query(models.SupportTicket).filter(models.SupportTicket.status.in_(['open', 'in_progress'])).count()
    
    # Oxirgi 7 kun foydalanuvchilar
    from datetime import datetime, timedelta
    week_ago = datetime.utcnow() - timedelta(days=7)
    new_users_week = db.query(models.User).filter(models.User.created_at >= week_ago).count()
    
    # Status bo'yicha app'lar
    draft_apps = db.query(models.App).filter(models.App.status == 'draft').count()
    review_apps = db.query(models.App).filter(models.App.status == 'review').count()
    
    return {
        "total_users": total_users,
        "total_apps": total_apps,
        "total_service_accounts": total_accounts,
        "total_listings": total_listings,
        "total_graphics": total_graphics,
        "total_tickets": total_tickets,
        "open_tickets": open_tickets,
        "new_users_week": new_users_week,
        "draft_apps": draft_apps,
        "review_apps": review_apps
    }

@app.get("/api/admin/users")
def admin_users(admin: models.User = Depends(require_admin), db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    result = []
    for u in users:
        sa_count = db.query(models.ServiceAccount).filter(models.ServiceAccount.user_id == u.id).count()
        app_count = db.query(models.App).join(models.ServiceAccount).filter(models.ServiceAccount.user_id == u.id).count()
        result.append({
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "is_admin": u.is_admin or False,
            "is_active": u.is_active if hasattr(u, 'is_active') and u.is_active is not None else True,
            "created_at": str(u.created_at),
            "service_accounts": sa_count,
            "apps": app_count
        })
    return result

@app.get("/api/admin/apps")
def admin_apps(admin: models.User = Depends(require_admin), db: Session = Depends(get_db)):
    apps = db.query(models.App).all()
    result = []
    for a in apps:
        sa = db.query(models.ServiceAccount).filter(models.ServiceAccount.id == a.service_account_id).first()
        owner = db.query(models.User).filter(models.User.id == sa.user_id).first() if sa else None
        graphic_count = db.query(models.Graphic).filter(models.Graphic.app_id == a.id).count()
        listing_count = db.query(models.Listing).filter(models.Listing.app_id == a.id).count()
        result.append({
            "id": a.id,
            "package_name": a.package_name,
            "app_name": a.app_name,
            "status": a.status,
            "default_language": a.default_language,
            "has_aab": bool(a.aab_file_path),
            "graphics": graphic_count,
            "listings": listing_count,
            "owner_email": owner.email if owner else "N/A",
            "created_at": str(a.last_synced) if a.last_synced else None
        })
    return result

@app.put("/api/admin/users/{user_id}")
def admin_update_user(user_id: int, data: dict, admin: models.User = Depends(require_admin), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi")
    if 'is_active' in data:
        user.is_active = data['is_active']
    if 'is_admin' in data:
        user.is_admin = data['is_admin']
    if 'full_name' in data:
        user.full_name = data['full_name']
    db.commit()
    return {"success": True}

@app.delete("/api/admin/users/{user_id}")
def admin_delete_user(user_id: int, admin: models.User = Depends(require_admin), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi")
    if user.is_admin:
        raise HTTPException(status_code=400, detail="Admin'ni o'chirib bo'lmaydi")
    db.delete(user)
    db.commit()
    return {"success": True}

## ===================== SUPPORT TIZIMI ===================== ##

@app.post("/api/support/tickets")
def create_ticket(data: dict, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    ticket = models.SupportTicket(
        user_id=current_user.id,
        subject=data.get('subject', ''),
        category=data.get('category', 'general'),
        priority=data.get('priority', 'medium')
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    
    # Birinchi xabar
    if data.get('message'):
        msg = models.SupportMessage(
            ticket_id=ticket.id,
            sender_id=current_user.id,
            message=data['message'],
            is_admin=current_user.is_admin or False
        )
        db.add(msg)
        db.commit()
    
    return {"id": ticket.id, "status": ticket.status}

@app.get("/api/support/tickets")
def get_tickets(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    if current_user.is_admin:
        tickets = db.query(models.SupportTicket).order_by(models.SupportTicket.updated_at.desc()).all()
    else:
        tickets = db.query(models.SupportTicket).filter(
            models.SupportTicket.user_id == current_user.id
        ).order_by(models.SupportTicket.updated_at.desc()).all()
    
    result = []
    for t in tickets:
        user = db.query(models.User).filter(models.User.id == t.user_id).first()
        msg_count = db.query(models.SupportMessage).filter(models.SupportMessage.ticket_id == t.id).count()
        last_msg = db.query(models.SupportMessage).filter(models.SupportMessage.ticket_id == t.id).order_by(models.SupportMessage.created_at.desc()).first()
        result.append({
            "id": t.id,
            "subject": t.subject,
            "status": t.status,
            "priority": t.priority,
            "category": t.category,
            "user_email": user.email if user else "",
            "user_name": user.full_name or user.email if user else "",
            "message_count": msg_count,
            "last_message": last_msg.message[:80] if last_msg else "",
            "last_message_admin": last_msg.is_admin if last_msg else False,
            "created_at": str(t.created_at),
            "updated_at": str(t.updated_at)
        })
    return result

@app.get("/api/support/tickets/{ticket_id}")
def get_ticket(ticket_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    ticket = db.query(models.SupportTicket).filter(models.SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket topilmadi")
    if not current_user.is_admin and ticket.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Ruxsat yo'q")
    
    user = db.query(models.User).filter(models.User.id == ticket.user_id).first()
    messages = []
    for m in ticket.messages:
        sender = db.query(models.User).filter(models.User.id == m.sender_id).first()
        messages.append({
            "id": m.id,
            "message": m.message,
            "is_admin": m.is_admin,
            "sender_email": sender.email if sender else "",
            "sender_name": sender.full_name or sender.email if sender else "",
            "created_at": str(m.created_at)
        })
    
    return {
        "id": ticket.id,
        "subject": ticket.subject,
        "status": ticket.status,
        "priority": ticket.priority,
        "category": ticket.category,
        "user_email": user.email if user else "",
        "created_at": str(ticket.created_at),
        "messages": messages
    }

@app.post("/api/support/tickets/{ticket_id}/messages")
def add_message(ticket_id: int, data: dict, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    ticket = db.query(models.SupportTicket).filter(models.SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket topilmadi")
    if not current_user.is_admin and ticket.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Ruxsat yo'q")
    
    msg = models.SupportMessage(
        ticket_id=ticket_id,
        sender_id=current_user.id,
        message=data.get('message', ''),
        is_admin=current_user.is_admin or False
    )
    db.add(msg)
    
    if current_user.is_admin and ticket.status == 'open':
        ticket.status = 'in_progress'
    
    db.commit()
    return {"success": True}

@app.put("/api/support/tickets/{ticket_id}/status")
def update_ticket_status(ticket_id: int, data: dict, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    ticket = db.query(models.SupportTicket).filter(models.SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket topilmadi")
    if not current_user.is_admin and ticket.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Ruxsat yo'q")
    
    ticket.status = data.get('status', ticket.status)
    db.commit()
    return {"success": True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
