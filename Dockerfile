# Python 3.13 공식 이미지 사용
FROM python:3.13-slim

# 환경 변수 설정
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=shopping_mall.settings

# 작업 디렉토리 설정
WORKDIR /app

# 시스템 패키지 업데이트 및 필요한 패키지 설치
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        gettext \
        sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Python 의존성 설치
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# 프로젝트 파일 복사 (SQLite 파일 포함)
COPY . /app/

# 배포용 환경 변수는 Fly.io에서 설정됨
# SQLite 파일을 포함한 프로젝트 파일들이 함께 업로드됨

# 정적 파일 수집
RUN python manage.py collectstatic --noinput

# Django Compressor 압축 (배포용)
RUN python manage.py compress --force || echo "Compress command failed, continuing..."

# 미디어 파일 디렉토리 생성
RUN mkdir -p /app/media

# 포트 노출
EXPOSE 8000

# 애플리케이션 실행
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "shopping_mall.wsgi:application"]
