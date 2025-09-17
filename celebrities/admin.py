from django.contrib import admin
from .models import Celebrity


@admin.register(Celebrity)
class CelebrityAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'order', 'created_at', 'image_preview']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    list_editable = ['is_active', 'order']
    ordering = ['order', '-created_at']
    
    fields = ['name', 'description', 'image', 'is_active', 'order']
    
    def image_preview(self, obj):
        if obj.image:
            return f'<img src="{obj.image.url}" style="max-height: 50px; max-width: 50px;" />'
        return "No image"
    image_preview.allow_tags = True
    image_preview.short_description = "Preview"
