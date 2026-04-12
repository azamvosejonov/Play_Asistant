from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
import json
from typing import List, Dict, Optional

SCOPES = ['https://www.googleapis.com/auth/androidpublisher']

class GooglePlayAPI:
    def __init__(self, json_key_path: str):
        self.credentials = service_account.Credentials.from_service_account_file(
            json_key_path, scopes=SCOPES
        )
        self.service = build('androidpublisher', 'v3', credentials=self.credentials)
    
    def list_apps(self, package_names: List[str] = None) -> List[Dict]:
        """
        Google Play API da barcha ilovalarni olish uchun API yo'q.
        Package name'lar berilsa, ularning ma'lumotlarini qaytaradi.
        """
        if not package_names:
            return []
        
        apps = []
        for package_name in package_names:
            try:
                # Edit yaratib ko'ramiz - agar package'ga kirish borsa, ishlaydi
                edit = self._create_edit(package_name)
                
                # App details olish
                try:
                    details = self.service.edits().details().get(
                        packageName=package_name,
                        editId=edit['id']
                    ).execute()
                    
                    app_info = {
                        'packageName': package_name,
                        'title': details.get('defaultLanguage', package_name),
                        'contactEmail': details.get('contactEmail', ''),
                        'contactPhone': details.get('contactPhone', ''),
                    }
                    apps.append(app_info)
                except Exception as e:
                    # Agar details olish muvaffaqiyatsiz bo'lsa, faqat package name'ni qo'shamiz
                    apps.append({
                        'packageName': package_name,
                        'title': package_name
                    })
                finally:
                    # Edit'ni yopamiz
                    try:
                        self.service.edits().delete(
                            packageName=package_name,
                            editId=edit['id']
                        ).execute()
                    except:
                        pass
                        
            except Exception as e:
                print(f"Error accessing package {package_name}: {e}")
                continue
        
        return apps
    
    def verify_access(self, package_name: str) -> bool:
        """
        Package name'ga kirish borligini tekshiradi
        """
        try:
            edit = self._create_edit(package_name)
            self.service.edits().delete(
                packageName=package_name,
                editId=edit['id']
            ).execute()
            return True
        except Exception as e:
            print(f"No access to {package_name}: {e}")
            return False
    
    def get_app_details(self, package_name: str) -> Optional[Dict]:
        try:
            edit = self._create_edit(package_name)
            details = self.service.edits().details().get(
                packageName=package_name,
                editId=edit['id']
            ).execute()
            self._commit_edit(package_name, edit['id'])
            return details
        except Exception as e:
            print(f"Error getting app details: {e}")
            return None
    
    def update_listing(self, package_name: str, language: str, 
                      title: str = None, short_desc: str = None, 
                      full_desc: str = None) -> bool:
        try:
            edit = self._create_edit(package_name)
            
            listing_data = {}
            if title:
                listing_data['title'] = title[:30]
            if short_desc:
                listing_data['shortDescription'] = short_desc[:80]
            if full_desc:
                listing_data['fullDescription'] = full_desc[:4000]
            
            self.service.edits().listings().update(
                packageName=package_name,
                editId=edit['id'],
                language=language,
                body=listing_data
            ).execute()
            
            self._commit_edit(package_name, edit['id'])
            return True
        except Exception as e:
            print(f"Error updating listing: {e}")
            return False
    
    def upload_image(self, package_name: str, language: str, 
                    image_type: str, image_path: str) -> bool:
        try:
            edit = self._create_edit(package_name)
            
            media = MediaFileUpload(image_path, mimetype='image/png', resumable=True)
            
            if image_type == 'icon':
                self.service.edits().images().upload(
                    packageName=package_name,
                    editId=edit['id'],
                    language=language,
                    imageType='icon',
                    media_body=media
                ).execute()
            elif image_type == 'featureGraphic':
                self.service.edits().images().upload(
                    packageName=package_name,
                    editId=edit['id'],
                    language=language,
                    imageType='featureGraphic',
                    media_body=media
                ).execute()
            elif image_type in ['phoneScreenshots', 'sevenInchScreenshots', 'tenInchScreenshots']:
                self.service.edits().images().upload(
                    packageName=package_name,
                    editId=edit['id'],
                    language=language,
                    imageType=image_type,
                    media_body=media
                ).execute()
            
            self._commit_edit(package_name, edit['id'])
            return True
        except Exception as e:
            print(f"Error uploading image: {e}")
            return False
    
    def submit_all(self, package_name: str, language: str,
                   title: str = None, short_desc: str = None,
                   full_desc: str = None, graphics: list = None,
                   contact_email: str = None, contact_phone: str = None,
                   contact_website: str = None) -> Dict:
        """Bitta edit ichida hamma narsani qilish:
        1. Contact details (email, phone, website)
        2. Eski rasmlarni o'chirish
        3. Listing yangilash
        4. Yangi rasmlarni yuklash
        5. Commit
        """
        import os
        results = {
            'listing_updated': False,
            'details_updated': False,
            'graphics_uploaded': 0,
            'graphics_failed': 0,
            'graphics_cleared': [],
            'errors': []
        }
        
        try:
            edit = self._create_edit(package_name)
            edit_id = edit['id']
            
            # 1. Contact details yangilash
            try:
                details_body = {}
                if contact_email:
                    details_body['contactEmail'] = contact_email
                if contact_phone:
                    details_body['contactPhone'] = contact_phone
                if contact_website:
                    details_body['contactWebsite'] = contact_website
                details_body['defaultLanguage'] = language
                
                self.service.edits().details().update(
                    packageName=package_name,
                    editId=edit_id,
                    body=details_body
                ).execute()
                results['details_updated'] = True
            except Exception as e:
                results['errors'].append(f"Details: {str(e)[:150]}")
            
            # 2. Listing yangilash
            try:
                listing_data = {}
                if title:
                    listing_data['title'] = title[:30]
                if short_desc:
                    listing_data['shortDescription'] = short_desc[:80]
                if full_desc:
                    listing_data['fullDescription'] = full_desc[:4000]
                
                if listing_data:
                    self.service.edits().listings().update(
                        packageName=package_name,
                        editId=edit_id,
                        language=language,
                        body=listing_data
                    ).execute()
                    results['listing_updated'] = True
            except Exception as e:
                results['errors'].append(f"Listing: {str(e)[:200]}")
            
            # 3. Grafikalar — avval eski rasmlarni o'chirish, keyin yangilarini yuklash
            if graphics:
                # Qaysi turlar yuborilayapti
                graphic_types = set(g_type for g_type, _ in graphics)
                
                for g_type in graphic_types:
                    try:
                        self.service.edits().images().deleteall(
                            packageName=package_name,
                            editId=edit_id,
                            language=language,
                            imageType=g_type
                        ).execute()
                        results['graphics_cleared'].append(g_type)
                    except Exception as e:
                        # Eski rasm yo'q bo'lsa ham xato emas
                        pass
                
                # Yangi rasmlarni yuklash
                for g_type, g_path in graphics:
                    try:
                        if not os.path.exists(g_path):
                            results['errors'].append(f"{g_type}: fayl topilmadi")
                            results['graphics_failed'] += 1
                            continue
                        
                        mime = 'image/png'
                        if g_path.lower().endswith(('.jpg', '.jpeg')):
                            mime = 'image/jpeg'
                        elif g_path.lower().endswith('.webp'):
                            mime = 'image/webp'
                        
                        media = MediaFileUpload(g_path, mimetype=mime, resumable=True)
                        
                        self.service.edits().images().upload(
                            packageName=package_name,
                            editId=edit_id,
                            language=language,
                            imageType=g_type,
                            media_body=media
                        ).execute()
                        results['graphics_uploaded'] += 1
                    except Exception as e:
                        results['graphics_failed'] += 1
                        results['errors'].append(f"{g_type}: {str(e)[:100]}")
            
            # 4. Commit
            self._commit_edit(package_name, edit_id)
            results['committed'] = True
            
        except Exception as e:
            results['errors'].append(f"Edit: {str(e)[:200]}")
            results['committed'] = False
        
        return results
    
    def create_release_and_submit(self, package_name: str, aab_path: str,
                                   track: str = 'internal',
                                   release_notes: str = 'Release',
                                   language: str = 'en-US',
                                   tester_emails: list = None,
                                   countries: list = None) -> Dict:
        """AAB yuklash, release yaratish, testerlar qo'shish va commit — bitta edit ichida"""
        import os
        results = {
            'aab_uploaded': False,
            'release_created': False,
            'testers_added': False,
            'committed': False,
            'version_code': None,
            'errors': []
        }
        
        if not aab_path or not os.path.exists(aab_path):
            results['errors'].append('AAB fayl topilmadi')
            return results
        
        try:
            edit = self._create_edit(package_name)
            edit_id = edit['id']
            
            # 1. AAB yuklash
            try:
                media = MediaFileUpload(aab_path, mimetype='application/octet-stream')
                upload = self.service.edits().bundles().upload(
                    packageName=package_name,
                    editId=edit_id,
                    media_body=media
                ).execute()
                results['version_code'] = upload.get('versionCode')
                results['aab_uploaded'] = True
            except Exception as e:
                results['errors'].append(f"AAB upload: {str(e)[:200]}")
                # AAB yuklanmasa davom etish ma'nosiz
                try:
                    self.service.edits().delete(packageName=package_name, editId=edit_id).execute()
                except:
                    pass
                return results
            
            # 2. Track update — release yaratish
            try:
                vc = results['version_code']
                release_body = {
                    'releases': [{
                        'versionCodes': [str(vc)],
                        'status': 'completed',
                        'releaseNotes': [{'language': language, 'text': release_notes}]
                    }]
                }
                
                self.service.edits().tracks().update(
                    packageName=package_name,
                    editId=edit_id,
                    track=track,
                    body=release_body
                ).execute()
                results['release_created'] = True
            except Exception as e:
                results['errors'].append(f"Release: {str(e)[:200]}")
            
            # 3. Testerlar qo'shish
            if tester_emails:
                try:
                    self.service.edits().testers().update(
                        packageName=package_name,
                        editId=edit_id,
                        track=track,
                        body={
                            'googleGroups': [],
                            'googlePlusCommunities': [],
                        }
                    ).execute()
                    results['testers_added'] = True
                except Exception as e:
                    results['errors'].append(f"Testers: {str(e)[:100]}")
            
            # 4. Commit
            self._commit_edit(package_name, edit_id)
            results['committed'] = True
            
        except Exception as e:
            results['errors'].append(f"Edit: {str(e)[:200]}")
            results['committed'] = False
        
        return results

    def get_listings(self, package_name: str) -> Dict:
        try:
            edit = self._create_edit(package_name)
            listings = self.service.edits().listings().list(
                packageName=package_name,
                editId=edit['id']
            ).execute()
            try:
                self.service.edits().delete(
                    packageName=package_name,
                    editId=edit['id']
                ).execute()
            except:
                pass
            return listings
        except Exception as e:
            print(f"Error getting listings: {e}")
            return {}
    
    def _create_edit(self, package_name: str) -> Dict:
        return self.service.edits().insert(
            packageName=package_name,
            body={}
        ).execute()
    
    def _commit_edit(self, package_name: str, edit_id: str):
        self.service.edits().commit(
            packageName=package_name,
            editId=edit_id
        ).execute()
    
    def add_testers(self, package_name: str, emails: List[str], track: str = 'internal') -> Dict:
        """Internal/Closed test track'ga testerlar qo'shish"""
        try:
            edit_id = self._create_edit(package_name)
            
            # Mavjud testerlarni olish
            try:
                current_testers = self.service.edits().testers().get(
                    packageName=package_name,
                    editId=edit_id['id'],
                    track=track
                ).execute()
                existing_emails = current_testers.get('googleGroups', []) + current_testers.get('googlePlusCommunities', [])
            except:
                current_testers = {}
            
            # Yangi email'larni qo'shish
            all_emails = list(set(emails))
            
            # Testers update
            self.service.edits().testers().update(
                packageName=package_name,
                editId=edit_id['id'],
                track=track,
                body={
                    'googleGroups': [],
                    'googlePlusCommunities': [],
                    'testers': [{'emailAddress': email} for email in all_emails]
                }
            ).execute()
            
            self._commit_edit(package_name, edit_id['id'])
            
            return {
                'success': True,
                'added_count': len(all_emails),
                'emails': all_emails
            }
        except Exception as e:
            print(f"Error adding testers: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_track_status(self, package_name: str) -> Dict:
        """Barcha track'lar holatini tekshirish"""
        result = {
            'has_internal': False,
            'has_alpha': False,
            'has_beta': False,
            'has_production': False,
            'tracks': {},
            'test_allowed': False
        }
        try:
            edit = self._create_edit(package_name)
            
            tracks = self.service.edits().tracks().list(
                packageName=package_name,
                editId=edit['id']
            ).execute()
            
            for t in tracks.get('tracks', []):
                track_name = t.get('track', '')
                releases = t.get('releases', [])
                active_releases = [r for r in releases if r.get('status') in ['completed', 'inProgress', 'halted']]
                
                track_info = {
                    'releases': [],
                    'has_active': len(active_releases) > 0
                }
                
                for r in releases:
                    track_info['releases'].append({
                        'status': r.get('status', 'unknown'),
                        'version_codes': r.get('versionCodes', []),
                        'name': r.get('name', ''),
                    })
                
                result['tracks'][track_name] = track_info
                
                if track_name == 'internal':
                    result['has_internal'] = True
                elif track_name == 'alpha':
                    result['has_alpha'] = True
                elif track_name == 'beta':
                    result['has_beta'] = True
                elif track_name == 'production':
                    result['has_production'] = True
            
            # Test ruxsat bor - agar kamida bitta track'da active release bo'lsa YOKI
            # edit yaratish mumkin bo'lsa (ya'ni ilovaga kirish bor)
            result['test_allowed'] = True
            
            self.service.edits().delete(
                packageName=package_name,
                editId=edit['id']
            ).execute()
            
        except Exception as e:
            print(f"Error getting track status: {str(e)}")
            result['error'] = str(e)
        
        return result
    
    def get_test_link(self, package_name: str, track: str = 'internal') -> str:
        """Test link"""
        if track == 'internal':
            return f"https://play.google.com/apps/internaltest/{package_name}"
        elif track == 'alpha':
            return f"https://play.google.com/apps/testing/{package_name}"
        elif track == 'beta':
            return f"https://play.google.com/apps/testing/{package_name}"
        else:
            return f"https://play.google.com/store/apps/details?id={package_name}"
    
    def get_testers(self, package_name: str, track: str = 'internal') -> Dict:
        """Mavjud testerlarni olish"""
        try:
            edit = self._create_edit(package_name)
            testers = self.service.edits().testers().get(
                packageName=package_name,
                editId=edit['id'],
                track=track
            ).execute()
            self.service.edits().delete(
                packageName=package_name,
                editId=edit['id']
            ).execute()
            return {
                'success': True,
                'testers': testers.get('googleGroups', []),
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def get_app_stats(self, package_name: str) -> Dict:
        """Ilova statistikasi - reviews orqali"""
        try:
            reviews = self.service.reviews().list(
                packageName=package_name
            ).execute()
            
            review_list = reviews.get('reviews', [])
            total_reviews = len(review_list)
            avg_rating = 0
            if total_reviews > 0:
                ratings = [r.get('comments', [{}])[0].get('userComment', {}).get('starRating', 0) for r in review_list]
                avg_rating = sum(ratings) / len(ratings) if ratings else 0
            
            return {
                'success': True,
                'total_reviews': total_reviews,
                'average_rating': round(avg_rating, 1),
                'reviews': [{
                    'author': r.get('authorName', 'Anonim'),
                    'rating': r.get('comments', [{}])[0].get('userComment', {}).get('starRating', 0),
                    'text': r.get('comments', [{}])[0].get('userComment', {}).get('text', ''),
                    'date': r.get('comments', [{}])[0].get('userComment', {}).get('lastModified', {}).get('seconds', 0),
                } for r in review_list[:20]]
            }
        except Exception as e:
            print(f"Error getting stats: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'total_reviews': 0,
                'average_rating': 0,
                'reviews': []
            }
    
    def create_test_release(self, package_name: str, aab_file_path: str, 
                          version_name: str, version_code: int, 
                          track: str = 'internal', release_notes: str = 'Test') -> Dict:
        """Test release"""
        try:
            edit = self._create_edit(package_name)
            
            media = MediaFileUpload(aab_file_path, mimetype='application/octet-stream')
            upload = self.service.edits().bundles().upload(
                packageName=package_name,
                editId=edit['id'],
                media_body=media
            ).execute()
            
            vc = upload.get('versionCode', version_code)
            
            self.service.edits().tracks().update(
                packageName=package_name,
                editId=edit['id'],
                track=track,
                body={
                    'releases': [{
                        'versionCodes': [str(vc)],
                        'status': 'completed',
                        'releaseNotes': [{'language': 'en-US', 'text': release_notes}]
                    }]
                }
            ).execute()
            
            self._commit_edit(package_name, edit['id'])
            
            return {
                'success': True,
                'version_code': vc,
                'track': track,
                'test_link': self.get_test_link(package_name, track)
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
