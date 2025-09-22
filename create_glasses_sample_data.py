#!/usr/bin/env python
"""
안경 관련 샘플 데이터 생성 스크립트
"""
import os
import sys
import django
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth import get_user_model
from decimal import Decimal
import random

# Django 설정
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shopping_mall.settings')
django.setup()

from products.models import Brand, Product, ProductImage, Category, Tag, ModelPhoto, Announcement
from celebrities.models import Celebrity
from accounts.models import User

User = get_user_model()

def create_admin_user():
    """관리자 계정 생성"""
    if not User.objects.filter(username='admin').exists():
        admin = User.objects.create_superuser(
            username='admin',
            email='admin@monthlylook.com',
            password='admin123',
            first_name='관리자',
            last_name='MonthlyLook'
        )
        print(f"✅ 관리자 계정 생성: {admin.username}")
        return admin
    else:
        print("✅ 관리자 계정이 이미 존재합니다.")
        return User.objects.get(username='admin')

def create_brands():
    """안경 브랜드 생성"""
    brands_data = [
        {
            'name': 'Ray-Ban',
            'description': '세계에서 가장 유명한 선글라스 브랜드. 1937년부터 시작된 미국의 대표 아이웨어 브랜드.',
            'slug': 'ray-ban'
        },
        {
            'name': 'Oakley',
            'description': '스포츠 선글라스의 대명사. 혁신적인 기술과 디자인으로 유명한 프리미엄 아이웨어 브랜드.',
            'slug': 'oakley'
        },
        {
            'name': 'Persol',
            'description': '이탈리아의 고급 안경 브랜드. 수제 안경의 최고봉으로 인정받는 럭셔리 아이웨어.',
            'slug': 'persol'
        },
        {
            'name': 'Tom Ford',
            'description': '패션 디자이너 톰 포드의 럭셔리 아이웨어 브랜드. 세련되고 모던한 디자인.',
            'slug': 'tom-ford'
        },
        {
            'name': 'Oliver Peoples',
            'description': '미국 LA 기반의 프리미엄 안경 브랜드. 빈티지와 모던함을 조화시킨 독특한 디자인.',
            'slug': 'oliver-peoples'
        },
        {
            'name': 'Gentle Monster',
            'description': '한국의 대표 아이웨어 브랜드. 실험적이고 아방가르드한 디자인으로 전 세계에서 인기.',
            'slug': 'gentle-monster'
        },
        {
            'name': 'Maui Jim',
            'description': '하와이에서 시작된 편광 선글라스 전문 브랜드. 최고의 렌즈 기술을 자랑.',
            'slug': 'maui-jim'
        },
        {
            'name': 'Warby Parker',
            'description': '미국의 온라인 안경 브랜드. 합리적인 가격과 세련된 디자인으로 젊은 층에게 인기.',
            'slug': 'warby-parker'
        }
    ]
    
    brands = []
    for brand_data in brands_data:
        brand, created = Brand.objects.get_or_create(
            name=brand_data['name'],
            defaults={
                'description': brand_data['description'],
                'slug': brand_data['slug']
            }
        )
        brands.append(brand)
        print(f"✅ 브랜드 {'생성' if created else '확인'}: {brand.name}")
    
    return brands

def create_categories():
    """카테고리 생성"""
    categories_data = [
        {'name': '선글라스', 'slug': 'sunglasses'},
        {'name': '안경테', 'slug': 'eyeglasses'},
        {'name': '스포츠글라스', 'slug': 'sports-glasses'},
        {'name': '블루라이트 차단안경', 'slug': 'blue-light-glasses'},
        {'name': '독서용 안경', 'slug': 'reading-glasses'},
    ]
    
    categories = []
    for cat_data in categories_data:
        category, created = Category.objects.get_or_create(
            name=cat_data['name'],
            defaults={'slug': cat_data['slug']}
        )
        categories.append(category)
        print(f"✅ 카테고리 {'생성' if created else '확인'}: {category.name}")
    
    return categories

