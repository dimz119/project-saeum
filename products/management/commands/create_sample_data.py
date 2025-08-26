from django.core.management.base import BaseCommand
from django.utils.text import slugify
from products.models import Category, Brand, Product, ProductImage
from decimal import Decimal


class Command(BaseCommand):
    help = '샘플 상품 데이터를 생성합니다'

    def handle(self, *args, **options):
        # 카테고리 생성
        categories_data = [
            {'name': '선글라스', 'slug': 'sunglasses'},
            {'name': '안경', 'slug': 'glasses'},
            {'name': '액세서리', 'slug': 'accessories'},
            {'name': '스포츠', 'slug': 'sports'},
        ]
        
        categories = {}
        for cat_data in categories_data:
            category, created = Category.objects.get_or_create(
                slug=cat_data['slug'],
                defaults={'name': cat_data['name']}
            )
            categories[cat_data['slug']] = category
            if created:
                self.stdout.write(f"카테고리 '{category.name}' 생성됨")

        # 브랜드 생성
        brands_data = [
            {'name': '치미', 'slug': 'chimi', 'description': '스웨덴 스톡홀름의 독립 아이웨어 브랜드'},
            {'name': '레이밴', 'slug': 'rayban', 'description': '클래식한 스타일의 대표 브랜드'},
            {'name': '구찌', 'slug': 'gucci', 'description': '과감한 프레임과 컬러 조합의 럭셔리 브랜드'},
            {'name': '톰포드', 'slug': 'tomford', 'description': '정교하고 아름다운 프리미엄 아이웨어'},
            {'name': '래쉬', 'slug': 'lash', 'description': '모던 유니폼 테마의 세련된 디자인'},
            {'name': '오클리', 'slug': 'oakley', 'description': '스포츠 아이웨어의 새로운 표준'},
        ]
        
        brands = {}
        for brand_data in brands_data:
            brand, created = Brand.objects.get_or_create(
                slug=brand_data['slug'],
                defaults={
                    'name': brand_data['name'],
                    'description': brand_data['description']
                }
            )
            brands[brand_data['slug']] = brand
            if created:
                self.stdout.write(f"브랜드 '{brand.name}' 생성됨")

        # 상품 생성
        products_data = [
            {
                'name': 'CHIMI RIMLESS PARALLEL BLACK',
                'slug': 'chimi-rimless-parallel-black',
                'brand': 'chimi',
                'category': 'sunglasses',
                'description': '각진 직사각형 림리스 실루엣과 경량 매트 블랙 티타늄 프레임으로 미니멀하면서도 세련된 인상을 선사합니다.',
                'short_description': '미니멀한 림리스 디자인',
                'price': Decimal('280000'),
                'sku': 'CHI-RIM-PAR-BLK',
                'stock': 50,
                'is_featured': True,
            },
            {
                'name': 'CHIMI CODE BLACK',
                'slug': 'chimi-code-black',
                'brand': 'chimi',
                'category': 'sunglasses',
                'description': '트와이스 나연, 베이비몬스터 루카, 켄달 제너가 착용한 인기 모델입니다.',
                'short_description': '셀럽 착용 인기 모델',
                'price': Decimal('280000'),
                'sku': 'CHI-CODE-BLK',
                'stock': 30,
                'is_featured': True,
            },
            {
                'name': '구찌 GG1661S 001',
                'slug': 'gucci-gg1661s-001',
                'brand': 'gucci',
                'category': 'sunglasses',
                'description': '슬림한 스퀘어 실루엣과 템플의 골드 GG 로고 디테일이 90년대 무드를 현대적으로 재해석한 디자인입니다.',
                'short_description': '애비 리, 헤일리 비버 착용',
                'price': Decimal('510000'),
                'sku': 'GUC-GG1661-001',
                'stock': 25,
                'is_featured': True,
            },
            {
                'name': 'lash NORA C1',
                'slug': 'lash-nora-c1',
                'brand': 'lash',
                'category': 'sunglasses',
                'description': '권은비, 시우민이 착용한 모던하고 세련된 디자인의 선글라스입니다.',
                'short_description': '권은비, 시우민 착용',
                'price': Decimal('258000'),
                'sku': 'LSH-NORA-C1',
                'stock': 40,
                'is_featured': False,
            },
            {
                'name': '레이밴 RB4430F ZENA',
                'slug': 'rayban-rb4430f-zena',
                'brand': 'rayban',
                'category': 'sunglasses',
                'description': '에밀리 라타이코프스키가 착용한 클래식한 디자인의 선글라스입니다.',
                'short_description': '에밀리 라타이코프스키 착용',
                'price': Decimal('201000'),
                'sale_price': Decimal('160800'),
                'sku': 'RAY-RB4430-ZENA',
                'stock': 35,
                'is_featured': False,
            },
            {
                'name': '톰포드 TF6015-K-B 001',
                'slug': 'tomford-tf6015-k-b-001',
                'brand': 'tomford',
                'category': 'glasses',
                'description': '더보이즈 선우가 착용한 프리미엄 안경테입니다.',
                'short_description': '더보이즈 선우 착용',
                'price': Decimal('565000'),
                'sku': 'TOM-TF6015-001',
                'stock': 20,
                'is_featured': True,
            },
            {
                'name': '오클리 EYEJACKET REDUX',
                'slug': 'oakley-eyejacket-redux',
                'brand': 'oakley',
                'category': 'sports',
                'description': '강민경 러닝룩 완성템! 스트리트 패션과 스포츠 스타일을 동시에 충족시킵니다.',
                'short_description': '러닝 선글라스',
                'price': Decimal('244000'),
                'sale_price': Decimal('195200'),
                'sku': 'OAK-EYE-REDUX',
                'stock': 45,
                'is_featured': True,
            },
            {
                'name': 'lash Clift BK 46',
                'slug': 'lash-clift-bk-46',
                'brand': 'lash',
                'category': 'sunglasses',
                'description': '주우재, 박형식, 정해인 등이 착용한 빈티지 에디션 레트로스펙트 컬렉션입니다.',
                'short_description': '빈티지 에디션 레트로스펙트',
                'price': Decimal('215000'),
                'sku': 'LSH-CLIFT-BK46',
                'stock': 30,
                'is_featured': False,
            },
        ]

        for product_data in products_data:
            brand = brands[product_data['brand']]
            category = categories[product_data['category']]
            
            product, created = Product.objects.get_or_create(
                slug=product_data['slug'],
                defaults={
                    'name': product_data['name'],
                    'brand': brand,
                    'category': category,
                    'description': product_data['description'],
                    'short_description': product_data['short_description'],
                    'price': product_data['price'],
                    'sale_price': product_data.get('sale_price'),
                    'sku': product_data['sku'],
                    'stock': product_data['stock'],
                    'is_featured': product_data['is_featured'],
                }
            )
            
            if created:
                self.stdout.write(f"상품 '{product.name}' 생성됨")

        self.stdout.write(
            self.style.SUCCESS('샘플 데이터 생성이 완료되었습니다!')
        )
