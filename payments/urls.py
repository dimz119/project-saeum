from django.urls import path
from . import views

app_name = 'payments'

urlpatterns = [
    path('create-payment-intent/', views.create_payment_intent, name='create-payment-intent'),
    path('confirm-payment/', views.confirm_payment, name='confirm-payment'),
    path('stripe-public-key/', views.get_stripe_public_key, name='stripe-public-key'),
]
