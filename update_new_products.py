#!/usr/bin/env python
import os
import sys
import django

# Django 설정
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shopping_mall.settings')
django.setup()

from products.models import Product

def update_new_products():
    print("🚀 신상품 필드 업데이트 시작...")
    
    # 신상품으로 설정할 상품들
    new_products = ['chimi-01-black', 'gucci-gg0061s', 'gentlemonster-papas', 'chimi-reading-01', 'leather-glasses-case']
    
    for slug in new_products:
        try:
            product = Product.objects.get(slug=slug)
            product.is_new = True
            product.save()
            print(f"✅ {product.name} - 신상품으로 설정")
        except Product.DoesNotExist:
            print(f"❌ {slug} - 상품을 찾을 수 없습니다")
    
    print(f"\n📊 업데이트 완료:")
    print(f"신상품: {Product.objects.filter(is_new=True).count()}개")
    print(f"추천상품: {Product.objects.filter(is_featured=True).count()}개")
    print(f"세일상품: {Product.objects.filter(sale_price__isnull=False).count()}개")

if __name__ == "__main__":
    update_new_products()
