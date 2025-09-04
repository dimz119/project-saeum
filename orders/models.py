from django.db import models
from django.conf import settings
from products.models import Product


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', '대기중'),
        ('confirmed', '주문확인'),
        ('preparing', '상품준비중'),
        ('shipped', '배송중'),
        ('delivered', '배송완료'),
        ('cancelled', '주문취소'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name="주문자")
    order_number = models.CharField(max_length=100, unique=True, verbose_name="주문번호")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="주문상태")
    
    # 배송 정보
    shipping_name = models.CharField(max_length=100, verbose_name="배송받는 분")
    shipping_phone = models.CharField(max_length=20, verbose_name="연락처")
    shipping_address = models.CharField(max_length=255, verbose_name="배송주소")
    shipping_detail_address = models.CharField(max_length=255, blank=True, verbose_name="상세주소")
    shipping_zipcode = models.CharField(max_length=10, verbose_name="우편번호")
    
    # 결제 정보
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="총 주문금액")
    shipping_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name="배송비")
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name="할인금액")
    final_amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="최종 결제금액")
    
    # 메모
    memo = models.TextField(blank=True, verbose_name="배송 메모")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "주문"
        verbose_name_plural = "주문"
        ordering = ['-created_at']
        
    def __str__(self):
        return f"주문 {self.order_number}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, verbose_name="상품")
    quantity = models.PositiveIntegerField(verbose_name="수량")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="상품가격")
    
    class Meta:
        verbose_name = "주문 상품"
        verbose_name_plural = "주문 상품"
        
    def __str__(self):
        return f"{self.order.order_number} - {self.product.name}"
    
    @property
    def total_price(self):
        return self.price * self.quantity


class Cart(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name="사용자")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "장바구니"
        verbose_name_plural = "장바구니"
        
    def __str__(self):
        return f"{self.user.username}의 장바구니"
    
    @property
    def total_amount(self):
        return sum(item.total_price for item in self.items.all())


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, verbose_name="상품")
    quantity = models.PositiveIntegerField(default=1, verbose_name="수량")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "장바구니 상품"
        verbose_name_plural = "장바구니 상품"
        unique_together = ['cart', 'product']
        
    def __str__(self):
        return f"{self.cart.user.username} - {self.product.name}"
    
    @property
    def total_price(self):
        return self.product.current_price * self.quantity
