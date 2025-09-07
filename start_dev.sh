#!/bin/bash
# 개발 서버 시작 스크립트

cd /Users/seungjoonlee/git/project-saeum
source .venv/bin/activate

echo "🚀 Django 개발 서버를 시작합니다..."
echo "📍 URL: http://127.0.0.1:8000"
echo "⏹️  종료하려면 Ctrl+C를 누르세요"
echo ""

python manage.py runserver
