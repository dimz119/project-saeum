from django.shortcuts import render

def index(request):
    """모든 경로를 React Router에서 처리하도록 메인 페이지 반환"""
    return render(request, 'web/base.html')

def login_view(request):
    """로그인 페이지"""
    return render(request, 'web/login.html')

def register_view(request):
    """회원가입 페이지"""
    return render(request, 'web/register.html')

def profile_view(request):
    """프로필 페이지"""
    return render(request, 'profile.html')
