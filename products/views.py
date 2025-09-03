from django.shortcuts import render, get_object_or_404
from rest_framework import generics, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Brand, Product
from .serializers import (
    CategorySerializer, BrandSerializer, 
    ProductListSerializer, ProductDetailSerializer
)


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class BrandListView(generics.ListAPIView):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer


class ProductListView(generics.ListAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductListSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'brand', 'is_featured', 'tags__name']
    search_fields = ['name', 'description', 'short_description']
    ordering_fields = ['price', 'created_at', 'name', 'brand__name']
    ordering = ['-created_at']


class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductDetailSerializer
    lookup_field = 'slug'


class ProductDetailByIdView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductDetailSerializer
    lookup_field = 'pk'


class FeaturedProductListView(generics.ListAPIView):
    queryset = Product.objects.filter(is_active=True, is_featured=True)
    serializer_class = ProductListSerializer


def index(request):
    return render(request, 'index.html')


def product_detail_page(request, slug):
    product = get_object_or_404(Product, slug=slug, is_active=True)
    return render(request, 'product_detail.html', {'product': product})
