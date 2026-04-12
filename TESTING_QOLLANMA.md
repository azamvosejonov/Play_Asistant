# 🧪 Play Market Testing - To'liq Qo'llanma

## ✅ Nima Qo'shildi?

### 1. **Test Track Funksiyalari**

Play Market'da 3 xil test mavjud:
- 🔒 **Internal Testing** - Ichki test (100 tagacha tester)
- 🔐 **Closed Testing (Alpha)** - Yopiq test (cheksiz)
- 🌐 **Open Testing (Beta)** - Ochiq test (hammaga)

---

## 🚀 Qanday Ishlaydi?

### Oddiy Jarayon (3 Qadam!)

```
1. Testerlar qo'shing
   ↓
2. Test release yarating
   ↓
3. Test linkni ulashing!
```

---

## 📋 Qadamma-Qadam

### 1️⃣ **Testerlar Qo'shish**

**Email'lar kiritish:**
```
test1@gmail.com
test2@gmail.com
test3@gmail.com
```

**Bosing:** "Testerlarni Qo'shish"

**Natija:**
```
✅ 3 ta tester qo'shildi!
🔗 Test link: https://play.google.com/apps/internaltest/com.yourapp
```

---

### 2️⃣ **Test Release Yaratish**

**Release Notes yozing:**
```
- Bug fixes
- Yangi funksiyalar
- UI yaxshilanishlar
```

**Bosing:** "Release Yaratish"

**Natija:**
```
✅ Test release yaratildi!
📦 Version: 1.0.0 (1)
🎯 Track: Internal Testing
🔗 Link tayyor!
```

---

### 3️⃣ **Test Link Ulashish**

**Link nusxalash:**
```
🔗 https://play.google.com/apps/internaltest/com.yourapp

[Nusxa] tugmasini bosing
```

**Testerlarga yuborish:**
```
WhatsApp, Telegram, Email orqali yuboring!
```

---

## 🎯 Track Tanlash

### Internal Testing (Tavsiya!)

**Afzalliklari:**
- ✅ Eng tez (bir necha daqiqada)
- ✅ 100 tagacha tester
- ✅ Google'ning tasdiqlashisiz
- ✅ Oson boshqarish

**Qachon ishlatish:**
- Birinchi test
- Tez bug topish
- Kichik jamoa

---

### Closed Testing (Alpha)

**Afzalliklari:**
- ✅ Cheksiz testerlar
- ✅ Email list orqali
- ✅ To'liq nazorat

**Qachon ishlatish:**
- Katta jamoa
- Uzoq muddatli test
- Maxsus guruhlar

---

### Open Testing (Beta)

**Afzalliklari:**
- ✅ Hammaga ochiq
- ✅ Google Play'da ko'rinadi
- ✅ Ko'p feedback

**Qachon ishlatish:**
- Public beta
- Ko'plab foydalanuvchilar
- Launch oldidan

---

## 💻 Frontend - Testing Panel

### Qayerda?

```
App Management → Ilova tanlang → "Testing" bo'limi
```

### Ko'rinishi:

```
┌─────────────────────────────────────┐
│  🧪 Testing                         │
├─────────────────────────────────────┤
│                                     │
│  Track: [Internal Testing ▼]       │
│                                     │
│  1. Testerlar Qo'shish             │
│     [Email'lar]                     │
│     [Testerlarni Qo'shish]         │
│                                     │
│  2. Test Release Yaratish          │
│     [Release Notes]                 │
│     [Release Yaratish]              │
│                                     │
│  3. Test Link                      │
│     [Link] [Nusxa]                 │
│     [Test Linkini Ochish]          │
│                                     │
│  📝 Qo'llanma: ...                 │
└─────────────────────────────────────┘
```

---

## 🔧 Backend API

### 1. Testerlar Qo'shish

**Endpoint:**
```
POST /api/testing/add-testers
```

**Body:**
```json
{
  "package_name": "com.yourapp",
  "emails": ["test1@gmail.com", "test2@gmail.com"],
  "track": "internal"
}
```

**Response:**
```json
{
  "message": "2 tester added successfully",
  "track": "internal",
  "test_link": "https://play.google.com/apps/internaltest/com.yourapp"
}
```

---

### 2. Test Release Yaratish

**Endpoint:**
```
POST /api/testing/create-release
```

**Params:**
```
package_name: com.yourapp
track: internal
release_notes: Bug fixes
service_account_id: 1
```

**Response:**
```json
{
  "success": true,
  "version_code": 1,
  "track": "internal",
  "test_link": "https://play.google.com/apps/internaltest/com.yourapp"
}
```

