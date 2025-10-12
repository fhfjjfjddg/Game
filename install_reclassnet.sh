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

echo "🔧 [1/7] Cài gói cần thiết..."
$SUDO apt-get update -y
$SUDO apt-get install -y --no-install-recommends ca-certificates curl jq git make g++ g++-multilib unzip mono-complete wget

echo "📦 [2/7] Tải ReClass.NET từ GitHub..."
if [ ! -d ReClass.NET ]; then
  git clone --depth=1 https://github.com/ReClassNET/ReClass.NET.git
fi
cd ReClass.NET

echo "🧱 [3/7] Biên dịch NativeCore.Unix (Linux core)..."
cd NativeCore/Unix
make
cd ../../

echo "🧰 [4/7] Tải bản phát hành sẵn..."
LATEST_URL=$(curl -fsSL https://api.github.com/repos/ReClassNET/ReClass.NET/releases/latest \
  | jq -r '.assets[] | select(.name | test("^ReClass\\.NET\\.zip$")) | .browser_download_url')
if [ -z "${LATEST_URL}" ] || [ "${LATEST_URL}" = "null" ]; then
  echo "Không lấy được URL phát hành mới nhất." >&2
  exit 1
fi
wget -q "$LATEST_URL" -O ReClassNET.zip
unzip -oq ReClassNET.zip -d bin/Release/

echo "🚀 [5/7] Chuẩn bị chạy ReClass.NET bằng Mono..."
cd bin/Release
chmod +x ReClass.NET.exe || true

RUN_APP="false"
if [ "${1:-}" = "--run" ]; then
  RUN_APP="true"
fi

if [ "$RUN_APP" = "true" ]; then
  echo "Đang chạy ReClass.NET..."
  exec mono ReClass.NET.exe
else
  echo "Bỏ qua tự động chạy. Dùng: $0 --run để chạy ứng dụng."
fi

echo "✅ [6/7] Hoàn tất cài đặt."
echo "ℹ️  Tệp được giải nén tại: $(pwd)"

echo "🧹 [7/7] Dọn dẹp tệp tải về..."
cd - >/dev/null 2>&1
rm -f ReClassNET.zip || true
