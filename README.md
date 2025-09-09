# Testing Account
test@example.com
test123

# SAEUM - 프리미엄 쇼핑몰

source .venv/bin/activate && python manage.py collectstatic --noinput
Django REST API 백엔드와 React 프론트엔드, Stripe 결제 시스템을 활용한 현대적인 쇼핑몰 플랫폼입니다.

## 🌟 주요 기능

### 🛍️ 상품 관리
- **브랜드별 카테고리 분류**: 치미, 레이밴, 구찌, 톰포드 등 프리미엄 브랜드
- **상품 상세 정보**: 가격, 할인가, 재고, 상품 이미지
- **추천 상품 시스템**: 메인 페이지 추천 상품 표시
- **검색 및 필터링**: 브랜드, 카테고리, 가격대별 필터링

### 🎨 사용자 인터페이스
- **totalsun.co.kr 참조 디자인**: 깔끔하고 세련된 UI/UX
- **반응형 디자인**: 모바일과 데스크탑 환경 모두 지원
- **React 기반 SPA**: 빠르고 부드러운 사용자 경험
- **실시간 상품 정보**: API를 통한 동적 데이터 로딩

### 💳 결제 시스템
- **Stripe 결제 연동**: 안전하고 신뢰할 수 있는 결제 시스템
- **다양한 결제 방법**: 신용카드, 무통장입금, 카카오페이 등
- **주문 관리**: 주문 상태 추적 및 관리
- **재고 관리**: 실시간 재고 차감 및 관리

## 🛠️ 기술 스택

### Backend
- **Django 5.2.5**: 웹 프레임워크
- **Django REST Framework**: API 개발
- **Stripe**: 결제 처리
- **SQLite**: 데이터베이스 (개발용)
- **Python 3.13**: 프로그래밍 언어

### Frontend
- **React 18**: 사용자 인터페이스
- **Babel**: JavaScript 트랜스파일러
- **CSS3**: 스타일링
- **Font Awesome**: 아이콘

### 패키지
- `django-cors-headers`: CORS 설정
- `django-filter`: 필터링 기능
- `python-decouple`: 환경변수 관리
- `Pillow`: 이미지 처리

## 🚀 설치 및 실행

### 1. 가상환경 설정
```bash
python -m venv .venv
source .venv/bin/activate  # macOS/Linux
# 또는
.venv\Scripts\activate  # Windows
```

### 2. 의존성 설치
```bash
pip install django djangorestframework django-cors-headers stripe pillow python-decouple django-filter
```

### 3. 환경변수 설정
`.env` 파일에 Stripe 키 설정:
```env
STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 4. 데이터베이스 설정
```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. 관리자 계정 생성
```bash
python manage.py createsuperuser
```

### 6. 샘플 데이터 생성
```bash
python manage.py create_sample_data
```

### 7. 서버 실행
```bash
python manage.py runserver
```

## 📱 사용법

### 메인 페이지 접속
- http://127.0.0.1:8000/ 에서 메인 페이지 확인

### 관리자 페이지
- http://127.0.0.1:8000/admin/ 에서 상품 관리

### API 엔드포인트
- `/api/products/` - 상품 목록
- `/api/products/featured/` - 추천 상품
- `/api/products/{slug}/` - 상품 상세
- `/api/payments/create-payment-intent/` - 결제 시작
- `/api/payments/confirm-payment/` - 결제 확인

## 🏗️ 프로젝트 구조

```
shopping_mall/
├── shopping_mall/          # Django 설정
├── products/               # 상품 관리 앱
│   ├── models.py          # 상품, 브랜드, 카테고리 모델
│   ├── views.py           # API 뷰
│   ├── serializers.py     # API 시리얼라이저
│   └── admin.py           # 관리자 페이지
├── orders/                # 주문 관리 앱
│   ├── models.py          # 주문, 장바구니 모델
│   └── admin.py           # 주문 관리
├── payments/              # 결제 관리 앱
│   ├── models.py          # 결제, 환불 모델
│   ├── views.py           # Stripe 결제 처리
│   └── admin.py           # 결제 관리
├── templates/             # HTML 템플릿
│   ├── index.html         # 메인 페이지
│   └── product_detail.html # 상품 상세 페이지
├── static/               # 정적 파일
└── media/                # 미디어 파일
```

## 📊 데이터 모델

### 상품 관련
- **Category**: 상품 카테고리 (선글라스, 안경, 액세서리 등)
- **Brand**: 브랜드 정보 (치미, 레이밴, 구찌 등)
- **Product**: 상품 정보 (이름, 가격, 설명, 재고 등)
- **ProductImage**: 상품 이미지
- **Review**: 상품 리뷰

### 주문 관련
- **Order**: 주문 정보
- **OrderItem**: 주문 상품 목록
- **Cart**: 장바구니
- **CartItem**: 장바구니 상품

### 결제 관련
- **Payment**: 결제 정보
- **Refund**: 환불 정보

## 🎨 디자인 특징

- **미니멀한 디자인**: 깔끔하고 세련된 인터페이스
- **브랜드 중심**: 각 브랜드의 특색을 살린 상품 전시
- **사용자 친화적**: 직관적인 네비게이션과 상품 탐색
- **모바일 최적화**: 반응형 디자인으로 모든 기기에서 최적화

## 🔧 추후 개발 계획

- [ ] 사용자 인증 시스템 (회원가입/로그인)
- [ ] 장바구니 기능 완성
- [ ] 찜하기/위시리스트 기능
- [ ] 상품 리뷰 시스템
- [ ] 주문 추적 시스템
- [ ] 재고 알림 시스템
- [ ] 할인 쿠폰 시스템
- [ ] 배송 정보 연동

## 📄 라이센스

이 프로젝트는 개인 포트폴리오 목적으로 제작되었습니다.

---

**SAEUM** - 프리미엄 라이프스타일의 새로운 기준
