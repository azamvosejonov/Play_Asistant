# 📚 Batafsil O'rnatish va Sozlash Qo'llanmasi

## 1. Google Cloud Console Sozlash

### 1.1 Loyiha Yaratish
1. [Google Cloud Console](https://console.cloud.google.com/) ga kiring
2. Yuqori chap burchakda loyihalar ro'yxatini oching
3. "New Project" tugmasini bosing
4. Loyiha nomini kiriting (masalan: "play-console-automation")
5. "Create" tugmasini bosing

### 1.2 Google Play Android Developer API'ni Yoqish
1. Chap menuda "APIs & Services" > "Library" ga kiring
2. Qidiruv qatorida "Google Play Android Developer API" ni qidiring
3. API'ga kiring va "Enable" tugmasini bosing
4. API yoqilishini kuting (1-2 daqiqa)

### 1.3 Service Account Yaratish
1. "APIs & Services" > "Credentials" ga kiring
2. "Create Credentials" > "Service Account" ni tanlang
3. Service account ma'lumotlarini kiriting:
   - **Name**: Play Console API Service
   - **ID**: play-console-api (avtomatik generatsiya qilinadi)
   - **Description**: Service account for Play Console automation
4. "Create and Continue" tugmasini bosing
5. Role tanlash: "Project" > "Editor" (yoki kerak bo'lsa boshqa role)
6. "Continue" > "Done" tugmasini bosing

### 1.4 JSON Kalit Yaratish
1. Yaratilgan Service Account'ga kiring
2. "Keys" tabiga o'ting
3. "Add Key" > "Create new key" ni tanlang
4. "JSON" ni tanlang va "Create" tugmasini bosing
5. JSON fayl avtomatik yuklab olinadi
6. **MUHIM**: Bu faylni xavfsiz joyda saqlang!

## 2. Play Console Sozlash

### 2.1 API Access Berish
1. [Google Play Console](https://play.google.com/console) ga kiring
2. "Settings" (Sozlamalar) > "Developer account" > "API access" ga o'ting
3. Google Cloud loyihangizni ulash:
   - Agar loyiha ko'rinmasa, "Link a Google Cloud project" tugmasini bosing
   - Yaratgan loyihangizni tanlang
4. Service Account'ga ruxsat berish:
   - Service Account ro'yxatida sizning account'ingizni toping
   - "Grant access" tugmasini bosing
   - Quyidagi ruxsatlarni bering:
     - **App information**: View
     - **App releases**: View and edit
     - **Store presence**: View and edit
   - "Invite user" tugmasini bosing

### 2.2 Tasdiqlanishni Kutish
- Google email yuboradi
- Service account tasdiqlanishi 24-48 soat vaqt olishi mumkin
- Tasdiqlanganidan keyin API'dan foydalanishingiz mumkin

## 3. Dasturni O'rnatish

### 3.1 Tizim Talablari
- **Python**: 3.8 yoki yuqori
- **Node.js**: 16.x yoki yuqori
- **npm**: 7.x yoki yuqori
- **Git**: So'nggi versiya

Versiyalarni tekshirish:
```bash
python --version
node --version
npm --version
git --version
```

### 3.2 Repository'ni Clone Qilish
```bash
git clone <repository-url>
cd play_deploy
```

### 3.3 Avtomatik O'rnatish
```bash
./start.sh
```

### 3.4 Qo'lda O'rnatish

#### Backend
```bash
cd backend
pip install -r requirements.txt
```

#### Frontend
```bash
cd frontend
npm install
```

## 4. Dasturni Ishga Tushirish

### 4.1 Ikki Terminalni Oching

**Terminal 1 (Backend):**
```bash
cd backend
python app.py
```

Natija:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

Natija:
```
  VITE v5.0.11  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 4.2 Brauzerda Ochish
- Brauzerni oching
- `http://localhost:5173` manzilga kiring
- Dastur ochilishi kerak

## 5. Birinchi Marta Ishlatish

### 5.1 Ro'yxatdan O'tish
1. "Ro'yxatdan o'tish" tugmasini bosing
2. Email va parol kiriting
3. Parolni tasdiqlang
4. "Ro'yxatdan o'tish" tugmasini bosing

### 5.2 Service Account Ulash
1. Avtomatik "Service Account Ulash" sahifasiga yo'naltirilasiz
2. "Account Nomi" kiriting (masalan: "Asosiy Account")
3. "JSON Kalit Fayl" yuzasidagi maydonni bosing
4. Google Cloud'dan yuklab olgan JSON faylni tanlang
5. "Service Account Ulash" tugmasini bosing

### 5.3 Ilovalarni Sinxronlash
1. Dashboard sahifasida "Ilovalarni Sinxronlash" tugmasini bosing
2. Play Console'dagi barcha ilovalar yuklanadi
3. Ilovalar ro'yxati ekranda ko'rinadi

### 5.4 Store Listing Tahrirlash
1. Ilovani tanlang
2. Asosiy tilni belgilang (masalan: English)
3. Ma'lumotlarni kiriting:
   - **Ilova Nomi**: Maksimal 30 belgi
   - **Qisqa Ta'rif**: Maksimal 80 belgi
   - **To'liq Ta'rif**: Maksimal 4000 belgi
4. "Barcha Tillarga Tarjima" tugmasini bosing
5. Grafikalarni yuklang:
   - Ikonka (512x512 px, PNG)
   - Feature Graphic (1024x500 px, PNG)
   - Skrinshotlar (PNG/JPG)
6. "Play Console'ga Yuborish" tugmasini bosing

## 6. Muammolarni Hal Qilish

### Backend ishlamasa:
```bash
cd backend
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
python app.py
```

### Frontend ishlamasa:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Ma'lumotlar bazasini tozalash:
```bash
cd backend
rm play_deploy.db
python app.py
```

### Port band bo'lsa:
Backend uchun (8000 port):
```bash
lsof -ti:8000 | xargs kill -9
```

Frontend uchun (5173 port):
```bash
lsof -ti:5173 | xargs kill -9
```

## 7. Xavfsizlik Maslahatlar

1. **JSON Kalit Faylini Himoyalang**
   - Git'ga yuklamang (.gitignore'da bor)
   - Xavfsiz joyda saqlang
   - Boshqalar bilan baham ko'rmang

2. **Parollarni Mustahkamlang**
   - Kamida 12 belgi
   - Katta-kichik harf, raqam, belgilar

3. **SECRET_KEY'ni O'zgartiring**
   - Production muhitda `backend/auth.py` dagi SECRET_KEY'ni o'zgartiring
   - Tasodifiy, uzun qiymat ishlating

4. **HTTPS Ishlating**
   - Production'da faqat HTTPS orqali kirish

## 8. Production'ga Joylashtirish

### 8.1 Backend (Railway, Render, DigitalOcean)
```bash
# Gunicorn o'rnating
pip install gunicorn

# Ishga tushiring
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app:app
```

### 8.2 Frontend (Vercel, Netlify, GitHub Pages)
```bash
npm run build
# dist/ papkasini deploy qiling
```

### 8.3 Environment Variables
```env
SECRET_KEY=super-secret-random-key-minimum-32-chars
DATABASE_URL=postgresql://user:pass@host:5432/dbname
FRONTEND_URL=https://your-domain.com
```

## 9. Yordam

### Tez-tez so'raladigan savollar:

**S: JSON kalit fayl xato deyilmoqda?**
J: Service Account to'g'ri yaratilganini va Play Console'da ruxsat berilganini tekshiring.

**S: Ilovalar sinxronlanmayapti?**
J: Service Account'ga Play Console'da "Release Manager" roli berilganini tekshiring.

**S: Tarjima ishlamayapti?**
J: Internet ulanishini tekshiring. Google Translate API'da limitlar bo'lishi mumkin.

**S: Rasmlar yuklanmayapti?**
J: Rasm o'lchamlarini tekshiring (Ikonka: 512x512, Feature: 1024x500).

### Qo'shimcha Yordam
- GitHub Issues: [Repository URL]/issues
- Email: support@example.com
- Telegram: @support_username

---

**Muvaffaqiyatlar!** 🚀
