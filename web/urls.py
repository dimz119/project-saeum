from django.urls import path, re_path
from . import views

app_name = 'web'

urlpatterns = [
    # 인증 페이지들 (trailing slash 있는 버전과 없는 버전 모두 지원)
    path('login/', views.login_view, name='login'),
    path('login', views.login_view, name='login_no_slash'),
    path('register/', views.register_view, name='register'),
    path('register', views.register_view, name='register_no_slash'),
    path('profile/', views.profile_view, name='profile'),
    path('profile', views.profile_view, name='profile_no_slash'),
    
    # React Router가 모든 경로를 처리하도록 catch-all 패턴 사용
    re_path(r'^.*$', views.index, name='index'),
]
