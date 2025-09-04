#!/bin/bash

# 데이터베이스 연결 대기
echo "Waiting for database..."
while ! nc -z db 5432; do
  sleep 0.1
done
echo "Database started"

# 데이터베이스 마이그레이션
echo "Running database migrations..."
python manage.py migrate

# 정적 파일 수집
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Superuser 생성 (선택사항)
echo "Creating superuser..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Superuser created successfully')
else:
    print('Superuser already exists')
"

# 애플리케이션 시작
echo "Starting server..."
exec "$@"
