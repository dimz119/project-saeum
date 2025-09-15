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
from .models import Category, Brand, Product, Wishlist, Review, Announcement
from .serializers import (
    CategorySerializer, BrandSerializer, 
    ProductListSerializer, ProductDetailSerializer, WishlistSerializer, ReviewSerializer
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


@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def review_create(request):
    """리뷰 작성"""
    product_id = request.data.get('product_id')
    rating = request.data.get('rating')
    content = request.data.get('content')
    
    if not all([product_id, rating, content]):
        return Response(
            {'error': '상품 ID, 평점, 내용이 모두 필요합니다.'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # 기존 리뷰 확인
        existing_review = Review.objects.filter(
            user=request.user, 
            product_id=product_id
        ).exists()
        
        if existing_review:
            return Response(
                {'error': '이미 이 상품에 대한 리뷰를 작성하셨습니다.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        review = Review.objects.create(
            user=request.user,
            product_id=product_id,
            rating=rating,
            title='',  # 제목은 선택사항
            content=content
        )
        
        serializer = ReviewSerializer(review)
        return Response({
            'message': '리뷰가 작성되었습니다.',
            'review': serializer.data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': '리뷰 작성 중 오류가 발생했습니다.'}, 
            status=status.HTTP_400_BAD_REQUEST
        )


@csrf_exempt
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def review_delete(request, review_id):
    """리뷰 삭제 (본인만 가능)"""
    try:
        review = Review.objects.get(id=review_id, user=request.user)
        review.delete()
        return Response({'message': '리뷰가 삭제되었습니다.'})
    except Review.DoesNotExist:
        return Response(
            {'error': '리뷰를 찾을 수 없거나 삭제 권한이 없습니다.'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@csrf_exempt
@api_view(['GET'])
def product_reviews(request, product_id):
    """상품별 리뷰 목록"""
    reviews = Review.objects.filter(product_id=product_id).order_by('-created_at')
    serializer = ReviewSerializer(reviews, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def latest_announcement(request):
    """최신 활성 공지사항 조회"""
    print(f"[DEBUG] latest_announcement 호출됨")
    announcement = Announcement.objects.filter(is_active=True, is_banner=True).first()
    print(f"[DEBUG] 찾은 공지사항: {announcement}")
    if announcement:
        response_data = {
            'id': announcement.id,
            'title': announcement.title,
            'content': announcement.content,
            'created_at': announcement.created_at
        }
        print(f"[DEBUG] 응답 데이터: {response_data}")
        return Response(response_data)
    print(f"[DEBUG] 공지사항 없음")
    return Response({'title': '', 'content': ''})


@api_view(['GET'])
def announcement_detail(request, announcement_id):
    """공지사항 상세 조회"""
    try:
        announcement = get_object_or_404(Announcement, id=announcement_id, is_active=True)
        return Response({
            'id': announcement.id,
            'title': announcement.title,
            'content': announcement.content,
            'created_at': announcement.created_at,
            'updated_at': announcement.updated_at
        })
    except:
        return Response({'error': '공지사항을 찾을 수 없습니다.'}, status=404)