def create_tags():
    """태그 생성"""
    tags_data = [
        {'name': '클래식', 'slug': 'classic'},
        {'name': '모던', 'slug': 'modern'},
        {'name': '빈티지', 'slug': 'vintage'},
        {'name': '스포티', 'slug': 'sporty'},
        {'name': '럭셔리', 'slug': 'luxury'},
        {'name': '캐주얼', 'slug': 'casual'},
        {'name': '비즈니스', 'slug': 'business'},
        {'name': '라운드', 'slug': 'round'},
        {'name': '스퀘어', 'slug': 'square'},
        {'name': '캣아이', 'slug': 'cat-eye'},
        {'name': '아비에이터', 'slug': 'aviator'},
        {'name': '웨이페어러', 'slug': 'wayfarer'},
        {'name': '편광', 'slug': 'polarized'},
        {'name': '미러', 'slug': 'mirror'},
        {'name': '그라데이션', 'slug': 'gradient'},
        {'name': '투명', 'slug': 'transparent'},
        {'name': '블랙', 'slug': 'black'},
        {'name': '브라운', 'slug': 'brown'},
        {'name': '골드', 'slug': 'gold'},
        {'name': '실버', 'slug': 'silver'},
        {'name': '베스트셀러', 'slug': 'bestseller'},
        {'name': '신상품', 'slug': 'new'},
        {'name': '블루라이트', 'slug': 'blue-light'},
        {'name': '가성비', 'slug': 'value'},
        {'name': '미니멀', 'slug': 'minimal'},
        {'name': '실험적', 'slug': 'experimental'}
    ]
    
    tags = []
    for tag_data in tags_data:
        tag, created = Tag.objects.get_or_create(
            name=tag_data['name'],
            defaults={'slug': tag_data['slug']}
        )
        tags.append(tag)
        if created:
            print(f"✅ 태그 생성: {tag.name}")
    
    return tags

