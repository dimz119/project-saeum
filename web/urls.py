from django.urls import path, re_path
from . import views

app_name = 'web'

urlpatterns = [
    # React Router가 모든 경로를 처리하도록 catch-all 패턴 사용
    re_path(r'^.*$', views.index, name='index'),
]
