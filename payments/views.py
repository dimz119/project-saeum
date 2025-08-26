from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils import timezone
import json
import stripe
from django.conf import settings
from orders.models import Order, OrderItem
from products.models import Product
from .models import Payment
from decimal import Decimal
import uuid

stripe.api_key = settings.STRIPE_SECRET_KEY


@csrf_exempt
@require_http_methods(["POST"])
def create_payment_intent(request):
    try:
        data = json.loads(request.body)
        
        # 주문 정보 검증
        items = data.get('items', [])
        if not items:
            return JsonResponse({'error': '주문할 상품이 없습니다.'}, status=400)
        
        # 총 금액 계산
        total_amount = Decimal('0')
        for item in items:
            try:
                product = Product.objects.get(id=item['product_id'])
                quantity = int(item['quantity'])
                total_amount += product.current_price * quantity
            except Product.DoesNotExist:
                return JsonResponse({'error': f'상품 ID {item["product_id"]}를 찾을 수 없습니다.'}, status=400)
        
        # Stripe Payment Intent 생성
        intent = stripe.PaymentIntent.create(
            amount=int(total_amount * 100),  # cents 단위로 변환
            currency='krw',
            metadata={
                'order_type': 'shopping_mall',
                'total_amount': str(total_amount)
            }
        )
        
        return JsonResponse({
            'client_secret': intent.client_secret,
            'amount': str(total_amount)
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def confirm_payment(request):
    try:
        data = json.loads(request.body)
        
        payment_intent_id = data.get('payment_intent_id')
        order_data = data.get('order_data')
        
        if not payment_intent_id or not order_data:
            return JsonResponse({'error': '필수 정보가 누락되었습니다.'}, status=400)
        
        # Stripe에서 결제 확인
        payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        
        if payment_intent.status != 'succeeded':
            return JsonResponse({'error': '결제가 완료되지 않았습니다.'}, status=400)
        
        # 주문 생성
        order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"
        
        order = Order.objects.create(
            user_id=request.user.id if request.user.is_authenticated else None,
            order_number=order_number,
            status='confirmed',
            shipping_name=order_data['shipping_name'],
            shipping_phone=order_data['shipping_phone'],
            shipping_address=order_data['shipping_address'],
            shipping_detail_address=order_data.get('shipping_detail_address', ''),
            shipping_zipcode=order_data['shipping_zipcode'],
            total_amount=Decimal(order_data['total_amount']),
            shipping_fee=Decimal(order_data.get('shipping_fee', '0')),
            discount_amount=Decimal(order_data.get('discount_amount', '0')),
            final_amount=Decimal(order_data['final_amount']),
            memo=order_data.get('memo', '')
        )
        
        # 주문 상품 생성
        for item_data in order_data['items']:
            product = Product.objects.get(id=item_data['product_id'])
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item_data['quantity'],
                price=product.current_price
            )
            
            # 재고 차감
            product.stock -= item_data['quantity']
            product.save()
        
        # 결제 정보 저장
        Payment.objects.create(
            order=order,
            payment_method='stripe',
            status='completed',
            stripe_payment_intent_id=payment_intent_id,
            amount=order.final_amount,
            currency='KRW',
            transaction_id=payment_intent_id,  # 임시로 payment_intent_id 사용
            paid_at=timezone.now()
        )
        
        return JsonResponse({
            'success': True,
            'order_number': order_number,
            'message': '주문이 성공적으로 완료되었습니다.'
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def get_stripe_public_key(request):
    return JsonResponse({
        'public_key': settings.STRIPE_PUBLIC_KEY
    })
