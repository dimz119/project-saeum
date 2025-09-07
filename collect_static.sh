#!/bin/bash
# static 파일 수집 스크립트

cd /Users/seungjoonlee/git/project-saeum
source .venv/bin/activate

echo "📁 static 파일을 수집합니다..."
python manage.py collectstatic --noinput

echo "✅ static 파일 수집 완료!"
