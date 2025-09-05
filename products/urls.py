from django.urls import path, include
from . import views

app_name = 'products'

urlpatterns = [
    # Product API Routes
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    path('brands/', views.BrandListView.as_view(), name='brand-list'),
    path('featured/', views.FeaturedProductListView.as_view(), name='featured-products'),
    path('new/', views.NewProductListView.as_view(), name='new-products'),
    path('sale/', views.SaleProductListView.as_view(), name='sale-products'),
    
    # Wishlist API Routes
    path('wishlist/', views.wishlist_list, name='wishlist-list'),
    path('wishlist/toggle/', views.wishlist_toggle, name='wishlist-toggle'),
    path('wishlist/check/', views.wishlist_check, name='wishlist-check'),
    
    # Product detail routes
    path('<int:pk>/', views.ProductDetailByIdView.as_view(), name='product-detail-by-id'),
    path('<slug:slug>/', views.ProductDetailView.as_view(), name='product-detail'),
    
    # Product list (루트 경로는 마지막에)
    path('', views.ProductListView.as_view(), name='product-list'),
]
