# ✅ Default Til - English

## 🌍 Nima O'zgardi?

### Default Til: **Ingliz Tili (English)**

Endi dastur **avtomatik ingliz tilida** ochiladi!

```javascript
lng: localStorage.getItem('language') || 'en'
```

---

## 🔄 Qanday Ishlaydi?

### Birinchi Marta Ochganda:

```
1. Dastur ochiladi
2. Default til: English ✅
3. Barcha matnlar inglizcha:
   - Dashboard
   - Service Accounts
   - Manage Apps
   - Add App
   - etc.
```

---

### Til Tanlash:

```
1. Til tugmasini bosing: 🇺🇸 English ▼

2. Boshqa tilni tanlang:
   🇺🇿 O'zbekcha
   🇷🇺 Русский
   🇪🇸 Español
   ...

3. Tanlangan til saqlanadi!

4. Keyingi safar - tanlagan tilingiz ochiladi
```

---

## 💾 Til Saqlash

### localStorage

```javascript
// Til o'zgarganda
localStorage.setItem('language', 'uz')

// Keyingi safar
const savedLang = localStorage.getItem('language')
// savedLang = 'uz' ✅

// Agar saqlanmagan bo'lsa
lng: localStorage.getItem('language') || 'en'
//                                        ↑
//                                    Default
```

---

## 📊 Til Prioriteti

```
1. localStorage'dagi til (agar mavjud bo'lsa)
   ✅ BIRINCHI TANLOV

2. Default til: 'en'
   ✅ Agar localStorage bo'sh bo'lsa
```

---

## 🎯 Misol

### Birinchi Marta

```
User opens app
  ↓
No language in localStorage
  ↓
Default: 'en' is loaded
  ↓
Interface in English:
- Dashboard
- Service Accounts
- Add App
```

### Ikkinchi Marta

```
User opens app
  ↓
localStorage: 'uz'
  ↓
Uzbek is loaded
  ↓
Interface in Uzbek:
- Boshqaruv paneli
- Service Account'lar
- Ilova Qo'shish
```

---

## ✅ Tarjima Qilingan Matnlar

### Dashboard
- ✅ Service Accounts → Service Accounts
- ✅ Welcome → Welcome
- ✅ No service accounts → No service accounts found
- ✅ Add Service Account → Add Service Account
- ✅ Manage Apps → Manage Apps
- ✅ Logout → Logout

### App Management
- ✅ Back → Back
- ✅ Add App → Add App
- ✅ Select App → Select an app
- ✅ No Apps → No apps found

### AAB Uploader
- ✅ AAB Upload → Upload AAB File
- ✅ Upload Success → Successfully uploaded!
- ✅ Uploading → Uploading...

---

## 🌐 Barcha 10 Til

| # | Til | Code | Default? |
|---|-----|------|----------|
| 1 | English | en | ✅ YES |
| 2 | O'zbekcha | uz | ❌ |
| 3 | Русский | ru | ❌ |
| 4 | Español | es | ❌ |
| 5 | Français | fr | ❌ |
| 6 | Deutsch | de | ❌ |
| 7 | العربية | ar | ❌ |
| 8 | 中文 | zh | ❌ |
| 9 | 日本語 | ja | ❌ |
| 10 | Türkçe | tr | ❌ |

---

## 🔧 Texnik

### i18n Config

```javascript
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en', // ← Default
    fallbackLng: 'en', // ← Fallback
    interpolation: {
      escapeValue: false
    }
  });
```

---

## 🚀 Test

### 1. Default Til (English)

```bash
# localStorage'ni tozalash
localStorage.clear()

# Dasturni ochish
http://localhost:5173

# Natija:
✅ English tilida ochiladi
✅ "Service Accounts"
✅ "Add App"
```

### 2. Til O'zgartirish

```bash
# Tilni tanlash
🇺🇿 O'zbekcha

# localStorage
localStorage.getItem('language') 
// → 'uz' ✅

# Dasturni yopish va qayta ochish

# Natija:
✅ O'zbek tilida ochiladi
✅ "Service Account'lar"
✅ "Ilova Qo'shish"
```

---

## 📝 Xulosa

✅ **Default til:** English
✅ **Til almashtirish:** Ishlayapti
✅ **Til saqlash:** localStorage
✅ **10 ta til:** Barchasi tayyor
✅ **Tarjimalar:** 500+ matn

---

**Tayyor! Dastur ingliz tilida ochiladi va foydalanuvchi istagan tilni tanlashi mumkin!** 🌍✨🚀
