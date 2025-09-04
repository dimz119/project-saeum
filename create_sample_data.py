#!/usr/bin/env python
import os
import sys
import django
from datetime import datetime, timedelta
from decimal import Decimal

# Django 설정
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shopping_mall.settings')
django.setup()

from products.models import Category, Brand, Product, ProductImage

def create_sample_data():
    print("🚀 샘플 데이터 생성 시작...")
    
    # 카테고리 생성
    categories_data = [
        {'name': '선글라스', 'slug': 'sunglasses'},
        {'name': '안경', 'slug': 'glasses'},
        {'name': '액세서리', 'slug': 'accessories'}
    ]
    
    categories = {}
    for cat_data in categories_data:
        category, created = Category.objects.get_or_create(
            slug=cat_data['slug'],
            defaults=cat_data
        )
        categories[cat_data['slug']] = category
        print(f"✅ 카테고리: {category.name}")
    
    # 브랜드 생성
    brands_data = [
        {'name': '치미', 'slug': 'chimi', 'description': '스웨덴 럭셔리 아이웨어 브랜드'},
        {'name': '레이밴', 'slug': 'rayban', 'description': '클래식 아이웨어의 대명사'},
        {'name': '구찌', 'slug': 'gucci', 'description': '이탈리아 명품 브랜드'},
        {'name': '톰포드', 'slug': 'tomford', 'description': '모던 럭셔리 아이웨어'},
        {'name': '젠틀몬스터', 'slug': 'gentlemonster', 'description': '한국 프리미엄 아이웨어'}
    ]
    
    brands = {}
    for brand_data in brands_data:
        brand, created = Brand.objects.get_or_create(
            slug=brand_data['slug'],
            defaults=brand_data
        )
        brands[brand_data['slug']] = brand
        print(f"✅ 브랜드: {brand.name}")
    
    # 상품 생성
    products_data = [
        # 치미 선글라스
        {
            'name': 'CHIMI 01 Black',
            'slug': 'chimi-01-black',
            'brand': 'chimi',
            'category': 'sunglasses',
            'description': '치미의 시그니처 선글라스. 미니멀한 디자인과 완벽한 핏.',
            'short_description': '치미 시그니처 블랙 선글라스',
            'price': Decimal('185000'),
            'sale_price': None,
            'sku': 'CHIMI-01-BLK',
            'stock': 15,
            'is_featured': True,
        },
        {
            'name': 'CHIMI 02 Tortoise',
            'slug': 'chimi-02-tortoise',
            'brand': 'chimi',
            'category': 'sunglasses',
            'description': '토터스 패턴의 세련된 치미 선글라스.',
            'short_description': '치미 토터스 패턴 선글라스',
            'price': Decimal('195000'),
            'sale_price': Decimal('156000'),
            'sku': 'CHIMI-02-TOR',
            'stock': 8,
            'is_featured': False,
        },
        # 레이밴 선글라스
        {
            'name': 'Ray-Ban Aviator Classic',
            'slug': 'rayban-aviator-classic',
            'brand': 'rayban',
            'category': 'sunglasses',
            'description': '전설적인 아비에이터 스타일. 시대를 초월한 클래식.',
            'short_description': '레이밴 아비에이터 클래식',
            'price': Decimal('220000'),
            'sale_price': None,
            'sku': 'RB-AVI-CLS',
            'stock': 20,
            'is_featured': True,
        },
        {
            'name': 'Ray-Ban Wayfarer',
            'slug': 'rayban-wayfarer',
            'brand': 'rayban',
            'category': 'sunglasses',
            'description': '웨이페어러 클래식. 모든 얼굴형에 어울리는 디자인.',
            'short_description': '레이밴 웨이페어러',
            'price': Decimal('198000'),
            'sale_price': Decimal('158400'),
            'sku': 'RB-WAY-CLS',
            'stock': 12,
            'is_featured': False,
        },
        # 구찌 선글라스
        {
            'name': 'Gucci GG0061S',
            'slug': 'gucci-gg0061s',
            'brand': 'gucci',
            'category': 'sunglasses',
            'description': '구찌 시그니처 로고가 돋보이는 럭셔리 선글라스.',
            'short_description': '구찌 시그니처 선글라스',
            'price': Decimal('450000'),
            'sale_price': None,
            'sku': 'GC-0061S',
            'stock': 5,
            'is_featured': True,
        },
        # 톰포드 선글라스
        {
            'name': 'Tom Ford FT0237',
            'slug': 'tomford-ft0237',
            'brand': 'tomford',
            'category': 'sunglasses',
            'description': '톰포드의 시그니처 T 로고가 포인트인 럭셔리 선글라스.',
            'short_description': '톰포드 시그니처 선글라스',
            'price': Decimal('520000'),
            'sale_price': Decimal('416000'),
            'sku': 'TF-0237',
            'stock': 3,
            'is_featured': False,
        },
        # 젠틀몬스터 선글라스
        {
            'name': 'Gentle Monster PAPAS',
            'slug': 'gentlemonster-papas',
            'brand': 'gentlemonster',
            'category': 'sunglasses',
            'description': '젠틀몬스터의 독창적 디자인이 돋보이는 선글라스.',
            'short_description': '젠틀몬스터 파파스',
            'price': Decimal('280000'),
            'sale_price': None,
            'sku': 'GM-PAPAS',
            'stock': 10,
            'is_featured': False,
        },
        # 안경 프레임
        {
            'name': 'CHIMI Reading 01',
            'slug': 'chimi-reading-01',
            'brand': 'chimi',
            'category': 'glasses',
            'description': '치미의 리딩 글래스. 세련된 디자인과 편안한 착용감.',
            'short_description': '치미 리딩 글래스',
            'price': Decimal('165000'),
            'sale_price': None,
            'sku': 'CHIMI-RD-01',
            'stock': 18,
            'is_featured': True,
        },
        {
            'name': 'Ray-Ban RX5154',
            'slug': 'rayban-rx5154',
            'brand': 'rayban',
            'category': 'glasses',
            'description': '클럽마스터 스타일의 안경 프레임.',
            'short_description': '레이밴 클럽마스터 프레임',
            'price': Decimal('180000'),
            'sale_price': Decimal('144000'),
            'sku': 'RB-5154',
            'stock': 25,
            'is_featured': False,
        },
        # 액세서리
        {
            'name': 'Luxury Glasses Chain',
            'slug': 'luxury-glasses-chain',
            'brand': 'gucci',
            'category': 'accessories',
            'description': '구찌 프리미엄 안경 체인. 골드 플레이팅.',
            'short_description': '구찌 프리미엄 안경 체인',
            'price': Decimal('85000'),
            'sale_price': None,
            'sku': 'GC-CHAIN-GLD',
            'stock': 30,
            'is_featured': False,
        },
        {
            'name': 'Premium Cleaning Kit',
            'slug': 'premium-cleaning-kit',
            'brand': 'tomford',
            'category': 'accessories',
            'description': '톰포드 프리미엄 안경 클리닝 키트.',
            'short_description': '톰포드 클리닝 키트',
            'price': Decimal('45000'),
            'sale_price': Decimal('36000'),
            'sku': 'TF-CLEAN-KIT',
            'stock': 50,
            'is_featured': False,
        },
        {
            'name': 'Leather Glasses Case',
            'slug': 'leather-glasses-case',
            'brand': 'gentlemonster',
            'category': 'accessories',
            'description': '젠틀몬스터 프리미엄 가죽 안경 케이스.',
            'short_description': '젠틀몬스터 가죽 케이스',
            'price': Decimal('65000'),
            'sale_price': None,
            'sku': 'GM-CASE-LTH',
            'stock': 40,
            'is_featured': False,
        }
    ]
    
    for product_data in products_data:
        brand_slug = product_data.pop('brand')
        category_slug = product_data.pop('category')
        
        product, created = Product.objects.get_or_create(
            slug=product_data['slug'],
            defaults={
                **product_data,
                'brand': brands[brand_slug],
                'category': categories[category_slug]
            }
        )
        print(f"✅ 상품: {product.name} ({'신규' if created else '기존'})")
    
    # 통계 출력
    print("\n📊 생성된 데이터 통계:")
    print(f"카테고리: {Category.objects.count()}개")
    print(f"브랜드: {Brand.objects.count()}개")
    print(f"전체 상품: {Product.objects.count()}개")
    print(f"추천 상품: {Product.objects.filter(is_featured=True).count()}개")
    print(f"세일 상품: {Product.objects.filter(sale_price__isnull=False).count()}개")
    
    print("\n🎉 샘플 데이터 생성 완료!")

if __name__ == "__main__":
    create_sample_data()
