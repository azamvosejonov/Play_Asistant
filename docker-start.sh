#!/bin/bash

echo "🐳 Docker konteynerlarni ishga tushirish..."
echo ""

if ! command -v docker &> /dev/null; then
    echo "❌ Docker o'rnatilmagan. Iltimos Docker'ni o'rnating."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose o'rnatilmagan. Iltimos Docker Compose'ni o'rnating."
    exit 1
fi

echo "🏗️  Docker image'larni yaratish..."
docker-compose build

echo ""
echo "🚀 Konteynerlarni ishga tushirish..."
docker-compose up -d

echo ""
echo "✅ Konteynerlar ishga tushdi!"
echo ""
echo "📊 Konteyner holati:"
docker-compose ps

echo ""
echo "🌐 Dastur manzillari:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "📝 Loglarni ko'rish:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 To'xtatish:"
echo "   docker-compose down"