---

### 3. Test Link Olish

**Endpoint:**
```
GET /api/testing/link
```

**Params:**
```
package_name: com.yourapp
track: internal
service_account_id: 1
```

**Response:**
```json
{
  "test_link": "https://play.google.com/apps/internaltest/com.yourapp",
  "track": "internal",
  "package_name": "com.yourapp"
}
```

---

## 📱 Testerlar Uchun Qo'llanma

### Test Linkni Ochish

```
1. Link oling (masalan, WhatsApp orqali)
2. Linkni bosing
3. "Tester bo'lish" tugmasini bosing
4. Google Play'dan yuklab oling
5. O'rnating va test qiling!
```

---

### Feedback Berish

**Nima berish kerak:**
- 🐛 Topilgan buglar
- 💡 Taklif va fikrlar
- 📸 Screenshot'lar
- ⭐ Umumiy taassurot

**Qayerda:**
- Google Play Console feedback
- Telegram/WhatsApp guruh
- Email

---

## ⚠️ Muhim Eslatmalar

### 1. AAB Fayl Kerak

```
❌ AAB yuklanmagan → Test release yaratib bo'lmaydi
✅ AAB yuklangan → Test release yaratish mumkin
```

**Tekshirish:**
- App Management → AAB bo'limi
- AAB faylni yuklang
- Keyin test release yarating

---

### 2. Service Account Ruxsati

```
Service Account'ga kerakli ruxsatlar:
✅ Release management
✅ Testing access
✅ App management
```

**Tekshirish:**
- Play Console → Users and permissions
- Service Account email toping
- Ruxsatlarni tekshiring

---

### 3. Google Review

**Internal Testing:**
- ✅ Review yo'q (darhol)

**Closed/Open Testing:**
- ⏳ Google review (bir necha soat)
- 📝 Release notes talab qilinadi
- 🎯 App to'liq bo'lishi kerak

---

## 🎯 To'liq Workflow

### Birinchi Test Release

```
1. AAB faylni build qiling (Android Studio)
   ↓
2. Dasturga kiring
   ↓
3. Ilova → AAB Upload
   ↓
4. AAB'ni yuklang
   ↓
5. Testing bo'limiga o'ting
   ↓
6. Testerlar email'larini kiriting
   ↓
7. "Testerlarni Qo'shish" bosing
   ↓
8. Release notes yozing
   ↓
9. "Release Yaratish" bosing
   ↓
10. Test linkni nusxalang
   ↓
11. Testerlarga yuboring!
   ↓
12. ✅ Test boshlandi!
```

---

### Keyingi Update'lar

```
1. Yangi AAB build qiling (version++!)
   ↓
2. AAB Upload qiling
   ↓
3. Testing → Release Yaratish
   ↓
4. Testerlar avtomatik update oladi!
```

---

## 📊 Monitoring

### Play Console'da

```
1. Play Console'ga kiring
2. Ilovangizni tanlang
3. Testing → Internal testing
4. Ko'rish:
   - Nechta tester
   - Nechta o'rnatildi
   - Crash'lar
   - Feedback
```

---

## 💡 Best Practices

### 1. Testerlarni Guruhlashtiring

```
Guruh 1: Developers (5-10)
Guruh 2: QA Team (10-20)
Guruh 3: Beta Users (20-50)
```

### 2. Release Notes Yozing

```
BAD:
"bug fixes"

GOOD:
"- Fixed login crash
 - Improved performance
 - Added dark mode
 - Fixed typos"
```

### 3. Versiyani To'g'ri Oshiring

```
Old: 1.0.0 (1)
New: 1.0.1 (2) ← Version code +1!
```

---

## 🔍 Troubleshooting

### "AAB file not found"

```
Sabab: AAB yuklanmagan
Hal: AAB Upload qiling
```

### "Service account not found"

```
Sabab: Noto'g'ri service account
Hal: To'g'ri account tanlang
```

### "Failed to create release"

```
Sabab: Ruxsat yo'q yoki version kichik
Hal:
1. Ruxsatlarni tekshiring
2. Version code'ni oshiring
3. AAB'ni qayta yuklang
```

---

## ✅ Tayyor!

**Endi siz qila olasiz:**
- ✅ Testerlar qo'shish
- ✅ Test release yaratish
- ✅ Test link olish
- ✅ Beta test o'tkazish
- ✅ Play Market'ga chiqarishdan oldin test qilish

**Hammasi avtomatik va oson!** 🚀🎉

---

**Keyingi qadam:** Production'ga chiqarish! 🌟
