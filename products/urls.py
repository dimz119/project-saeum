from django.urls import path
from . import views

app_name = 'products'

urlpatterns = [
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    path('brands/', views.BrandListView.as_view(), name='brand-list'),
    path('', views.ProductListView.as_view(), name='product-list'),
    path('featured/', views.FeaturedProductListView.as_view(), name='featured-products'),
    path('new/', views.NewProductListView.as_view(), name='new-products'),
    path('sale/', views.SaleProductListView.as_view(), name='sale-products'),
    path('<int:pk>/', views.ProductDetailByIdView.as_view(), name='product-detail-by-id'),
    path('<slug:slug>/', views.ProductDetailView.as_view(), name='product-detail'),
]
