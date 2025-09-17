from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import Celebrity
from .serializers import CelebritySerializer


class CelebrityListView(generics.ListAPIView):
    """
    API endpoint to list all active celebrities
    """
    serializer_class = CelebritySerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        return Celebrity.objects.filter(is_active=True).order_by('order', '-created_at')
