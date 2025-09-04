# MonthlyLook Django 애플리케이션 Docker 배포 가이드

## 빠른 시작

### 1. 개발 환경 (코드 변경 시 즉시 반영)

```bash
# 개발 환경으로 실행 (볼륨 마운트로 코드 동기화)
docker-compose -f docker-compose.dev.yml up --build

# 백그라운드 실행
docker-compose -f docker-compose.dev.yml up -d

# 로그 확인
docker-compose -f docker-compose.dev.yml logs -f

# 중지
docker-compose -f docker-compose.dev.yml down
```

### 2. 프로덕션 환경

```bash
# 프로덕션 환경으로 실행
docker-compose up --build

# 백그라운드 실행
docker-compose up -d

# 중지
docker-compose down
```

## 개발 환경의 특징

### 실시간 코드 반영
- **볼륨 마운트**: 로컬 코드가 컨테이너와 실시간 동기화
- **Django 개발 서버**: 코드 변경 시 자동 재시작
- **DEBUG=True**: 개발용 설정 활성화

### 개발 도구 포함
- `ipython`: 향상된 Python 인터프리터
- `django-extensions`: Django 확장 도구
- `ipdb`: Python 디버거
- `git`, `vim`, `curl`: 기본 개발 도구

### 사용 방법
```bash
# 개발 환경 시작
docker-compose -f docker-compose.dev.yml up

# 코드 수정 후 브라우저에서 즉시 확인 가능
# Python 파일 변경 시 Django 서버 자동 재시작
# 정적 파일 변경 시 브라우저 새로고침만 하면 적용
```

## 프로덕션 배포

### 1. 환경 변수 설정

```bash
# .env.example을 .env로 복사하고 값 수정
cp .env.example .env
# .env 파일을 편집하여 실제 값들로 변경
```

### 2. PostgreSQL 사용 (권장)

docker-compose.yml에서 PostgreSQL 설정의 주석을 해제하고:

```bash
# PostgreSQL과 함께 실행
docker-compose up -d
```

### 3. 초기 설정

```bash
# 컨테이너 내부로 접속
docker-compose exec web bash

# 슈퍼유저 생성
python manage.py createsuperuser

# 초기 데이터 로드 (있다면)
python manage.py loaddata initial_data.json
```

## 주요 Docker 명령어

```bash
# 이미지 빌드
docker build -t monthlylook .

# 컨테이너 실행
docker run -p 8000:8000 monthlylook

# 실행 중인 컨테이너 확인
docker ps

# 컨테이너 중지
docker stop <container_id>

# 이미지 삭제
docker rmi monthlylook

# 모든 중지된 컨테이너 삭제
docker container prune

# 사용하지 않는 이미지 삭제
docker image prune
```

## Docker Compose 명령어

```bash
# 빌드 및 실행
docker-compose up --build

# 백그라운드 실행
docker-compose up -d

# 중지
docker-compose down

# 볼륨까지 삭제
docker-compose down -v

# 특정 서비스만 재시작
docker-compose restart web

# 로그 확인
docker-compose logs web
```

## 환경별 설정

### 개발 환경
- SQLite 사용
- DEBUG=True
- 로컬 파일 시스템 사용

### 프로덕션 환경
- PostgreSQL 사용
- DEBUG=False
- 정적 파일은 nginx 또는 CDN 사용 권장
- 미디어 파일은 AWS S3 등 클라우드 스토리지 사용 권장

## 트러블슈팅

### 포트 충돌
```bash
# 다른 포트로 실행
docker run -p 8080:8000 monthlylook
```

### 정적 파일 문제
```bash
# 정적 파일 재수집
docker-compose exec web python manage.py collectstatic --noinput
```

### 데이터베이스 마이그레이션
```bash
# 마이그레이션 실행
docker-compose exec web python manage.py migrate
```

### 권한 문제
```bash
# 볼륨 권한 확인
docker-compose exec web ls -la /app/media
```

## 모니터링

### 컨테이너 상태 확인
```bash
# 리소스 사용량 확인
docker stats

# 컨테이너 내부 확인
docker-compose exec web bash
```

### 로그 모니터링
```bash
# 실시간 로그 확인
docker-compose logs -f web

# 특정 시간 이후 로그
docker-compose logs --since="2h" web
```
