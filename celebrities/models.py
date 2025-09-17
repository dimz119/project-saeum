from django.db import models
from django.core.files.storage import default_storage
from django.conf import settings
from shopping_mall.storage_backends import MediaStorage
import os


class CelebrityImageStorage(MediaStorage):
    """
    Celebrity 이미지 전용 Storage (MediaStorage 상속)
    """
    location = 'media/celebrities'
    file_overwrite = True  # 파일 존재 확인 건너뛰기
    
    def exists(self, name):
        """파일 존재 확인을 건너뛰어 HeadObject 권한 문제 방지"""
        return False


def celebrity_image_path(instance, filename):
    """Generate upload path for celebrity images"""
    import uuid
    from datetime import datetime
    
    # 파일 확장자 추출
    ext = filename.split('.')[-1] if '.' in filename else 'jpg'
    
    # 고유한 파일명 생성 (타임스탬프 + UUID)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    unique_id = str(uuid.uuid4())[:8]
    new_filename = f"celebrity_{timestamp}_{unique_id}.{ext}"
    
    # CelebrityImageStorage의 location이 이미 'media/celebrities'이므로 파일명만 반환
    return new_filename


class Celebrity(models.Model):
    name = models.CharField(max_length=100, verbose_name="Celebrity Name")
    description = models.TextField(blank=True, help_text="Description about the celebrity or look")
    image = models.ImageField(
        upload_to=celebrity_image_path,
        storage=CelebrityImageStorage(),
        verbose_name="Celebrity Photo"
    )
    is_active = models.BooleanField(default=True, help_text="Whether to display this celebrity photo")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    order = models.PositiveIntegerField(default=0, help_text="Display order (lower numbers appear first)")

    class Meta:
        verbose_name = "Celebrity Look"
        verbose_name_plural = "Celebrity Looks"
        ordering = ['order', '-created_at']

    def __str__(self):
        return self.name

    def delete(self, *args, **kwargs):
        """Delete image from S3 when model instance is deleted"""
        if self.image:
            try:
                # Delete from S3
                storage = CelebrityImageStorage()
                storage.delete(self.image.name)
            except Exception as e:
                print(f"Error deleting celebrity image from S3: {e}")
        super().delete(*args, **kwargs)
