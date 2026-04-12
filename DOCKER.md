# 🐳 Docker bilan Ishlatish

Docker yordamida dasturni oson ishga tushiring - barcha dependency'lar avtomatik o'rnatiladi!

## 📋 Talablar

- Docker Desktop yoki Docker Engine
- Docker Compose

### Docker O'rnatish

**Ubuntu/Debian:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

**Docker Compose:**
```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

Kompyuterni qayta ishga tushiring yoki:
```bash
newgrp docker
```

## 🚀 Tezkor Ishga Tushirish

### Variant 1: Skript bilan (Oson)

```bash
cd /home/azam/Desktop/yaratish/play_deploy
./docker-start.sh
```

### Variant 2: Qo'lda

```bash
# Image'larni yaratish
docker-compose build

# Konteynerlarni ishga tushirish
docker-compose up -d

# Loglarni ko'rish
docker-compose logs -f
```

## 🌐 Manzillar

Konteynerlar ishga tushgandan keyin:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📊 Boshqarish Komandalar

### Konteynerlar Holati
```bash
docker-compose ps
```

### Loglarni Ko'rish
```bash
# Barcha konteynerlar
docker-compose logs -f

# Faqat backend
docker-compose logs -f backend

# Faqat frontend
docker-compose logs -f frontend
```

### To'xtatish va Qayta Ishga Tushirish
```bash
# To'xtatish
docker-compose down

# Yoki skript bilan
./docker-stop.sh

# Qayta ishga tushirish
docker-compose restart

# Faqat backend'ni qayta ishga tushirish
docker-compose restart backend
```

### Konteynerga Kirish
```bash
# Backend konteyneri ichiga kirish
docker-compose exec backend bash

# Frontend konteyneri ichiga kirish
docker-compose exec frontend sh
```

## 🔄 Yangilanishlar

### Kod O'zgarganida

Agar siz kod o'zgartirsangiz, konteynerlar avtomatik yangilanadi (volumes orqali).

Lekin agar dependencies (requirements.txt, package.json) o'zgarsa:

```bash
# Image'ni qayta yaratish
docker-compose build

# Qayta ishga tushirish
docker-compose up -d
```

### Ma'lumotlar Bazasini Tozalash
```bash
# Konteynerlarni to'xtatish
docker-compose down

# Volume'larni o'chirish (ma'lumotlar ham o'chadi!)
docker-compose down -v

# Qayta ishga tushirish
docker-compose up -d
```

## 📁 Volume'lar

Docker quyidagi ma'lumotlarni saqlaydi:

- `backend-uploads` - Yuklangan rasmlar
- `backend-service-accounts` - Service account JSON fayllar
- `backend-db` - SQLite ma'lumotlar bazasi

Volume'larni ko'rish:
```bash
docker volume ls | grep play-console
```

## 🐛 Muammolarni Hal Qilish

### Port band bo'lsa
```bash
# Portni ishlatayotgan jarayonni topish
sudo lsof -i :8000
sudo lsof -i :5173

# Yoki Docker portini o'zgartirish docker-compose.yml da:
ports:
  - "8001:8000"  # Backend uchun
  - "5174:5173"  # Frontend uchun
```

### Konteyner ishga tushmasa
```bash
# Loglarni tekshirish
docker-compose logs backend
docker-compose logs frontend

# Konteynerlarni to'liq tozalash
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

### Image'ni qayta yaratish
```bash
# Cache'siz qayta yaratish
docker-compose build --no-cache
docker-compose up -d
```

## 🔧 Production uchun

Production muhitda ishlatish uchun:

1. `docker-compose.prod.yml` yarating
2. Environment variables'ni to'g'ri sozlang
3. Volume'larni xavfsiz joyga mount qiling
4. Reverse proxy (Nginx) qo'shing

Misol Production konfiguratsiya:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    environment:
      - SECRET_KEY=${SECRET_KEY}
      - DATABASE_URL=${DATABASE_URL}
    restart: always
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - backend
      - frontend
```

## 📊 Resurslar

### Konteyner Resurslarini Cheklash

`docker-compose.yml` ga qo'shish:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### Resurslarni Monitoring
```bash
# Real-time monitoring
docker stats

# Faqat play-console konteynerlari
docker stats play-console-backend play-console-frontend
```

## 🎯 Docker vs Oddiy O'rnatish

| Xususiyat | Docker | Oddiy |
|-----------|--------|-------|
| O'rnatish | Oson, bir komanda | Qo'lda, ko'p qadamlar |
| Dependencies | Avtomatik | Qo'lda o'rnatish |
| Portability | Har qanday OS | OS'ga bog'liq |
| Izolatsiya | To'liq | Yo'q |
| Resurslar | Biroz ko'proq | Kamroq |

## 🆘 Yordam

Docker bilan muammo bo'lsa:

```bash
# Docker versiyasini tekshirish
docker --version
docker-compose --version

# Docker servisini tekshirish
sudo systemctl status docker

# Docker'ni qayta ishga tushirish
sudo systemctl restart docker
```

---

**Eslatma**: Birinchi marta image yaratish biroz vaqt olishi mumkin (5-10 daqiqa). Keyingi safar tezroq bo'ladi.
