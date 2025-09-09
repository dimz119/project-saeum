import uuid
import os
from django.utils.deconstruct import deconstructible


@deconstructible
class UUIDFileNameGenerator:
    """
    파일명을 UUID로 변경하는 업로드 경로 생성기
    """
    def __init__(self, path):
        self.path = path

    def __call__(self, instance, filename):
        # 파일 확장자 추출
        ext = filename.split('.')[-1] if '.' in filename else ''
        # UUID 생성
        filename = f'{uuid.uuid4().hex}.{ext}' if ext else uuid.uuid4().hex
        # 최종 경로 반환
        return os.path.join(self.path, filename)


# 상품 이미지용 업로드 경로
product_image_upload = UUIDFileNameGenerator('products')

# 브랜드 로고용 업로드 경로  
brand_logo_upload = UUIDFileNameGenerator('brands')
