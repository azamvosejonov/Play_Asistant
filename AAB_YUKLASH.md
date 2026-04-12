# 📦 AAB Fayl Yuklash - To'liq Qo'llanma

## 🎉 Yangi Funksiya: AAB Upload

Endi dastur orqali **Android App Bundle (.aab)** fayllarini yuklash mumkin!

---

## 🚀 AAB Nima?

**AAB (Android App Bundle)** - Google Play'ga app yuklash uchun zarur bo'lgan fayl formati.

### APK vs AAB

| Format | Hajm | Google Play | Tavsiya |
|--------|------|-------------|---------|
| APK    | Katta | Eski usul  | ❌      |
| AAB    | Kichik | Yangi usul | ✅      |

---

## 📋 Qanday Ishlatish

### 1. AAB Fayl Tayyorlash

**Android Studio'da:**

```
1. Build → Build Bundle(s) / APK(s)
2. Build Bundle(s)
3. Kutish...
4. app/build/outputs/bundle/release/app-release.aab
```

Tayyor! AAB fayl yaratildi.

---

### 2. Dasturda Yuklash

#### A) Ilovani Tanlash

```
1. Chap tarafdan ilovangizni tanlang
   Masalan: com.azam.filmtop

2. AAB Yuklash bo'limi ko'rinadi
```

#### B) Ma'lumotlarni To'ldirish

```
┌─────────────────────────────────────┐
│ 📦 AAB Fayl Yuklash                 │
├─────────────────────────────────────┤
│                                     │
│ AAB Fayli: [Faylni tanlang]         │
│                                     │
│ Version Code: [1]                   │
│ Version Name: [1.0.0]               │
│                                     │
│ [AAB Faylni Yuklash]                │
└─────────────────────────────────────┘
```

**Maydonlar:**

1. **AAB Fayli** - .aab faylni tanlang
2. **Version Code** - Raqamli versiya (1, 2, 3...)
3. **Version Name** - Ko'rinadigan versiya (1.0.0, 1.0.1...)

---

#### C) Yuklash

```
1. AAB faylni tanlang
   → Fayl nomi va hajmi ko'rinadi

2. Version Code kiriting: 1
   → Har safar oshib borishi kerak!

3. Version Name kiriting: 1.0.0
   → Foydalanuvchilar bu versiyani ko'radi

4. "AAB Faylni Yuklash" tugmasini bosing
   → Yuklash boshlanadi...

5. Natija:
   ✅ Muvaffaqiyatli yuklandi!
   📦 Fayl: com.azam.filmtop_1.aab
   🔢 Version Code: 1
   📝 Version Name: 1.0.0
   💾 Hajm: 25.4 MB
```

---

## 📊 Version Qoidalari

### Version Code

**Qoida:** Har safar **oshib** borishi kerak!

```
Birinchi yuklash:  Version Code = 1
Ikkinchi yuklash:  Version Code = 2
Uchinchi yuklash:  Version Code = 3
...
```

❌ **Xato:**
```
Oldingi: Version Code = 5
Yangi:   Version Code = 3  (kichik!)
```

✅ **To'g'ri:**
```
Oldingi: Version Code = 5
Yangi:   Version Code = 6  (katta!)
```

---

### Version Name

**Qoida:** Foydalanuvchilar ko'radigan versiya

```
Versiyalar:
- 1.0.0 - Birinchi chiqarish
- 1.0.1 - Kichik tuzatish
- 1.1.0 - Yangi funksiya
- 2.0.0 - Katta yangilanish
```

**Format:** `Major.Minor.Patch`

```
1.0.0
│ │ │
│ │ └─ Patch (bug fix)
│ └─── Minor (yangi funksiya)
└───── Major (katta o'zgarish)
```

---

## 💡 Misollar

### Misol 1: Birinchi Yuklash

```
Ilova: Film Top (com.azam.filmtop)

AAB Fayl: app-release.aab (28.5 MB)
Version Code: 1
Version Name: 1.0.0

[Yuklash] →

✅ Yuklandi!
📦 com.azam.filmtop_1.aab
💾 28.5 MB
```

---

### Misol 2: Yangilanish

```
Oldingi versiya:
- Version Code: 1
- Version Name: 1.0.0

Bug fix qildingiz:

AAB Fayl: app-release-v2.aab (28.3 MB)
Version Code: 2  ← oshdi!
Version Name: 1.0.1  ← patch oshdi

[Yuklash] →

✅ Yuklandi!
```

---

### Misol 3: Yangi Funksiya

