from django.contrib import admin
from .models import Order, OrderItem, Cart, CartItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['product', 'quantity', 'price']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'user', 'status', 'final_amount', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['order_number', 'user__username', 'shipping_name']
    readonly_fields = ['order_number', 'created_at', 'updated_at']
    inlines = [OrderItemInline]
    
    fieldsets = (
        ('주문 정보', {
            'fields': ('order_number', 'user', 'status', 'created_at', 'updated_at')
        }),
        ('배송 정보', {
            'fields': ('shipping_name', 'shipping_phone', 'shipping_address', 'shipping_detail_address', 'shipping_zipcode', 'memo')
        }),
        ('결제 정보', {
            'fields': ('total_amount', 'shipping_fee', 'discount_amount', 'final_amount')
        }),
    )


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['user', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username']
    inlines = [CartItemInline]


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ['cart', 'product', 'quantity', 'created_at']
    list_filter = ['created_at']
    search_fields = ['cart__user__username', 'product__name']
