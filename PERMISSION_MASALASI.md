# 🔐 Permission Muammosi - Hal Qilish

## ❌ Muammo

Dastur qo'shishda xato:
```
No access to com.gravium: The caller does not have permission
```

Bu nimani anglatadi?
- Service Account bu ilovaga **ruxsat berilmagan**
- Google Play Console'da **user sifatida qo'shilmagan**

---

## ✅ Hal Qilish - Qadamma-Qadam

### 1. Google Play Console'ga Kirish

```
https://play.google.com/console
```

1. Hisobingizga kiring
2. Kerakli ilovani tanlang (masalan: com.gravium)

---

### 2. Users and Permissions

```
1. Chap menuda: "Users and permissions" ni bosing
2. "Invite new users" tugmasini bosing
```

---

### 3. Service Account Email Qo'shish

**Email topish:**

Dasturda:
```
Dashboard → Service Accounts → Email'ni ko'ring
```

Yoki JSON faylda:
```json
{
  "client_email": "play-console@your-project.iam.gserviceaccount.com"
}
```

**Qo'shish:**
```
1. Email kiriting: play-console@your-project.iam.gserviceaccount.com
2. "Invite user" bosing
```

---

### 4. Ruxsat Berish (Permissions)

**Tavsiya etiladigan ruxsatlar:**

✅ **App access:**
- View app information and download bulk reports

✅ **Release management:**
- Manage production releases
- Manage testing track releases

✅ **Store presence:**
- Edit store listing, images, and other store settings

✅ **Financial data:**
- View financial data (agar kerak bo'lsa)

**Yoki oddiy:**
```
☑️ Admin (release management, store presence)
```

---

### 5. Saqlash

```
1. "Apply" bosing
2. "Send invite" bosing
```

---

### 6. Tekshirish

Dasturga qaytib:
```
1. Dashboard → App Management
2. "Ilova Qo'shish" bosing
3. Package name kiriting: com.gravium
4. "Qo'shish" bosing
5. ✅ Muvaffaqiyatli!
```

---

## 🎯 Umumiy Ko'rinish

```
Google Play Console
    ↓
Ilova (com.gravium)
    ↓
Users and permissions
    ↓
Invite new users
    ↓
Service Account Email
    ↓
Admin ruxsat
    ↓
Apply & Send
    ↓
✅ Tayyor!
```

---

## 📋 Ko'p Ilova Uchun

Agar bir nechta ilovangiz bo'lsa:

```
1. Har bir ilova uchun alohida:
   
   Ilova 1 → Users → Service Account qo'shish
   Ilova 2 → Users → Service Account qo'shish
   Ilova 3 → Users → Service Account qo'shish
   ...

2. Yoki:
   
   Play Console → Account → Users and permissions
   → Service Account'ni BARCHAGA qo'shish
```

---

## 🔍 Xato Xabarlari

### 1. "No access to this app"

```
Sabab: Service Account qo'shilmagan
Hal: Yuqoridagi qadamlarni bajaring
```

### 2. "The caller does not have permission"

```
Sabab: Ruxsat berilmagan yoki kam
Hal: Admin yoki kerakli ruxsatlarni bering
```

### 3. "App not found"

```
Sabab: Package name noto'g'ri
Hal: To'g'ri package name kiriting
```

---

## 💡 Maslahatlar

### 1. Service Account Email'ni Saqlang

```
Bu email kerak bo'ladi:
play-console@your-project-123456.iam.gserviceaccount.com

Bir joyga yozib qo'ying!
```

### 2. Test Qilish

Bitta dasturda test qiling:
```
1. Bitta ilovaga qo'shing
2. Dasturda test qiling
3. Ishlab tursa, boshqalariga ham qo'shing
```

### 3. Backup

```
Eski JSON fayllarni saqlab qo'ying
Xato bo'lsa, qayta yaratish oson
```

---

## 📞 Agar Ishlamasa?

### 1. Email To'g'rimi?

```
Service Account email:
play-console@....iam.gserviceaccount.com

✅ To'g'ri format
❌ Boshqa email
```

### 2. Kutib Ko'ring

```
Ba'zan 5-10 daqiqa kutish kerak
Google yangilanishi uchun vaqt kerak
```

### 3. Qayta Urinish

```
1. JSON faylni qayta yuklang
2. Service Account'ni qayta yarating
3. Qaytadan urinib ko'ring
```

---

## ✅ Muvaffaqiyat!

Endi dastur qo'shishda:

```
✅ com.gravium qo'shildi!
✅ Service Account ruxsati tasdiqlandi
✅ Barcha ma'lumotlar olinmoqda...
```

---

**Tayyor! Permission muammosi hal qilindi!** 🎉

**Keyingi qadam:** Ilovalarni boshqaring va Google Play'ga chiqaring! 🚀
