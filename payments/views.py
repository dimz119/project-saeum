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


@csrf_exempt
@require_http_methods(["POST"])
def create_checkout_session(request):
    try:
        data = json.loads(request.body)
        print(f"DEBUG: 받은 데이터: {data}")
        
        # 장바구니 항목
        items = data.get('items', [])
        print(f"DEBUG: 장바구니 아이템: {items}")
        
        if not items:
            return JsonResponse({'error': '장바구니가 비어있습니다.'}, status=400)
        
        # 성공/취소 URL
        success_url = data.get('success_url', f"{request.build_absolute_uri('/')}?session_id={{CHECKOUT_SESSION_ID}}")
        cancel_url = data.get('cancel_url', request.build_absolute_uri('/cart/'))
        
        # Stripe line items 준비
        line_items = []
        for item in items:
            print(f"DEBUG: 처리 중인 아이템: {item}")
            try:
                product = Product.objects.get(id=item['product_id'])
                print(f"DEBUG: 찾은 상품: {product.name} (가격: {product.current_price})")
                line_items.append({
                    'price_data': {
                        'currency': 'krw',
                        'product_data': {
                            'name': product.name,
                            'description': product.short_description or '',
                        },
                        'unit_amount': int(product.current_price),  # KRW는 이미 최소 단위
                    },
                    'quantity': item['quantity'],
                })
            except Product.DoesNotExist:
                print(f"DEBUG: 상품을 찾을 수 없음: {item['product_id']}")
                return JsonResponse({'error': f'상품을 찾을 수 없습니다: {item["product_id"]}'}, status=400)
        
        # Stripe Checkout Session 생성 파라미터
        session_params = {
            'payment_method_types': ['card'],
            'line_items': line_items,
            'mode': 'payment',
            'success_url': success_url,
            'cancel_url': cancel_url,
            'metadata': {
                'cart_items': json.dumps(items),
                'user_id': str(request.user.id) if request.user.is_authenticated else 'anonymous'
            },
            # 배송 수집 활성화 - Stripe에서 자동으로 배송지 입력 폼 제공
            'shipping_address_collection': {
                'allowed_countries': ['KR', 'US', 'JP', 'CN']
            },
            # 연락처 정보 수집 활성화 - 이메일과 전화번호 수집
            'customer_creation': 'always',  # 항상 고객 정보 생성
            'phone_number_collection': {
                'enabled': True  # 전화번호 수집 활성화
            },
            # 무료배송 옵션
            'shipping_options': [
                {
                    'shipping_rate_data': {
                        'type': 'fixed_amount',
                        'fixed_amount': {
                            'amount': 0,  # 무료배송
                            'currency': 'krw',
                        },
                        'display_name': '무료배송',
                        'delivery_estimate': {
                            'minimum': {
                                'unit': 'business_day',
                                'value': 2,
                            },
                            'maximum': {
                                'unit': 'business_day',
                                'value': 5,
                            },
                        }
                    }
                }
            ]
        }

        # 사용자 정보가 있으면 고객 정보 미리 채우기
        if request.user.is_authenticated:
            customer_email = None
            customer_name = None
            
            if request.user.email:
                customer_email = request.user.email
            if request.user.get_full_name():
                customer_name = request.user.get_full_name()
            elif request.user.username:
                customer_name = request.user.username
            
            # customer_email은 필수이므로 이메일이 있을 때만 customer_details 설정
            if customer_email:
                session_params['customer_email'] = customer_email
                # customer_creation을 사용할 때는 기존 customer를 만들지 않음
        
        # Stripe Checkout Session 생성
        checkout_session = stripe.checkout.Session.create(**session_params)
        
        return JsonResponse({
            'checkout_url': checkout_session.url,
            'session_id': checkout_session.id
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def stripe_webhook(request):
    """Stripe webhook 처리"""
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    endpoint_secret = settings.STRIPE_WEBHOOK_SECRET
    
    try:
        if endpoint_secret:
            event = stripe.Webhook.construct_event(
                payload, sig_header, endpoint_secret
            )
        else:
            event = json.loads(payload)
    except ValueError:
        return JsonResponse({'error': 'Invalid payload'}, status=400)
    except Exception:  # stripe.error.SignatureVerificationError:
        return JsonResponse({'error': 'Invalid signature'}, status=400)
    
    # 체크아웃 세션 완료 이벤트 처리
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        
        # 세션에서 메타데이터 가져오기
        cart_items = json.loads(session['metadata'].get('cart_items', '[]'))
        user_id = session['metadata'].get('user_id')
        
        # 주문 생성
        order_number = f"ORD-{timezone.now().strftime('%Y%m%d%H%M%S')}-{str(uuid.uuid4())[:8]}"
        
        # 총 금액 계산
        total_amount = Decimal('0')
        order_items_data = []
        
        for item in cart_items:
            try:
                product = Product.objects.get(id=item['product_id'])
                quantity = int(item['quantity'])
                item_total = product.current_price * quantity
                total_amount += item_total
                
                order_items_data.append({
                    'product': product,
                    'quantity': quantity,
                    'price': product.current_price
                })
            except Product.DoesNotExist:
                continue
        
        # 주문 생성
        order = Order.objects.create(
            user_id=int(user_id) if user_id != 'anonymous' and user_id else None,
            order_number=order_number,
            status='confirmed',
            shipping_name=session.get('customer_details', {}).get('name', ''),
            shipping_phone=session.get('customer_details', {}).get('phone', ''),
            shipping_address='',  # Stripe에서는 기본적으로 주소 정보가 제한적
            shipping_detail_address='',
            shipping_zipcode='',
            total_amount=total_amount,
            shipping_fee=Decimal('0'),
            discount_amount=Decimal('0'),
            final_amount=total_amount,
            memo=f'Stripe 결제 - Session ID: {session["id"]}'
        )
        
        # 주문 상품 생성
        for item_data in order_items_data:
            OrderItem.objects.create(
                order=order,
                product=item_data['product'],
                quantity=item_data['quantity'],
                price=item_data['price']
            )
            
            # 재고 차감
            item_data['product'].stock -= item_data['quantity']
            item_data['product'].save()
        
        # 결제 정보 저장
        Payment.objects.create(
            order=order,
            payment_method='stripe',
            status='completed',
            stripe_payment_intent_id=session.get('payment_intent', ''),
            amount=order.final_amount,
            currency='KRW',
            transaction_id=session['id'],
            paid_at=timezone.now()
        )
        
    return JsonResponse({'status': 'success'})


@csrf_exempt
@require_http_methods(["GET", "POST"])
def process_checkout_success(request):
    """체크아웃 성공 후 주문 처리"""
    try:
        print("DEBUG: process_checkout_success 함수 시작")
        
        # GET 또는 POST에서 session_id 가져오기
        if request.method == 'GET':
            session_id = request.GET.get('session_id')
        else:  # POST
            data = json.loads(request.body)
            session_id = data.get('session_id')
            
        print(f"DEBUG: session_id = {session_id}")
            
        if not session_id:
            return JsonResponse({'error': 'session_id가 필요합니다.'}, status=400)
        
        print("DEBUG: Stripe 세션 조회 시작")
        # Stripe에서 세션 정보 가져오기
        session = stripe.checkout.Session.retrieve(session_id)
        print(f"DEBUG: Stripe 세션 조회 완료 - payment_status: {session.payment_status}")
        
        if session.payment_status != 'paid':
            return JsonResponse({'error': '결제가 완료되지 않았습니다.'}, status=400)
        
        print("DEBUG: 결제 상태 확인 완료")
        
        # 이미 처리된 주문인지 확인 (중복 방지)
        existing_payment = Payment.objects.filter(transaction_id=session_id).first()
        if existing_payment:
            print("DEBUG: 이미 처리된 주문입니다.")
            return JsonResponse({
                'success': True,
                'order': {
                    'order_number': existing_payment.order.order_number,
                    'total_amount': str(existing_payment.order.final_amount),
                    'status': 'confirmed',
                    'created_at': existing_payment.order.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                    'shipping_info': {
                        'name': existing_payment.order.shipping_name,
                        'phone': existing_payment.order.shipping_phone,
                        'email': existing_payment.order.shipping_email,
                        'address': existing_payment.order.shipping_address,
                        'detail_address': existing_payment.order.shipping_detail_address,
                        'zipcode': existing_payment.order.shipping_zipcode
                    },
                    'items': []
                },
                'message': '이미 처리된 주문입니다.'
            })
        
        print("DEBUG: 새 주문 처리 시작")
        
        # 세션에서 메타데이터 가져오기
        cart_items_str = session.metadata.get('cart_items', '[]') if session.metadata else '[]'
        user_id = session.metadata.get('user_id', 'anonymous') if session.metadata else 'anonymous'
        
        cart_items = json.loads(cart_items_str)
        print(f"DEBUG: 장바구니 아이템 개수: {len(cart_items)}")
        
        if not cart_items:
            return JsonResponse({'error': '장바구니 정보가 없습니다.'}, status=400)
        
        # 주문 생성
        order_number = f"ORD-{timezone.now().strftime('%Y%m%d%H%M%S')}-{str(uuid.uuid4())[:8]}"
        
        # 총 금액 계산
        total_amount = Decimal('0')
        order_items_data = []
        
        for item in cart_items:
            try:
                product = Product.objects.get(id=item['product_id'])
                quantity = int(item['quantity'])
                item_total = product.current_price * quantity
                total_amount += item_total
                
                order_items_data.append({
                    'product': product,
                    'quantity': quantity,
                    'price': product.current_price
                })
            except Product.DoesNotExist:
                continue
        
        print(f"DEBUG: 총 금액: {total_amount}")
        
        # Stripe에서 배송지 정보 가져오기
        shipping_name = '온라인 주문자'
        shipping_phone = '000-0000-0000'
        shipping_email = ''
        shipping_address = '온라인 주문'
        shipping_zipcode = '00000'
        
        # customer_details에서 정보 추출
        if hasattr(session, 'customer_details') and session.customer_details:
            customer_details = session.customer_details
            print(f"DEBUG: customer_details 존재: {customer_details}")
            
            if hasattr(customer_details, 'name') and customer_details.name:
                shipping_name = customer_details.name
                print(f"DEBUG: 이름: {shipping_name}")
            
            if hasattr(customer_details, 'email') and customer_details.email:
                shipping_email = customer_details.email
                print(f"DEBUG: 이메일: {shipping_email}")
            
            if hasattr(customer_details, 'phone') and customer_details.phone:
                shipping_phone = customer_details.phone
                print(f"DEBUG: 전화번호: {shipping_phone}")
            
            if hasattr(customer_details, 'address') and customer_details.address:
                address = customer_details.address
                address_parts = []
                
                if hasattr(address, 'line1') and address.line1:
                    address_parts.append(address.line1)
                if hasattr(address, 'line2') and address.line2:
                    address_parts.append(address.line2)
                if hasattr(address, 'city') and address.city:
                    address_parts.append(address.city)
                if hasattr(address, 'state') and address.state:
                    address_parts.append(address.state)
                if hasattr(address, 'country') and address.country:
                    address_parts.append(address.country)
                
                if address_parts:
                    shipping_address = ', '.join(address_parts)
                
                if hasattr(address, 'postal_code') and address.postal_code:
                    shipping_zipcode = address.postal_code
                
                print(f"DEBUG: 주소: {shipping_address}")
                print(f"DEBUG: 우편번호: {shipping_zipcode}")
        
        # 주문 생성
        order = Order.objects.create(
            user_id=int(user_id) if user_id != 'anonymous' and user_id else None,
            order_number=order_number,
            status='confirmed',
            shipping_name=shipping_name,
            shipping_phone=shipping_phone,
            shipping_email=shipping_email,
            shipping_address=shipping_address,
            shipping_detail_address='',
            shipping_zipcode=shipping_zipcode,
            total_amount=total_amount,
            final_amount=total_amount
        )
        
        print(f"DEBUG: 주문 생성 완료 - {order.order_number}")
        
        # 주문 아이템 생성
        for item_data in order_items_data:
            OrderItem.objects.create(
                order=order,
                product=item_data['product'],
                quantity=item_data['quantity'],
                price=item_data['price']
            )
        
        # Payment 객체 생성
        Payment.objects.create(
            order=order,
            payment_method='stripe',
            transaction_id=session_id,
            amount=total_amount,
            status='completed',
            paid_at=timezone.now()
        )
        
        print("DEBUG: 주문 처리 완료")
        
        # 주문 아이템 정보 준비
        order_items = []
        for item_data in order_items_data:
            order_items.append({
                'product_name': item_data['product'].name,
                'quantity': item_data['quantity'],
                'price': str(item_data['price']),
                'total': str(item_data['quantity'] * item_data['price'])
            })
        
        return JsonResponse({
            'success': True,
            'order': {
                'order_number': order.order_number,
                'total_amount': str(order.final_amount),
                'status': 'confirmed',
                'created_at': order.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'shipping_info': {
                    'name': order.shipping_name,
                    'phone': order.shipping_phone,
                    'email': order.shipping_email,
                    'address': order.shipping_address,
                    'detail_address': order.shipping_detail_address,
                    'zipcode': order.shipping_zipcode
                },
                'items': order_items
            }
        })
        
    except Exception as e:
        print(f"DEBUG: 오류 발생: {str(e)}")
        import traceback
        print(f"DEBUG: 상세 오류: {traceback.format_exc()}")
        return JsonResponse({'error': f'주문 처리 중 오류가 발생했습니다: {str(e)}'}, status=500)


@require_http_methods(["GET"])
def get_recent_order(request):
    """최근 주문 정보 조회 (결제 성공 페이지용)"""
    try:
        # 최근 5분 이내의 주문 중에서 가장 최근 주문을 가져옴
        recent_time = timezone.now() - timezone.timedelta(minutes=5)
        
        if request.user.is_authenticated:
            order = Order.objects.filter(
                user=request.user,
                created_at__gte=recent_time
            ).order_by('-created_at').first()
        else:
            # 비로그인 사용자의 경우 IP나 세션으로 추적이 어려우므로 일단 빈 응답
            return JsonResponse({'order': None})
        
        if order:
            # 주문 아이템 정보 포함
            order_data = {
                'order_number': order.order_number,
                'total_amount': str(order.final_amount),
                'status': order.status,
                'created_at': order.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'items': []
            }
            
            order_items = OrderItem.objects.filter(order=order)
            for item in order_items:
                order_data['items'].append({
                    'product_name': item.product.name,
                    'quantity': item.quantity,
                    'price': str(item.price),
                    'total': str(item.quantity * item.price)
                })
            
            return JsonResponse({'order': order_data})
        else:
            return JsonResponse({'order': None})
            
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