def create_products(brands, categories, tags):
    """안경 제품 생성"""
    products_data = [
        # Ray-Ban 제품들
        {
            'brand': 'Ray-Ban',
            'category': '선글라스',
            'name': 'Aviator Classic',
            'slug': 'ray-ban-aviator-classic',
            'description': '레이밴의 대표작인 아비에이터 선글라스. 1937년 출시 이후 변함없는 인기를 자랑하는 클래식 디자인.',
            'short_description': '클래식 아비에이터 선글라스',
            'price': 180000,
            'sale_price': 160000,
            'sku': 'RB-AVI-001',
            'tags': ['클래식', '아비에이터', '골드', '베스트셀러'],
            'is_featured': True,
            'is_new': False,
            'stock': 50
        },
        {
            'brand': 'Ray-Ban',
            'category': '선글라스',
            'name': 'Wayfarer Original',
            'slug': 'ray-ban-wayfarer-original',
            'description': '1952년 출시된 웨이페어러의 오리지널 모델. 반세기 넘게 사랑받는 아이코닉한 디자인.',
            'short_description': '오리지널 웨이페어러 선글라스',
            'price': 165000,
            'sale_price': 145000,
            'sku': 'RB-WAY-001',
            'tags': ['클래식', '웨이페어러', '블랙', '베스트셀러'],
            'is_featured': True,
            'is_new': False,
            'stock': 45
        },
        {
            'brand': 'Ray-Ban',
            'category': '선글라스',
            'name': 'Round Metal',
            'slug': 'ray-ban-round-metal',
            'description': '존 레논이 착용해 유명해진 라운드 메탈 선글라스. 빈티지하면서도 모던한 매력.',
            'short_description': '라운드 메탈 선글라스',
            'price': 175000,
            'sale_price': None,
            'sku': 'RB-RND-001',
            'tags': ['빈티지', '라운드', '골드', '클래식'],
            'is_featured': False,
            'is_new': False,
            'stock': 30
        },
        
        # Oakley 제품들
        {
            'brand': 'Oakley',
            'category': '스포츠글라스',
            'name': 'Holbrook',
            'slug': 'oakley-holbrook',
            'description': '오클리의 대표적인 라이프스타일 선글라스. 스포츠와 캐주얼을 넘나드는 다재다능한 디자인.',
            'short_description': '라이프스타일 선글라스',
            'price': 195000,
            'sale_price': 175000,
            'sku': 'OAK-HOL-001',
            'tags': ['스포티', '캐주얼', '편광', '블랙'],
            'is_featured': True,
            'is_new': False,
            'stock': 40
        },
        {
            'brand': 'Oakley',
            'category': '스포츠글라스',
            'name': 'Radar EV Path',
            'slug': 'oakley-radar-ev-path',
            'description': '프로 스포츠 선수들이 선택하는 고성능 스포츠 선글라스. 뛰어난 시야각과 보호 기능.',
            'short_description': '고성능 스포츠 선글라스',
            'price': 285000,
            'sale_price': None,
            'sku': 'OAK-RAD-001',
            'tags': ['스포티', '편광', '미러', '신상품'],
            'is_featured': False,
            'is_new': True,
            'stock': 25
        },
        
        # Persol 제품들
        {
            'brand': 'Persol',
            'category': '선글라스',
            'name': 'PO0714 Steve McQueen',
            'slug': 'persol-po0714-steve-mcqueen',
            'description': '스티브 맥퀸이 착용했던 전설적인 모델. 접이식 디자인과 수제 아세테이트 소재.',
            'short_description': '스티브 맥퀸 시그니처 모델',
            'price': 450000,
            'sale_price': 420000,
            'sku': 'PER-714-001',
            'tags': ['럭셔리', '빈티지', '브라운', '클래식'],
            'is_featured': True,
            'is_new': False,
            'stock': 15
        },
        {
            'brand': 'Persol',
            'category': '안경테',
            'name': 'PO3007V',
            'slug': 'persol-po3007v',
            'description': '이탈리아 수제 안경테. 클래식한 웰링턴 스타일과 Persol만의 고급스러운 마감.',
            'short_description': '이탈리아 수제 안경테',
            'price': 380000,
            'sale_price': None,
            'sku': 'PER-3007-001',
            'tags': ['럭셔리', '비즈니스', '브라운', '클래식'],
            'is_featured': False,
            'is_new': False,
            'stock': 20
        },
        
        # Tom Ford 제품들
        {
            'brand': 'Tom Ford',
            'category': '선글라스',
            'name': 'Tom Ford FT0336',
            'slug': 'tom-ford-ft0336',
            'description': '톰 포드의 시그니처 디자인. 럭셔리하고 세련된 오버사이즈 선글라스.',
            'short_description': '시그니처 오버사이즈 선글라스',
            'price': 520000,
            'sale_price': None,
            'sku': 'TF-336-001',
            'tags': ['럭셔리', '모던', '블랙', '비즈니스'],
            'is_featured': True,
            'is_new': False,
            'stock': 12
        },
        
        # Oliver Peoples 제품들
        {
            'brand': 'Oliver Peoples',
            'category': '안경테',
            'name': 'Gregory Peck',
            'slug': 'oliver-peoples-gregory-peck',
            'description': '배우 그레고리 펙의 이름을 딴 빈티지 라운드 안경테. 클래식한 매력과 현대적 감각의 조화.',
            'short_description': '빈티지 라운드 안경테',
            'price': 420000,
            'sale_price': 380000,
            'sku': 'OP-GP-001',
            'tags': ['빈티지', '라운드', '브라운', '클래식'],
            'is_featured': False,
            'is_new': False,
            'stock': 18
        },
        {
            'brand': 'Oliver Peoples',
            'category': '선글라스',
            'name': 'O\'Malley',
            'slug': 'oliver-peoples-omalley',
            'description': '올리버 피플스의 아이코닉한 모델. 60년대 스타일을 현대적으로 재해석한 디자인.',
            'short_description': '60년대 스타일 선글라스',
            'price': 465000,
            'sale_price': None,
            'sku': 'OP-OM-001',
            'tags': ['빈티지', '스퀘어', '럭셔리', '클래식'],
            'is_featured': False,
            'is_new': False,
            'stock': 22
        },
        
        # Gentle Monster 제품들
        {
            'brand': 'Gentle Monster',
            'category': '선글라스',
            'name': 'Black Peter',
            'slug': 'gentle-monster-black-peter',
            'description': '젠틀몬스터의 베스트셀러. 미니멀하면서도 강렬한 인상을 주는 디자인.',
            'short_description': '미니멀 디자인 선글라스',
            'price': 280000,
            'sale_price': 250000,
            'sku': 'GM-BP-001',
            'tags': ['모던', '미니멀', '블랙', '베스트셀러'],
            'is_featured': True,
            'is_new': False,
            'stock': 35
        },
        {
            'brand': 'Gentle Monster',
            'category': '안경테',
            'name': 'Papas',
            'slug': 'gentle-monster-papas',
            'description': '독특한 형태의 안경테. 젠틀몬스터만의 실험적인 디자인 철학이 담긴 작품.',
            'short_description': '실험적 디자인 안경테',
            'price': 320000,
            'sale_price': None,
            'sku': 'GM-PAP-001',
            'tags': ['모던', '실험적', '투명', '신상품'],
            'is_featured': False,
            'is_new': True,
            'stock': 28
        },
        
        # Maui Jim 제품들
        {
            'brand': 'Maui Jim',
            'category': '선글라스',
            'name': 'Peahi',
            'slug': 'maui-jim-peahi',
            'description': '하와이의 바다를 보호하는 최고급 편광 렌즈. 선명한 시야와 완벽한 자외선 차단.',
            'short_description': '최고급 편광 선글라스',
            'price': 385000,
            'sale_price': 350000,
            'sku': 'MJ-PEA-001',
            'tags': ['편광', '스포티', '그라데이션', '베스트셀러'],
            'is_featured': True,
            'is_new': False,
            'stock': 30
        },
        
        # Warby Parker 제품들
        {
            'brand': 'Warby Parker',
            'category': '안경테',
            'name': 'Winston',
            'slug': 'warby-parker-winston',
            'description': '클래식한 라운드 안경테. 가볍고 편안한 착용감과 합리적인 가격.',
            'short_description': '클래식 라운드 안경테',
            'price': 125000,
            'sale_price': 110000,
            'sku': 'WP-WIN-001',
            'tags': ['라운드', '캐주얼', '가성비', '신상품'],
            'is_featured': False,
            'is_new': True,
            'stock': 50
        },
        {
            'brand': 'Warby Parker',
            'category': '블루라이트 차단안경',
            'name': 'Felix Blue Light',
            'slug': 'warby-parker-felix-blue-light',
            'description': '디지털 기기 사용 시 눈의 피로를 줄여주는 블루라이트 차단 안경.',
            'short_description': '블루라이트 차단 안경',
            'price': 145000,
            'sale_price': None,
            'sku': 'WP-FEL-001',
            'tags': ['블루라이트', '캐주얼', '가성비', '신상품'],
            'is_featured': False,
            'is_new': True,
            'stock': 60
        }
    ]
    
    # 브랜드, 카테고리, 태그를 딕셔너리로 변환
    brand_dict = {brand.name: brand for brand in brands}
    category_dict = {cat.name: cat for cat in categories}
    tag_dict = {tag.name: tag for tag in tags}
    
    products = []
    for product_data in products_data:
        product, created = Product.objects.get_or_create(
            name=product_data['name'],
            defaults={
                'slug': product_data['slug'],
                'description': product_data['description'],
                'short_description': product_data['short_description'],
                'price': Decimal(str(product_data['price'])),
                'sale_price': Decimal(str(product_data['sale_price'])) if product_data['sale_price'] else None,
                'sku': product_data['sku'],
                'category': category_dict[product_data['category']],
                'brand': brand_dict[product_data['brand']],
                'is_featured': product_data['is_featured'],
                'is_new': product_data['is_new'],
                'stock': product_data['stock'],
                'is_active': True
            }
        )
        
        # 태그 추가
        if created:
            for tag_name in product_data['tags']:
                if tag_name in tag_dict:
                    product.tags.add(tag_dict[tag_name])
        
        products.append(product)
        print(f"✅ 제품 {'생성' if created else '확인'}: {product.name}")
    
    return products

