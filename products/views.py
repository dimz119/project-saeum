from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from rest_framework import generics, filters, viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
import json
from .models import Category, Brand, Product, Wishlist
from .serializers import (
    CategorySerializer, BrandSerializer, 
    ProductListSerializer, ProductDetailSerializer, WishlistSerializer
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


class NewProductListView(generics.ListAPIView):
    queryset = Product.objects.filter(is_active=True, is_new=True)
    serializer_class = ProductListSerializer


class SaleProductListView(generics.ListAPIView):
    queryset = Product.objects.filter(is_active=True, sale_price__isnull=False)
    serializer_class = ProductListSerializer


def index(request):
    return render(request, 'index.html')


def product_detail_page(request, slug):
    product = get_object_or_404(Product, slug=slug, is_active=True)
    return render(request, 'product_detail.html', {'product': product})


@csrf_exempt
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def wishlist_list(request):
    """사용자의 찜목록 조회"""
    wishlist_items = Wishlist.objects.filter(user=request.user)
    serializer = WishlistSerializer(wishlist_items, many=True)
    return Response(serializer.data)


@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def wishlist_toggle(request):
    """찜 추가/제거 토글"""
    product_id = request.data.get('product_id')
    
    if not product_id:
        return Response(
            {'error': '상품 ID가 필요합니다.'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        wishlist_item = Wishlist.objects.get(
            user=request.user, 
            product_id=product_id
        )
        wishlist_item.delete()
        return Response({
            'message': '찜목록에서 제거되었습니다.',
            'is_wishlisted': False
        })
    except Wishlist.DoesNotExist:
        try:
            wishlist_item = Wishlist.objects.create(
                user=request.user,
                product_id=product_id
            )
            return Response({
                'message': '찜목록에 추가되었습니다.',
                'is_wishlisted': True
            })
        except Exception as e:
            return Response(
                {'error': '찜목록 추가 중 오류가 발생했습니다.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )


@csrf_exempt
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def wishlist_check(request):
    """특정 상품이 찜목록에 있는지 확인"""
    product_id = request.query_params.get('product_id')
    
    if not product_id:
        return Response(
            {'error': '상품 ID가 필요합니다.'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    is_wishlisted = Wishlist.objects.filter(
        user=request.user, 
        product_id=product_id
    ).exists()
    
    return Response({'is_wishlisted': is_wishlisted})
