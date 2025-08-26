from django.db import models
from django.contrib.auth.models import User


class Category(models.Model):
    name = models.CharField(max_length=100, verbose_name="카테고리명")
    slug = models.SlugField(unique=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, verbose_name="상위 카테고리")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "카테고리"
        verbose_name_plural = "카테고리"
        
    def __str__(self):
        return self.name


class Brand(models.Model):
    name = models.CharField(max_length=100, verbose_name="브랜드명")
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True, verbose_name="브랜드 설명")
    logo = models.ImageField(upload_to='brands/', blank=True, verbose_name="브랜드 로고")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "브랜드"
        verbose_name_plural = "브랜드"
        
    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=200, verbose_name="상품명")
    slug = models.SlugField(unique=True)
    description = models.TextField(verbose_name="상품 설명")
    short_description = models.CharField(max_length=255, blank=True, verbose_name="짧은 설명")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="가격")
    sale_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="할인가")
    sku = models.CharField(max_length=100, unique=True, verbose_name="상품코드")
    stock = models.PositiveIntegerField(default=0, verbose_name="재고")
    category = models.ForeignKey(Category, on_delete=models.CASCADE, verbose_name="카테고리")
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, verbose_name="브랜드")
    is_active = models.BooleanField(default=True, verbose_name="활성화")
    is_featured = models.BooleanField(default=False, verbose_name="추천상품")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "상품"
        verbose_name_plural = "상품"
        ordering = ['-created_at']
        
    def __str__(self):
        return self.name
    
    @property
    def main_image(self):
        main_image = self.images.filter(is_main=True).first()
        return main_image.image.url if main_image else None
    
    @property
    def current_price(self):
        return self.sale_price if self.sale_price else self.price


class ProductImage(models.Model):
    product = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='products/', verbose_name="상품 이미지")
    alt_text = models.CharField(max_length=255, blank=True, verbose_name="대체 텍스트")
    is_main = models.BooleanField(default=False, verbose_name="메인 이미지")
    order = models.PositiveIntegerField(default=0, verbose_name="정렬순서")
    
    class Meta:
        verbose_name = "상품 이미지"
        verbose_name_plural = "상품 이미지"
        ordering = ['order']
        
    def __str__(self):
        return f"{self.product.name} - 이미지 {self.order}"


class Review(models.Model):
    RATING_CHOICES = [
        (1, '1점'),
        (2, '2점'),
        (3, '3점'),
        (4, '4점'),
        (5, '5점'),
    ]
    
    product = models.ForeignKey(Product, related_name='reviews', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.IntegerField(choices=RATING_CHOICES, verbose_name="평점")
    title = models.CharField(max_length=200, verbose_name="리뷰 제목")
    content = models.TextField(verbose_name="리뷰 내용")
    is_verified = models.BooleanField(default=False, verbose_name="구매 확인")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "리뷰"
        verbose_name_plural = "리뷰"
        ordering = ['-created_at']
        unique_together = ['product', 'user']
        
    def __str__(self):
        return f"{self.product.name} - {self.user.username}"
