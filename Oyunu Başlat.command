#!/bin/bash
cd "$(dirname "$0")"

# Boş port bul (8000 doluysa 8001, 8002...)
PORT=8000
while lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; do
    PORT=$((PORT+1))
done

echo "========================================"
echo "      Gölge Kuşatması Başlatılıyor      "
echo "========================================"
echo "Web sunucusu port $PORT üzerinde çalışıyor..."
echo "Tarayıcınız açılıyor: http://localhost:$PORT"
echo "Oyunu kapatmak için bu Terminal penceresini kapatabilirsiniz."
echo "========================================"

sleep 1
open "http://localhost:$PORT"
python3 -m http.server $PORT
