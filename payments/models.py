from django.db import models
from orders.models import Order
from decimal import Decimal


class Payment(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('stripe', 'Stripe'),
        ('card', '신용카드'),
        ('bank', '무통장입금'),
        ('kakao', '카카오페이'),
    ]
    
    STATUS_CHOICES = [
        ('pending', '결제대기'),
        ('completed', '결제완료'),
        ('failed', '결제실패'),
        ('cancelled', '결제취소'),
        ('refunded', '환불완료'),
    ]
    
    order = models.OneToOneField(Order, on_delete=models.CASCADE, verbose_name="주문")
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, verbose_name="결제방법")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="결제상태")
    
    # Stripe 정보
    stripe_payment_intent_id = models.CharField(max_length=255, blank=True, verbose_name="Stripe Payment Intent ID")
    stripe_charge_id = models.CharField(max_length=255, blank=True, verbose_name="Stripe Charge ID")
    
    # 결제 정보
    amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="결제금액")
    currency = models.CharField(max_length=3, default='KRW', verbose_name="통화")
    
    # 결제 완료 정보
    transaction_id = models.CharField(max_length=255, blank=True, verbose_name="거래번호")
    paid_at = models.DateTimeField(null=True, blank=True, verbose_name="결제일시")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "결제"
        verbose_name_plural = "결제"
        
    def __str__(self):
        return f"결제 {self.order.order_number} - {self.get_status_display()}"


class Refund(models.Model):
    STATUS_CHOICES = [
        ('requested', '환불요청'),
        ('processing', '환불처리중'),
        ('completed', '환불완료'),
        ('rejected', '환불거절'),
    ]
    
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, verbose_name="결제")
    amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="환불금액")
    reason = models.TextField(verbose_name="환불사유")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='requested', verbose_name="환불상태")
    
    # Stripe 환불 정보
    stripe_refund_id = models.CharField(max_length=255, blank=True, verbose_name="Stripe Refund ID")
    
    # 처리 정보
    processed_at = models.DateTimeField(null=True, blank=True, verbose_name="처리일시")
    admin_memo = models.TextField(blank=True, verbose_name="관리자 메모")
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "환불"
        verbose_name_plural = "환불"
        
    def __str__(self):
        return f"환불 {self.payment.order.order_number}"
