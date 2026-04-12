# 🔍 Ilova Qo'shish - Debug

## ❌ Muammo

Hali ham ilova qo'shilmayapti. Backend loglarida `/api/apps/add` so'rovi ko'rinmayapti.

---

## 🔧 Debug Qadamlari

### 1. Browser Console Tekshiring

**F12** bosing yoki **Right Click → Inspect → Console**

---

### 2. Console'da Qanday Xabarlar Ko'rinishi Kerak?

**To'g'ri ishlasa:**

```javascript
handleAdd called, packageNames: com.example.app
Calling onAdd with: com.example.app
onAdd called in AppManagement, packageNames: com.example.app
serviceAccountId: 2
Calling API with pkgList: ["com.example.app"]
API response: {added: [...], failed: [...]}
```

---

### 3. Xato Xabarlari

**Agar console'da xato bo'lsa:**

```javascript
Error: ...
TypeError: ...
Network Error: ...
```

**Screenshot oling va ko'rsating!**

---

## 📋 Test Qadamlari

```
1. http://localhost:5173 - oching

2. F12 - Console'ni oching

3. App Management'ga o'ting

4. "Ilova Qo'shish" tugmasini bosing

5. Package name kiriting:
   com.example.testapp

6. "Qo'shish" tugmasini bosing

7. Console'da xabarlarni ko'ring

8. Screenshot oling
```

---

## 🎯 Mumkin Bo'lgan Muammolar

### 1. serviceAccountId null

```javascript
serviceAccountId: undefined
```

**Hal:** URL'da service_account_id borligini tekshiring

---

### 2. API Error

```javascript
Error: Network Error
Error: 401 Unauthorized
```

**Hal:** Login qilinganligini tekshiring

---

### 3. Button Disabled

```
Button disabled bo'lsa - package name kiritilmaganligini anglatadi
```

**Hal:** Package name kiriting va qaytadan urinib ko'ring

---

### 4. Modal Ochilmayapti

```
showAddApp: false
```

**Hal:** "Ilova Qo'shish" tugmasini bosganingizni tekshiring

---

## 💡 Qo'shimcha Tekshiruvlar

### Backend Running?

```bash
docker compose ps

# Natija:
# backend    Up    0.0.0.0:8000->8000/tcp
```

### Frontend Running?

```bash
curl http://localhost:5173

# Natija:
# HTML kod qaytarishi kerak
```

### API Endpoint Ishlayaptimi?

```bash
# Terminal'da test qiling:
curl -X POST http://localhost:8000/api/apps/add \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"package_names":["com.test.app"]}' \
  -G --data-urlencode "service_account_id=2"
```

---

## 📸 Screenshot Kerak

Quyidagilarni screenshot qiling:

1. ✅ Browser Console (F12)
2. ✅ Network tab (F12 → Network)
3. ✅ Modal (Package name kiritilgan holda)
4. ✅ Backend logs (docker compose logs backend --tail=20)

---

## 🚀 Keyingi Qadam

Console'dagi xabar yoki screenshot yuboring, men muammoni topaman!

---

**Debug mode yoqildi!** 🔍✨
