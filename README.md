# 🚀 Play Console Avtomatlashtirish Tizimi

Google Play Developer akkauntidagi ilovalarning metama'lumotlarini (matnlar, tarjimalar, rasmlar) avtomatik ravishda boshqarish, yangilash va yuklash tizimi.

## ✨ Asosiy Funksiyalar

- 🔑 **Avtorizatsiya**: Google Service Account orqali Play Console'ga ulanish
- 📝 **Store Listing Boshqaruvi**: Ilova nomi, qisqa va to'liq ta'rifni tahrirlash
- 🌍 **Avto-Tarjima**: Bir tilda kiritilgan matnlarni 50+ tilga avtomatik tarjima qilish
- 🖼️ **Grafik Yuklash**: Ikonka, Feature Graphic va skrinshotlarni yuklash
- 📂 **Shablonlar**: Ma'lumotlarni shablon sifatida saqlash va qayta ishlatish
- ⚡ **Sinxronizatsiya**: Play Console bilan real-time sinxronlash

## 🛠️ Texnologiyalar

### Backend
- **FastAPI** - Zamonaviy Python web framework
- **SQLAlchemy** - ORM va ma'lumotlar bazasi
- **Google Play Developer API** - Play Console integratsiyasi
- **Google Translate API** - Avtomatik tarjima

### Frontend
- **React** - UI kutubxonasi
- **Vite** - Tezkor development server
- **TailwindCSS** - Zamonaviy styling
- **Lucide React** - Ikonkalar
- **Axios** - HTTP client

## 📋 O'rnatish

### 🐳 Docker bilan (TAVSIYA ETILADI - Eng Oson!)

```bash
# Docker o'rnatish (agar o'rnatilmagan bo'lsa)
./install-docker.sh

# Dasturni ishga tushirish
./docker-start.sh
```

✅ **Tayyor!** Backend va Frontend avtomatik ishga tushadi.
- Frontend: http://localhost:5173
- Backend: http://localhost:8000

Batafsil: [DOCKER.md](DOCKER.md)

---

### 💻 Oddiy O'rnatish (Docker'siz)

### 1. Repository'ni clone qiling

```bash
git clone <repository-url>
cd play_deploy
```

### 2. Backend'ni o'rnating

```bash
cd backend
pip install -r requirements.txt
```

### 3. Frontend'ni o'rnating

```bash
cd ../frontend
npm install
```

## 🚀 Ishga Tushirish

### Backend (Terminal 1)

```bash
cd backend
python app.py
```

Backend http://localhost:8000 da ishga tushadi

### Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

Frontend http://localhost:5173 da ishga tushadi

## 📖 Qanday Ishlatish

### 1. Ro'yxatdan O'tish
- Dasturni oching va email/parol bilan ro'yxatdan o'ting

### 2. Service Account Ulash
- Google Cloud Console'da Service Account yarating
- JSON kalit faylini yuklab oling
- Dasturda "Service Account Ulash" tugmasini bosing
- JSON faylni yuklang

### 3. Ilovalarni Sinxronlash
- "Ilovalarni Sinxronlash" tugmasini bosing
- Play Console'dagi barcha ilovalar yuklanadi

### 4. Store Listing Tahrirlash
- Ilovani tanlang
- Asosiy tilni belgilang
- Ilova nomi, qisqa va to'liq ta'rifni kiriting
- "Barcha Tillarga Tarjima" tugmasini bosing
- Grafikalarni yuklang (ikonka, feature graphic, screenshots)
- "Play Console'ga Yuborish" tugmasini bosing

### 5. Shablon Yaratish
- Ma'lumotlarni to'ldiring
- "Shablon sifatida saqlash" tugmasini bosing
- Keyingi safar bu shablonni ishlatishingiz mumkin

## 🔑 Google Service Account O'rnatish

1. [Google Cloud Console](https://console.cloud.google.com/) ga kiring
2. Yangi loyiha yarating
3. "APIs & Services" > "Enable APIs and Services"
4. "Google Play Android Developer API" ni qidiring va yoqing
5. "Credentials" > "Create Credentials" > "Service Account"
6. Service Account yaratib, JSON kalitni yuklab oling
7. [Play Console](https://play.google.com/console) > "API access" ga kiring
8. Service Account'ga ruxsat bering (Admin yoki Release Manager)

## ⚙️ Konfiguratsiya

### Backend `.env` fayli (ixtiyoriy)

```env
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///./play_deploy.db
```

## 📁 Loyiha Tuzilmasi

```
play_deploy/
├── backend/
│   ├── app.py                 # Asosiy FastAPI server
│   ├── models.py              # Database modellari
│   ├── auth.py                # Autentifikatsiya
│   ├── database.py            # Database konfiguratsiya
│   ├── google_play_api.py     # Play API integratsiyasi
│   ├── translator.py          # Tarjima xizmati
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── pages/            # React sahifalari
│   │   ├── utils/            # Utility funktsiyalar
│   │   ├── App.jsx           # Asosiy App komponenti
│   │   └── main.jsx          # Entry point
│   ├── package.json          # NPM dependencies
│   └── vite.config.js        # Vite konfiguratsiya
└── README.md
```

## ⚠️ Muhim Ogohlantirishlar

### Spam Siyosati
Google Play bir-biriga o'xshash ko'plab ilovalarni spam deb hisoblashi mumkin. Avtomatlashtirishdan to'g'ri foydalaning va sifatli kontent yarating.

### API Limitlar
- Google Play API kunlik so'rovlar limiti: ~200,000
- Google Translate API ham limitlarga ega
- Katta miqdordagi tarjimalar uchun DeepL API ni ko'rib chiqing

### Xavfsizlik
- JSON kalit fayllarini xavfsiz saqlang
- Production muhitida `SECRET_KEY` ni o'zgartiring
- HTTPS ishlatishni unutmang

## 🐛 Debugging

### Backend Loglar
```bash
cd backend
python app.py
```

### Frontend Loglar
```bash
cd frontend
npm run dev
```

## 📝 License

MIT License

## 👨‍💻 Muallif

Play Console Automation System

## 🤝 Hissa Qo'shish

Pull request'lar mamnuniyat bilan qabul qilinadi!

1. Fork qiling
2. Feature branch yarating (`git checkout -b feature/AmazingFeature`)
3. Commit qiling (`git commit -m 'Add some AmazingFeature'`)
4. Push qiling (`git push origin feature/AmazingFeature`)
5. Pull Request oching

## 📞 Yordam

Muammolar yoki savollar bo'lsa, GitHub Issues'da murojaat qiling.

---

**Eslatma**: Bu dastur Google Play Developer API'dan foydalanadi. API'dan foydalanish uchun Google Cloud loyihasi va Service Account kerak.
