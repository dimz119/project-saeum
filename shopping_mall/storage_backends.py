from django.conf import settings
from storages.backends.s3boto3 import S3Boto3Storage


class MediaStorage(S3Boto3Storage):
    """
    S3 Media File Storage
    """
    bucket_name = settings.AWS_STORAGE_BUCKET_NAME
    location = 'media'
    default_acl = None  # ACL 비활성화
    file_overwrite = True  # 파일 존재 확인 건너뛰기
    
    # AWS 자격증명을 명시적으로 설정
    access_key = settings.AWS_ACCESS_KEY_ID
    secret_key = settings.AWS_SECRET_ACCESS_KEY
    region_name = settings.AWS_S3_REGION_NAME


class StaticStorage(S3Boto3Storage):
    """
    S3 Static File Storage
    """
    bucket_name = settings.AWS_STORAGE_BUCKET_NAME
    location = 'static'
    default_acl = None  # ACL 비활성화
