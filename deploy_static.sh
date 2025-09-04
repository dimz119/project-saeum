#!/bin/bash

echo "🚀 배포용 정적 파일 준비 중..."

# 환경 변수 설정
export DEBUG=False
export COMPRESS_ENABLED=True
export COMPRESS_OFFLINE=True

# 정적 파일 수집
echo "📦 정적 파일 수집 중..."
python manage.py collectstatic --noinput --clear

# Django Compressor 압축
echo "🗜️ CSS/JS 파일 압축 중..."
python manage.py compress --force

# Fly.dev에 배포
echo "🛫 Fly.dev에 배포 중..."
fly deploy

echo "✅ 배포 완료!"
