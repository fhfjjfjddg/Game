#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
trap 'echo "Lỗi: ${BASH_SOURCE[0]} thất bại tại dòng ${LINENO}."; exit 1' ERR

# Yêu cầu quyền root hoặc sudo
if [ "${EUID:-$(id -u)}" -ne 0 ]; then
  if command -v sudo >/dev/null 2>&1; then
    SUDO="sudo"
  else
    echo "Vui lòng chạy script với quyền root hoặc cài đặt sudo."
    exit 1
  fi
else
  SUDO=""
fi

export DEBIAN_FRONTEND=noninteractive

echo "🔧 [1/9] Kích hoạt hỗ trợ 32-bit..."
$SUDO dpkg --add-architecture i386 || true
$SUDO apt-get update -y

echo "🔧 [2/9] Thiết lập kho WineHQ một cách an toàn..."
$SUDO install -d -m 0755 /etc/apt/keyrings
if command -v curl >/dev/null 2>&1; then
  $SUDO curl -fsSL --proto '=https' --tlsv1.2 \
    https://dl.winehq.org/wine-builds/winehq.key \
    -o /etc/apt/keyrings/winehq-archive.key
elif command -v wget >/dev/null 2>&1; then
  $SUDO wget -qO /etc/apt/keyrings/winehq-archive.key \
    https://dl.winehq.org/wine-builds/winehq.key
else
  $SUDO apt-get install -y ca-certificates curl
  $SUDO curl -fsSL --proto '=https' --tlsv1.2 \
    https://dl.winehq.org/wine-builds/winehq.key \
    -o /etc/apt/keyrings/winehq-archive.key
fi
$SUDO chmod 0644 /etc/apt/keyrings/winehq-archive.key

echo "🔧 [3/9] Thêm kho WineHQ tương ứng bản phân phối..."
CODENAME=""
if command -v lsb_release >/dev/null 2>&1; then
  CODENAME="$(lsb_release -sc || true)"
fi
if [ -z "$CODENAME" ] && [ -r /etc/os-release ]; then
  # shellcheck disable=SC1091
  . /etc/os-release
  CODENAME="${UBUNTU_CODENAME:-noble}"
fi
if [ -z "$CODENAME" ]; then
  CODENAME="noble"
fi
cat <<EOF | $SUDO tee /etc/apt/sources.list.d/winehq-${CODENAME}.sources >/dev/null
Types: deb
URIs: https://dl.winehq.org/wine-builds/ubuntu
Suites: ${CODENAME}
Components: main
Signed-By: /etc/apt/keyrings/winehq-archive.key
EOF

echo "🔧 [4/9] Cập nhật và cài Wine stable..."
$SUDO apt-get update -y
$SUDO apt-get install -y --install-recommends ca-certificates curl gnupg winetricks dialog zenity unzip winehq-stable

echo "✅ [5/9] Công cụ hỗ trợ đã sẵn sàng."

echo "🔧 [6/9] Khởi tạo prefix riêng ~/.wine-nbs (không tương tác)..."
PREFIX_DIR="${HOME}/.wine-nbs"
if [ -d "$PREFIX_DIR" ]; then
  BACKUP_DIR="${PREFIX_DIR}.bak.$(date +%Y%m%d-%H%M%S)"
  mv "$PREFIX_DIR" "$BACKUP_DIR"
  echo "Đã sao lưu prefix cũ vào: $BACKUP_DIR"
fi
export WINEPREFIX="$PREFIX_DIR"
export WINEARCH="win32"
wineboot -u

echo "🔧 [7/9] Cài .NET Framework 4.0 và font chữ..."
winetricks -q dotnet40 corefonts

echo "✅ [8/9] Đã cài đặt môi trường Wine thành công!"
echo "👉 [9/9] Tải OpenNoteBlockStudio tại:"
echo "https://github.com/HielkeMinecraft/OpenNoteBlockStudio/releases/latest"
echo "📦 Sau khi tải, có thể chạy với:"
echo "cd ~/Downloads/nbs && WINEPREFIX=$HOME/.wine-nbs wine 'Open Note Block Studio.exe'"
