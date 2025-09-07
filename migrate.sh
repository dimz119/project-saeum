#!/bin/bash
# 마이그레이션 실행 스크립트

cd /Users/seungjoonlee/git/project-saeum
source .venv/bin/activate

echo "🔄 데이터베이스 마이그레이션을 실행합니다..."
python manage.py makemigrations
python manage.py migrate

echo "✅ 마이그레이션 완료!"
