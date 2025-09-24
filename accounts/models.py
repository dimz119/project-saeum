from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.signals import pre_delete, pre_save
from django.dispatch import receiver

def user_eye_exam_upload_path(instance, filename):
    """
    Eye exam 파일 업로드 경로를 정의
    """
    return f'eye_exams/{instance.id}/{filename}'

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
    shipping_country = models.CharField(max_length=100, blank=True, help_text="국가")
    shipping_city = models.CharField(max_length=100, blank=True, help_text="도시")
    
    # Eye exam 파일
    eye_exam_file = models.FileField(
        upload_to=user_eye_exam_upload_path, 
        blank=True, 
        null=True,
        help_text="시력 검사 결과 파일 (PDF, 이미지 등)"
    )
    eye_exam_uploaded_at = models.DateTimeField(null=True, blank=True, help_text="시력 검사 파일 업로드 시간")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    def __str__(self):
        return self.email

    def has_eye_exam(self):
        """
        시력 검사 파일이 업로드되어 있는지 확인
        """
        return bool(self.eye_exam_file)

@receiver(pre_save, sender=User)
def delete_old_eye_exam_file(sender, instance, **kwargs):
    """
    User 모델 저장 전에 기존 eye_exam_file을 S3에서 삭제
    """
    if not instance.pk:
        return False

    try:
        old_user = User.objects.get(pk=instance.pk)
        if old_user.eye_exam_file and old_user.eye_exam_file != instance.eye_exam_file:
            delete_s3_file(old_user.eye_exam_file.name)
    except User.DoesNotExist:
        return False

@receiver(pre_delete, sender=User)
def delete_eye_exam_file_on_user_delete(sender, instance, **kwargs):
    """
    User 모델 삭제 시 eye_exam_file을 S3에서 삭제
    """
    if instance.eye_exam_file:
        delete_s3_file(instance.eye_exam_file.name)

def delete_s3_file(file_path):
    """
    S3에서 파일을 삭제하는 헬퍼 함수
    """
    try:
        from django.conf import settings
        import boto3
        from botocore.exceptions import ClientError
        import os
        
        # S3 사용 중인 경우만 삭제
        if getattr(settings, 'USE_S3', False):
            s3_client = boto3.client(
                's3',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_S3_REGION_NAME
            )
            
            bucket_name = os.getenv('AWS_USER_BUCKET_NAME', 'monthly-look-user')
            s3_client.delete_object(Bucket=bucket_name, Key=file_path)
            print(f"S3 파일 삭제됨: {bucket_name}/{file_path}")
            
    except Exception as e:
        print(f"S3 파일 삭제 중 오류: {e}")