def create_sample_celebrities():
    """셀레브리티 샘플 데이터 생성"""
    celebrities_data = [
        {
            'name': '김태리',
            'description': '영화 "아가씨"로 데뷔한 대한민국의 배우. 독특하고 개성 있는 안경 스타일로 유명.'
        },
        {
            'name': '공유',
            'description': '드라마 "도깨비"로 유명한 배우. 클래식한 안경 스타일의 대표주자.'
        },
        {
            'name': '정호연',
            'description': '넷플릭스 "오징어 게임"으로 세계적 스타가 된 배우. 모던하고 세련된 안경 패션.'
        },
        {
            'name': 'BTS 뷔',
            'description': '방탄소년단의 멤버. 다양한 안경 스타일을 소화하는 패션 아이콘.'
        }
    ]
    
    celebrities = []
    for celeb_data in celebrities_data:
        celebrity, created = Celebrity.objects.get_or_create(
            name=celeb_data['name'],
            defaults={'description': celeb_data['description']}
        )
        celebrities.append(celebrity)
        print(f"✅ 셀레브리티 {'생성' if created else '확인'}: {celebrity.name}")
    
    return celebrities

def create_announcements():
    """공지사항 생성"""
    announcements_data = [
        {
            'title': '2024 신상 안경 컬렉션 출시',
            'content': '새로운 시즌을 맞아 다양한 브랜드의 신상 안경들이 입고되었습니다. 트렌디한 디자인부터 클래식한 스타일까지 만나보세요.',
            'is_banner': True
        },
        {
            'title': '블루라이트 차단 안경 할인 이벤트',
            'content': '디지털 기기 사용이 많은 현대인을 위한 블루라이트 차단 안경을 특가로 만나보세요. 눈 건강을 지키면서 스타일도 놓치지 마세요.',
            'is_banner': True
        },
        {
            'title': '안경 관리 가이드',
            'content': '소중한 안경을 오래 사용하기 위한 관리 방법을 알려드립니다. 올바른 세척법과 보관법으로 안경 수명을 늘려보세요.',
            'is_banner': False
        }
    ]
    
    announcements = []
    for ann_data in announcements_data:
        announcement, created = Announcement.objects.get_or_create(
            title=ann_data['title'],
            defaults={
                'content': ann_data['content'],
                'is_banner': ann_data['is_banner'],
                'is_active': True
            }
        )
        announcements.append(announcement)
        print(f"✅ 공지사항 {'생성' if created else '확인'}: {announcement.title}")
    
    return announcements

