#!/bin/bash

echo "🐳 Docker va Docker Compose o'rnatish..."
echo ""

if command -v docker &> /dev/null; then
    echo "✅ Docker allaqachon o'rnatilgan: $(docker --version)"
else
    echo "📦 Docker o'rnatilmoqda..."
    
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    
    sudo usermod -aG docker $USER
    
    rm get-docker.sh
    
    echo "✅ Docker o'rnatildi!"
fi

echo ""

if command -v docker-compose &> /dev/null; then
    echo "✅ Docker Compose allaqachon o'rnatilgan: $(docker-compose --version)"
else
    echo "📦 Docker Compose o'rnatilmoqda..."
    
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    
    sudo chmod +x /usr/local/bin/docker-compose
    
    echo "✅ Docker Compose o'rnatildi!"
fi

echo ""
echo "🎉 O'rnatish tugadi!"
echo ""
echo "⚠️  MUHIM: Quyidagi komandani bajaring yoki kompyuterni qayta ishga tushiring:"
echo "   newgrp docker"
echo ""
echo "Keyin dasturni ishga tushiring:"
echo "   ./docker-start.sh"
