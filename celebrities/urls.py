from django.urls import path
from .views import CelebrityListView

app_name = 'celebrities'

urlpatterns = [
    path('api/celebrities/', CelebrityListView.as_view(), name='celebrity-list'),
]
