from django.contrib import admin
from .models import Payment, Refund


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['order', 'payment_method', 'status', 'amount', 'paid_at', 'created_at']
    list_filter = ['payment_method', 'status', 'created_at']
    search_fields = ['order__order_number', 'transaction_id', 'stripe_payment_intent_id']
    readonly_fields = ['created_at', 'updated_at', 'stripe_payment_intent_id', 'stripe_charge_id']
    
    fieldsets = (
        ('주문 정보', {
            'fields': ('order', 'payment_method', 'status')
        }),
        ('결제 정보', {
            'fields': ('amount', 'currency', 'transaction_id', 'paid_at')
        }),
        ('Stripe 정보', {
            'fields': ('stripe_payment_intent_id', 'stripe_charge_id')
        }),
        ('시간 정보', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(Refund)
class RefundAdmin(admin.ModelAdmin):
    list_display = ['payment', 'amount', 'status', 'processed_at', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['payment__order__order_number', 'stripe_refund_id']
    readonly_fields = ['created_at', 'stripe_refund_id']
    
    fieldsets = (
        ('환불 정보', {
            'fields': ('payment', 'amount', 'reason', 'status')
        }),
        ('처리 정보', {
            'fields': ('processed_at', 'admin_memo')
        }),
        ('Stripe 정보', {
            'fields': ('stripe_refund_id',)
        }),
        ('시간 정보', {
            'fields': ('created_at',)
        }),
    )
