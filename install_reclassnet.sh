#!/bin/bash
set -e

echo "🔧 [1/6] Cài gói cần thiết..."
sudo apt update
sudo apt install -y mono-complete git make g++ g++-multilib unzip wget

echo "📦 [2/6] Tải ReClass.NET từ GitHub..."
git clone https://github.com/ReClassNET/ReClass.NET.git
cd ReClass.NET

echo "🧱 [3/6] Biên dịch NativeCore.Unix (Linux core)..."
cd NativeCore/Unix
make
cd ../../

echo "🧰 [4/6] Tải bản phát hành sẵn..."
LATEST_URL=$(curl -s https://api.github.com/repos/ReClassNET/ReClass.NET/releases/latest \
  | grep "browser_download_url.*ReClass.NET.zip" \
  | cut -d '"' -f 4)

wget "$LATEST_URL" -O ReClassNET.zip
unzip -o ReClassNET.zip -d bin/Release/

echo "🚀 [5/6] Chạy ReClass.NET bằng Mono..."
cd bin/Release
chmod +x ReClass.NET.exe
mono ReClass.NET.exe
