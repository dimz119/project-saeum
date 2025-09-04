# Python 3.11 공식 이미지 사용
FROM python:3.11-slim

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
        libpq-dev \
        gettext \
    && rm -rf /var/lib/apt/lists/*

# Python 의존성 설치
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# 프로젝트 파일 복사
COPY . /app/

# 데이터베이스 마이그레이션
RUN python manage.py makemigrations --noinput
RUN python manage.py migrate --noinput

# 정적 파일 수집
RUN python manage.py collectstatic --noinput

# 미디어 파일 디렉토리 생성
RUN mkdir -p /app/media

# 포트 노출
EXPOSE 8000

# 애플리케이션 실행
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "shopping_mall.wsgi:application"]
