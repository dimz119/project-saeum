from django.contrib import admin
from .models import Category, Brand, Product, ProductImage, Review


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'parent', 'created_at']
    list_filter = ['parent', 'created_at']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'brand', 'category', 'price', 'sale_price', 'stock', 'is_active', 'is_featured']
    list_filter = ['brand', 'category', 'is_active', 'is_featured', 'created_at']
    search_fields = ['name', 'sku']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductImageInline]
    
    fieldsets = (
        ('기본 정보', {
            'fields': ('name', 'slug', 'brand', 'category', 'sku')
        }),
        ('상품 설명', {
            'fields': ('short_description', 'description')
        }),
        ('가격 및 재고', {
            'fields': ('price', 'sale_price', 'stock')
        }),
        ('설정', {
            'fields': ('is_active', 'is_featured')
        }),
    )


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ['product', 'is_main', 'order']
    list_filter = ['is_main', 'product__brand']
    search_fields = ['product__name']


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['product', 'user', 'rating', 'title', 'is_verified', 'created_at']
    list_filter = ['rating', 'is_verified', 'created_at']
    search_fields = ['product__name', 'user__username', 'title']
    readonly_fields = ['created_at']
