from django.shortcuts import render

def index(request):
    """모든 경로를 React Router에서 처리하도록 메인 페이지 반환"""
    return render(request, 'web/base.html')
