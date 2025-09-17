from rest_framework import serializers
from .models import Celebrity


class CelebritySerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Celebrity
        fields = ['id', 'name', 'description', 'image_url', 'created_at', 'order']
    
    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return None
