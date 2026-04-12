# 🧪 Ilovalarni Qo'shish - Qadamma-Qadam

## Muammo
Google Play API avtomatik ilovalar ro'yxatini bermaydi. Shuning uchun package name'larni qo'lda kiritish kerak.

## ✅ Yechim: Package Name Kiritish

### 1-Qadam: Package Name'larni Topish

**Play Console'dan:**
1. https://play.google.com/console ga kiring
2. Ilovangizni oching
3. Package name'ni ko'chirib oling

**Sizning ilovalaringiz (rasmdan):**
```
com.azam.filmtop
uz.azam.fokus
uz.azam.gymium
```

### 2-Qadam: Dasturda Qo'shish

1. **Brauzerda oching:**
   ```
   http://localhost:5173
   ```

2. **Service Account sahifasiga o'ting:**
   - "UI Developer" kartochkasini bosing
   - "Ilovalarni boshqarish" tugmasini bosing

3. **"Ilova Qo'shish" tugmasini bosing** (o'ng yuqoridagi yashil tugma)

4. **Package name'larni kiriting:**
   ```
   com.azam.filmtop
   uz.azam.fokus
   uz.azam.gymium
   ```
   (Har birini yangi qatorga)

5. **"Qo'shish" tugmasini bosing**

### 3-Qadam: Natijani Ko'rish

- ✅ Ilovalar chap tomonda paydo bo'ladi
- ✅ Har birini bosib tahrirlashingiz mumkin

---

## ⚠️ Muhim

### Service Account Ruxsatlari

Agar ilova qo'shilmasa, Play Console'da tekshiring:

1. **Settings** > **API access** > **Service Accounts**
2. Sizning service account'ingizni toping
3. **Permissions** - quyidagilar bo'lishi kerak:
   - ✅ **View app information**
   - ✅ **Manage store presence**
   - ✅ **Manage production releases**

### Package Name To'g'riligini Tekshirish

Package name **AYNAN** Play Console'dagi kabi bo'lishi kerak:
- ✅ To'g'ri: `com.azam.filmtop`
- ❌ Xato: `Com.Azam.FilmTop` (katta harf)
- ❌ Xato: `com.azam.filmtop ` (bo'sh joy)

---

## 🐛 Debug

Agar muammo bo'lsa, loglarni tekshiring:

```bash
# Backend loglari
docker compose logs backend | tail -50

# Frontend loglari  
docker compose logs frontend | tail -50

# API test
curl http://localhost:8000
```

---

## 📸 Screenshot Qo'llanma

### 1. Play Console'da Package Name
```
Dashboard → App Details → Package name
```

### 2. Dasturda Qo'shish
```
Service Accounts → UI Developer → Ilovalarni boshqarish → Ilova Qo'shish
```

---

## ✅ Muvaffaqiyatli Natija

Qo'shgandan keyin ko'rishingiz kerak:

```
Ilovalar
├── Film Top (com.azam.filmtop)
├── Fokus (uz.azam.fokus)  
└── Gymium (uz.azam.gymium)
```

Har birini bosib store listing'ini tahrirlashingiz mumkin!
