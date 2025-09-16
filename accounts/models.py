from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """
    커스텀 유저 모델
    """
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    phone_number = models.CharField(max_length=15, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    
    # 기본 배송지 정보
    shipping_address = models.TextField(blank=True, help_text="기본 배송 주소")
    shipping_zipcode = models.CharField(max_length=10, blank=True, help_text="기본 배송지 우편번호")
    shipping_phone = models.CharField(max_length=15, blank=True, help_text="기본 배송지 연락처")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    def __str__(self):
        return self.email
