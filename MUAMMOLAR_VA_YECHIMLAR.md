# 🔧 Muammolar va Yechimlar

## ❌ Sizning Muammolaringiz

### 1. `ModuleNotFoundError: No module named 'googletrans'`

**Sabab**: Python dependencies o'rnatilmagan

**Yechim**:
```bash
cd backend
pip install -r requirements.txt
```

Yoki yangilangan versiyani o'rnatish:
```bash
pip install googletrans==3.1.0a0 httpx==0.13.3
```

### 2. `sh: 1: vite: not found`

**Sabab**: Node modules o'rnatilmagan

**Yechim**:
```bash
cd frontend
npm install
```

### 3. `/home/azam/.deno/envexport: No such file or directory`

**Sabab**: Deno muhit o'zgaruvchisi muammosi

**Yechim**: Bu xabar ignore qilsa bo'ladi yoki:
```bash
unset DENO_INSTALL_ROOT
```

## ✅ ENG OSON YECHIM: DOCKER

Barcha dependency muammolarini hal qilish uchun Docker ishlatamiz!

### 1. Docker O'rnatish

```bash
cd /home/azam/Desktop/yaratish/play_deploy
./install-docker.sh
```

Keyin:
```bash
newgrp docker
```

Yoki kompyuterni qayta ishga tushiring.

### 2. Dasturni Ishga Tushirish

```bash
./docker-start.sh
```

**HAMMASI SHU!** Backend va Frontend avtomatik ishga tushadi.

- Frontend: http://localhost:5173
- Backend: http://localhost:8000

### 3. To'xtatish

```bash
./docker-stop.sh
```

## 🔄 Docker'siz Qo'lda Yechish

Agar Docker ishlatmoqchi bo'lmasangiz:

### Backend Muammosi

```bash
cd /home/azam/Desktop/yaratish/play_deploy/backend

# Virtual environment yaratish (tavsiya etiladi)
python3 -m venv venv
source venv/bin/activate

# Dependencies o'rnatish
pip install --upgrade pip
pip install -r requirements.txt

# Ishga tushirish
python app.py
```

### Frontend Muammosi

```bash
cd /home/azam/Desktop/yaratish/play_deploy/frontend

# Node modules o'rnatish
npm install

# Agar xatolik bo'lsa, cache tozalash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Ishga tushirish
npm run dev
```

## 🐛 Boshqa Umumiy Muammolar

### Port band bo'lsa

```bash
# 8000 port (Backend)
sudo lsof -ti:8000 | xargs kill -9

# 5173 port (Frontend)  
sudo lsof -ti:5173 | xargs kill -9
```

### Python versiyasi muammosi

```bash
# Python versiyasini tekshirish (3.8+ kerak)
python --version

# Agar eski bo'lsa
sudo apt update
sudo apt install python3.11
```

### Node.js versiyasi muammosi

```bash
# Node versiyasini tekshirish (16+ kerak)
node --version

# Yangilash (nvm orqali)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

### Ruxsat muammosi

```bash
chmod +x *.sh
```

### Ma'lumotlar bazasi muammosi

```bash
cd backend
rm play_deploy.db
python app.py  # Yangi DB yaratiladi
```

## 📊 Tekshirish

Hammasi ishlayotganini tekshirish:

### 1. Backend tekshirish
```bash
curl http://localhost:8000
# Natija: {"message":"Play Console Automation API"}
```

### 2. Frontend tekshirish
Brauzerda: http://localhost:5173

### 3. Docker tekshirish (agar Docker ishlatayotgan bo'lsangiz)
```bash
docker-compose ps
# Ikkala konteyner "Up" holatida bo'lishi kerak
```

## 🆘 Yordam

Agar hali ham muammo bo'lsa:

1. Loglarni ko'ring:
```bash
# Docker bilan
docker-compose logs -f

# Docker'siz - Backend
cd backend && python app.py

# Docker'siz - Frontend  
cd frontend && npm run dev
```

2. Dependencies'ni qayta o'rnating:
```bash
# Backend
cd backend
pip install -r requirements.txt --force-reinstall

# Frontend
cd frontend
rm -rf node_modules
npm install
```

3. Tizimni to'liq tozalang va qayta boshlang:
```bash
# Docker bilan
docker-compose down -v
docker system prune -a
./docker-start.sh

# Docker'siz
cd backend && rm -rf __pycache__ *.db
cd ../frontend && rm -rf node_modules dist .vite
./start.sh
```

---

**TAVSIYA**: Docker ishlatish barcha muammolarni avtomatik hal qiladi! 🐳
