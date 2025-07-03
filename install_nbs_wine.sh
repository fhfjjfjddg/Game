#!/bin/bash

# Tự động thoát khi có lỗi
set -e

echo "🔧 [1/9] Kích hoạt hỗ trợ 32-bit..."
sudo dpkg --add-architecture i386
sudo apt update

echo "🔧 [2/9] Tải và thêm khóa GPG của WineHQ..."
sudo mkdir -pm755 /etc/apt/keyrings
sudo wget -O /etc/apt/keyrings/winehq-archive.key https://dl.winehq.org/wine-builds/winehq.key

echo "🔧 [3/9] Thêm kho WineHQ cho Ubuntu 24.04 (noble)..."
sudo wget -NP /etc/apt/sources.list.d/ https://dl.winehq.org/wine-builds/ubuntu/dists/noble/winehq-noble.sources

echo "🔧 [4/9] Cập nhật và cài Wine stable..."
sudo apt update
sudo apt install --install-recommends winehq-stable -y

echo "🔧 [5/9] Cài Winetricks và công cụ hỗ trợ..."
sudo apt install winetricks dialog zenity unzip -y

echo "🔧 [6/9] Xóa prefix cũ nếu có và tạo lại prefix ~/.wine-nbs..."
rm -rf ~/.wine-nbs
WINEPREFIX=~/.wine-nbs winecfg

echo "🔧 [7/9] Cài .NET Framework 4.0 và font chữ..."
WINEPREFIX=~/.wine-nbs winetricks -q dotnet40 corefonts

echo "✅ [8/9] Đã cài đặt môi trường Wine thành công!"

echo "👉 [9/9] Giờ hãy tải OpenNoteBlockStudio tại:"
echo "https://github.com/HielkeMinecraft/OpenNoteBlockStudio/releases/latest"
echo "📦 Sau khi tải, bạn có thể chạy bằng lệnh:"
echo "cd ~/Downloads/nbs && WINEPREFIX=~/.wine-nbs wine 'Open Note Block Studio.exe'"
