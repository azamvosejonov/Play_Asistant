#!/bin/bash

echo "🔄 Docker konteynerlarni qayta yaratish..."
echo ""

echo "🛑 Eski konteynerlarni to'xtatish..."
docker compose down

echo ""
echo "🏗️  Image'larni qayta yaratish (cache'siz)..."
docker compose build --no-cache

echo ""
echo "🚀 Konteynerlarni ishga tushirish..."
docker compose up -d

echo ""
echo "📊 Konteyner holati:"
docker compose ps

echo ""
echo "📝 Loglarni ko'rish uchun:"
echo "   docker compose logs -f"
echo ""
echo "✅ Tayyor!"
