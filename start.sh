#!/bin/bash

echo "🚀 Play Console Automation - Ishga tushirilmoqda..."

echo ""
echo "📦 Backend o'rnatilmoqda..."
cd backend
pip install -r requirements.txt

echo ""
echo "📦 Frontend o'rnatilmoqda..."
cd ../frontend
npm install

echo ""
echo "✅ O'rnatish tugadi!"
echo ""
echo "Dasturni ishga tushirish uchun:"
echo "1. Terminal 1: cd backend && python app.py"
echo "2. Terminal 2: cd frontend && npm run dev"
echo ""
echo "Yoki quyidagi skriptlardan foydalaning:"
echo "  ./run-backend.sh  - Backend'ni ishga tushirish"
echo "  ./run-frontend.sh - Frontend'ni ishga tushirish"
