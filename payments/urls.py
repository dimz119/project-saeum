from django.urls import path
from . import views

app_name = 'payments'

urlpatterns = [
    path('create-payment-intent/', views.create_payment_intent, name='create-payment-intent'),
    path('confirm-payment/', views.confirm_payment, name='confirm-payment'),
    path('stripe-public-key/', views.get_stripe_public_key, name='stripe-public-key'),
    path('create-checkout-session/', views.create_checkout_session, name='create-checkout-session'),
    path('stripe-webhook/', views.stripe_webhook, name='stripe-webhook'),
    path('recent-order/', views.get_recent_order, name='recent-order'),
    path('process-checkout-success/', views.process_checkout_success, name='process-checkout-success'),
]