```
Oldingi versiya:
- Version Code: 2
- Version Name: 1.0.1

Yangi funksiya qo'shdingiz:

AAB Fayl: app-release-v3.aab (32.1 MB)
Version Code: 3
Version Name: 1.1.0  ← minor oshdi

[Yuklash] →

✅ Yuklandi!
💾 32.1 MB
```

---

## 🔧 Backend

### Endpoint:

```
POST /api/apps/upload-aab
```

### Request:

```
Content-Type: multipart/form-data

Fields:
- file: .aab fayl
- package_name: com.azam.filmtop
- service_account_id: 1
- version_code: 1
- version_name: 1.0.0
```

### Response:

```json
{
  "message": "AAB fayli muvaffaqiyatli yuklandi",
  "filename": "com.azam.filmtop_1.aab",
  "version_code": 1,
  "version_name": "1.0.0",
  "file_size_mb": 28.5,
  "uploaded_at": "2026-04-12T09:39:00"
}
```

---

### Fayl Saqlash:

```
aab_files/
├── com.azam.filmtop_1.aab
├── com.azam.filmtop_2.aab
├── com.azam.gymium_1.aab
└── uz.azam.fokus_1.aab
```

---

### Database:

```python
class App(Base):
    # AAB ma'lumotlari
    aab_file_path = Column(String)
    aab_version_code = Column(Integer)
    aab_version_name = Column(String)
    aab_uploaded_at = Column(DateTime)
```

---

## 🎯 To'liq Workflow

```
1. Android Studio'da AAB build qilish
   ↓
2. app-release.aab faylni topish
   ↓
3. Dasturga kirish (http://localhost:5173)
   ↓
4. Ilovani tanlash
   ↓
5. AAB Yuklash bo'limiga o'tish
   ↓
6. AAB faylni tanlash
   ↓
7. Version Code va Name kiriting
   ↓
8. Yuklash
   ↓
9. ✅ Muvaffaqiyat!
   ↓
10. Keyingi qadam: Google Play'ga yuborish
```

---

## ⚠️ Muhim Eslatmalar

### 1. Version Code

```
❌ Kamaytirib bo'lmaydi!
❌ Bir xil bo'lmasligi kerak!
✅ Har safar +1
```

### 2. Fayl Formati

```
✅ .aab - To'g'ri
❌ .apk - Noto'g'ri
❌ .zip - Noto'g'ri
```

### 3. Hajm

```
Tavsiya: < 150 MB
Google cheklovi: < 150 MB (har bir AAB)
Agar katta bo'lsa: Asset packs ishlatish kerak
```

---

## 🚀 Keyingi Qadamlar

### 1. AAB Yuklandi ✅

Endi nima qilish kerak?

1. **Store Listing** - Matn va rasmlar
2. **Translation** - Tarjimalar
3. **Draft Saqlash** - Test qilish
4. **Google'ga Yuborish** - Release!

---

### 2. Google Play'ga Yuborish

**Hozir dastur faqat AAB'ni serverga saqlaydi.**

**Keyingi versiyada:**
- Google Play API orqali AAB yuborish
- Avtomatik release yaratish
- Track tanlash (Internal/Alpha/Beta/Production)

---

## 📱 Frontend Komponent

### AABUploader.jsx

**Funksiyalar:**
- ✅ Drag & Drop
- ✅ Fayl hajmini ko'rsatish
- ✅ Version validation
- ✅ Upload progress
- ✅ Muvaffaqiyat xabari
- ✅ Xato xabarlari

---

## ✅ Test Qilish

```bash
# 1. Android Studio'da AAB build qiling

# 2. Dasturni ishga tushiring
docker compose up -d

# 3. Brauzerda oching
http://localhost:5173

# 4. Ilova tanlang

# 5. AAB yuklang:
Fayl: app-release.aab
Version Code: 1
Version Name: 1.0.0

# 6. Natija:
✅ AAB yuklandi: 1.0.0 (28.5 MB)
```

---

## 🎨 UI Ko'rinishi

```
┌─────────────────────────────────────────┐
│ 📦 AAB Fayl Yuklash                     │
├─────────────────────────────────────────┤
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │   📄 app-release.aab                │ │
│ │   💾 28.5 MB                        │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Version Code *    Version Name *        │
│ [1            ]   [1.0.0            ]   │
│                                         │
│ [🚀 AAB Faylni Yuklash]                 │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 📌 Eslatma:                         │ │
│ │ • Version Code har safar oshishi   │ │
│ │ • AAB fayl Android Studio'da build │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

**Tayyor! AAB yuklash ishlayapti!** 📦✅