def main():
    """메인 실행 함수"""
    print("🚀 안경 관련 샘플 데이터 생성 시작...")
    
    # 1. 관리자 계정 생성
    admin_user = create_admin_user()
    
    # 2. 브랜드 생성
    brands = create_brands()
    
    # 3. 카테고리 생성
    categories = create_categories()
    
    # 4. 태그 생성
    tags = create_tags()
    
    # 5. 제품 생성
    products = create_products(brands, categories, tags)
    
    # 6. 셀레브리티 생성
    celebrities = create_sample_celebrities()
    
    # 7. 공지사항 생성
    announcements = create_announcements()
    
    print("\n" + "="*50)
    print("✅ 샘플 데이터 생성 완료!")
    print(f"📊 생성된 데이터:")
    print(f"   - 브랜드: {len(brands)}개")
    print(f"   - 카테고리: {len(categories)}개")
    print(f"   - 태그: {len(tags)}개")
    print(f"   - 제품: {len(products)}개")
    print(f"   - 셀레브리티: {len(celebrities)}개")
    print(f"   - 공지사항: {len(announcements)}개")
    print("\n🔑 관리자 계정 정보:")
    print(f"   - 사용자명: admin")
    print(f"   - 비밀번호: admin123")
    print(f"   - 관리자 페이지: http://127.0.0.1:8000/admin/")
    print("="*50)

if __name__ == '__main__':
    main()
