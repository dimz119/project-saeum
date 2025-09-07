from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Order, OrderItem
from django.core.paginator import Paginator


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_orders(request):
    """사용자의 주문 목록 조회"""
    try:
        # 사용자의 주문들을 최신순으로 가져오기
        orders = Order.objects.filter(user=request.user).order_by('-created_at')
        
        # 페이지네이션
        page = request.GET.get('page', 1)
        paginator = Paginator(orders, 10)  # 페이지당 10개
        
        try:
            orders_page = paginator.page(page)
        except:
            orders_page = paginator.page(1)
        
        # 주문 데이터 직렬화
        orders_data = []
        for order in orders_page:
            # 주문 아이템들 가져오기
            order_items = OrderItem.objects.filter(order=order)
            items_data = []
            for item in order_items:
                items_data.append({
                    'product_name': item.product.name,
                    'quantity': item.quantity,
                    'price': str(item.price),
                    'total': str(item.quantity * item.price)
                })
            
            orders_data.append({
                'id': order.id,
                'order_number': order.order_number,
                'status': order.status,
                'shipping_name': order.shipping_name,
                'shipping_phone': order.shipping_phone,
                'shipping_email': order.shipping_email,
                'shipping_address': order.shipping_address,
                'shipping_detail_address': order.shipping_detail_address,
                'shipping_zipcode': order.shipping_zipcode,
                'total_amount': str(order.total_amount),
                'final_amount': str(order.final_amount),
                'created_at': order.created_at.isoformat(),
                'items': items_data
            })
        
        return Response({
            'results': orders_data,
            'count': paginator.count,
            'num_pages': paginator.num_pages,
            'current_page': orders_page.number,
            'has_previous': orders_page.has_previous(),
            'has_next': orders_page.has_next()
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)
