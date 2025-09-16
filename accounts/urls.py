from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.profile, name='profile'),
    path('user-info/', views.user_info, name='user_info'),
    path('upload-eye-exam/', views.upload_eye_exam, name='upload_eye_exam'),
    path('delete-eye-exam/', views.delete_eye_exam, name='delete_eye_exam'),
]
