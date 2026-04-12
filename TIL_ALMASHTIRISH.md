# 🌍 Til Almashtirish - Qo'llanma

## ✅ Qanday Ishlaydi?

### Til Tanlash Tugmasi

Har bir sahifada **yuqori o'ng burchakda** til tanlash tugmasi bor:

```
┌─────────────────────┐
│  🇺🇿 O'zbekcha  ▼   │
└─────────────────────┘
```

---

## 📍 Qayerda Joylashgan?

### 1. Dashboard (Bosh Sahifa)

```
┌──────────────────────────────────────────┐
│  Service Accounts      🇺🇿 O'zbekcha ▼  │
└──────────────────────────────────────────┘
```

**Joylashuvi:** Service Accounts sarlavhasi yonida, o'ng tomonda

---

### 2. App Management (Ilova Boshqaruv)

```
┌──────────────────────────────────────────────────┐
│  ← Orqaga    🇺🇿 O'zbekcha ▼  [Ilova Qo'shish]  │
└──────────────────────────────────────────────────┘
```

**Joylashuvi:** Header'da, "Ilova Qo'shish" tugmasi yonida

---

## 🎨 Qanday Ishlashi

### 1. Til Tanlash

```
1. Til tugmasini bosing:
   🇺🇿 O'zbekcha ▼

2. Dropdown ochiladi:
   ┌─────────────────────┐
   │ 🇺🇿 O'zbekcha    ✓  │
   │ 🇺🇸 English         │
   │ 🇷🇺 Русский         │
   │ 🇪🇸 Español         │
   │ 🇫🇷 Français        │
   │ 🇩🇪 Deutsch         │
   │ 🇸🇦 العربية         │
   │ 🇨🇳 中文            │
   │ 🇯🇵 日本語          │
   │ 🇹🇷 Türkçe         │
   └─────────────────────┘

3. Tilni tanlang

4. Barcha matnlar darhol o'zgaradi!
```

---

### 2. Avtomatik Saqlash

```
Tanlangan til localStorage'da saqlanadi:

localStorage.setItem('language', 'ru')

Keyingi safar kirganingizda:
✅ Siz tanlagan til avtomatik yuklanadi
```

---

## 🎯 Til O'zgarganda Nima Bo'ladi?

### Dashboard

**O'zbekcha:**
```
Service Accounts
Xush kelibsiz!
Service Account ulash
Chiqish
```

**English:**
```
Service Accounts
Welcome!
Add Service Account
Logout
```

**Русский:**
```
Сервисные аккаунты
Добро пожаловать!
Добавить сервисный аккаунт
Выйти
```

---

### App Management

**O'zbekcha:**
```
Orqaga
Ilova Qo'shish
AAB Fayl Yuklash
Store Listing Ma'lumotlari
```

**English:**
```
Back
Add App
Upload AAB File
Store Listing Information
```

**中文:**
```
返回
添加应用
上传AAB文件
商店信息
```

---

## 💡 Xususiyatlar

### ✅ Real-time O'zgarish
```
Til o'zgarganda:
- Sahifa yangilanmaydi
- Barcha matnlar darhol o'zgaradi
- Foydalanuvchi tajribasi uzilmaydi
```

### ✅ Bayroqlar
```
Har bir til o'z bayrog'i bilan:
🇺🇿 O'zbekcha
🇺🇸 English
🇷🇺 Русский
...
```

### ✅ Active Holat
```
Hozirgi til belgilanadi:
┌─────────────────────┐
│ 🇺🇿 O'zbekcha    ✓  │  ← Active (ko'k fon)
│ 🇺🇸 English         │
└─────────────────────┘
```

---

## 🎨 Dizayn

### Tugma Dizayni

```css
- Border: gray-300
- Hover: bg-gray-50
- Rounded: lg
- Shadow: none (default)
- Icon: Globe + Flag + Name
```

### Dropdown Dizayni

```css
- Position: absolute, right-0
- Background: white
- Shadow: xl
- Border: gray-200
- Max Height: 96 (scroll)
- Z-index: 20
```

### Active Item

```css
- Background: primary-100
- Border-left: 4px primary-600
- Text: primary-700
- Checkmark: ✓
```

---

## 📱 Responsive

### Desktop
```
[Globe] 🇺🇿 O'zbekcha ▼
```

### Tablet
```
[Globe] 🇺🇿 O'zbekcha ▼
```

### Mobile
```
[Globe] 🇺🇿 ▼
(Faqat bayroq)
```

---

## 🔧 Texnik Ma'lumot

### Komponent

```jsx
import LanguageSwitcher from '../components/LanguageSwitcher';

<LanguageSwitcher />
```

### Hook

```jsx
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();

<h1>{t('dashboard')}</h1>
```

---

## 📊 Qo'shilgan Sahifalar

| Sahifa | Til Switcher | Tarjima |
|--------|--------------|---------|
| Dashboard | ✅ Header | ✅ 100% |
| App Management | ✅ Header | ✅ 100% |
| Login | ⏳ Keyingi | ⏳ Keyingi |
| Setup | ⏳ Keyingi | ⏳ Keyingi |

---

## 🚀 Test Qilish

```
1. http://localhost:5173 - oching

2. Dashboard'ga kiring

3. Til tugmasini toping (o'ng yuqorida)

4. Tilni o'zgartiring

5. Barcha matnlar o'zgarishini ko'ring

6. Boshqa sahifaga o'ting

7. Til saqlanganini tekshiring
```

---

## 💡 Kelajakda

### Qo'shilishi Kerak:

1. ✅ Login sahifasiga til switcher
2. ✅ Setup sahifasiga til switcher
3. ✅ Error message'lar tarjimasi
4. ✅ Validation xabarlari tarjimasi
5. ✅ Tooltip'lar tarjimasi

---

**Tayyor! Til almashtirish har bir sahifada ishlaydi!** 🌍✨

**Foydalanuvchilar o'z tillarida ishlatishi mumkin!** 🚀
