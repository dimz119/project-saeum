from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import login
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.utils import timezone
from .models import User
from .serializers import (
    UserRegistrationSerializer, 
    UserLoginSerializer, 
    UserSerializer,
    UserProfileUpdateSerializer
)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """사용자 회원가입"""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'message': '회원가입이 완료되었습니다.',
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """사용자 로그인"""
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        login(request, user)
        return Response({
            'message': '로그인되었습니다.',
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """사용자 로그아웃"""
    try:
        refresh_token = request.data["refresh"]
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({
            'message': '로그아웃되었습니다.'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': '유효하지 않은 토큰입니다.'
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile(request):
    """사용자 프로필 조회 및 수정"""
    if request.method == 'GET':
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    elif request.method in ['PUT', 'PATCH']:
        serializer = UserProfileUpdateSerializer(
            request.user, 
            data=request.data, 
            partial=request.method == 'PATCH'
        )
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(request.user).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_info(request):
    """토큰으로 사용자 정보 조회"""
    return Response({
        'user': UserSerializer(request.user).data,
        'is_authenticated': True
    })

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_eye_exam(request):
    """Eye exam 파일 업로드"""
    if 'eye_exam_file' not in request.FILES:
        return Response({
            'error': '파일이 선택되지 않았습니다.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    file = request.FILES['eye_exam_file']
    
    # 파일 크기 제한 (5MB)
    if file.size > 5 * 1024 * 1024:
        return Response({
            'error': '파일 크기는 5MB 이하여야 합니다.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # 파일 확장자 검증
    allowed_extensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif']
    file_ext = file.name.lower().split('.')[-1]
    if f'.{file_ext}' not in allowed_extensions:
        return Response({
            'error': '허용된 파일 형식: PDF, JPG, JPEG, PNG, GIF'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # S3에 업로드할 경우 custom storage 사용
        from shopping_mall.storage_backends import UserFileStorage
        from django.core.files.storage import default_storage
        from django.conf import settings
        import boto3
        from botocore.exceptions import ClientError
        import os
        
        # 기존 파일이 있으면 S3에서 직접 삭제
        if request.user.eye_exam_file:
            old_file_path = request.user.eye_exam_file.name
            
            # S3 사용 시 직접 삭제
            if getattr(settings, 'USE_S3', False):
                try:
                    # S3 클라이언트 생성
                    s3_client = boto3.client(
                        's3',
                        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                        region_name=settings.AWS_S3_REGION_NAME
                    )
                    
                    # 사용자 파일 버킷에서 기존 파일 삭제
                    bucket_name = os.getenv('AWS_USER_BUCKET_NAME', 'monthly-look-user')
                    s3_client.delete_object(Bucket=bucket_name, Key=old_file_path)
                    print(f"기존 S3 파일 삭제됨: {bucket_name}/{old_file_path}")
                    
                except ClientError as e:
                    print(f"기존 S3 파일 삭제 오류: {e}")
            
            # Django FileField에서 삭제
            request.user.eye_exam_file.delete(save=False)
        
        # S3 사용 여부에 따라 처리
        if getattr(settings, 'USE_S3', False):
            # S3에 업로드
            storage = UserFileStorage()
            file_path = f'eye_exams/{request.user.id}/{file.name}'
            saved_path = storage.save(file_path, file)
            file_url = storage.url(saved_path)
            
            # 데이터베이스에 파일 경로 저장
            request.user.eye_exam_file = saved_path
        else:
            # 로컬 파일 시스템에 저장
            request.user.eye_exam_file = file
        
        request.user.eye_exam_uploaded_at = timezone.now()
        request.user.save()
        
        return Response({
            'message': '파일이 성공적으로 업로드되었습니다.',
            'user': UserSerializer(request.user).data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': f'파일 업로드 중 오류가 발생했습니다: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_eye_exam(request):
    """Eye exam 파일 삭제"""
    try:
        if request.user.eye_exam_file:
            # S3에서 직접 파일 삭제
            from django.conf import settings
            import boto3
            from botocore.exceptions import ClientError
            
            file_path = request.user.eye_exam_file.name
            
            # S3 사용 시 직접 삭제
            if getattr(settings, 'USE_S3', False):
                try:
                    # S3 클라이언트 생성
                    s3_client = boto3.client(
                        's3',
                        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                        region_name=settings.AWS_S3_REGION_NAME
                    )
                    
                    # 사용자 파일 버킷에서 삭제
                    import os
                    bucket_name = os.getenv('AWS_USER_BUCKET_NAME', 'monthly-look-user')
                    
                    # S3에서 파일 삭제
                    s3_client.delete_object(Bucket=bucket_name, Key=file_path)
                    print(f"S3에서 파일 삭제됨: {bucket_name}/{file_path}")
                    
                except ClientError as e:
                    print(f"S3 파일 삭제 오류: {e}")
                    # S3 삭제 실패해도 DB에서는 삭제 진행
            
            # Django FileField에서 삭제 (로컬 파일이나 S3 경로 정리)
            request.user.eye_exam_file.delete(save=False)
            request.user.eye_exam_file = None
            request.user.eye_exam_uploaded_at = None
            request.user.save()
            
            return Response({
                'message': '파일이 삭제되었습니다.',
                'user': UserSerializer(request.user).data
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': '삭제할 파일이 없습니다.'
            }, status=status.HTTP_404_NOT_FOUND)
            
    except Exception as e:
        print(f"파일 삭제 오류: {e}")
        return Response({
            'error': f'파일 삭제 중 오류가 발생했습니다: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_eye_exam(request):
    """Eye exam 파일 다운로드 URL 제공"""
    try:
        if not request.user.eye_exam_file:
            return Response({
                'error': '다운로드할 파일이 없습니다.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        from django.conf import settings
        import boto3
        from botocore.exceptions import ClientError
        import os
        from urllib.parse import quote
        
        file_path = request.user.eye_exam_file.name
        
        # S3 사용 시 presigned URL 생성
        if getattr(settings, 'USE_S3', False):
            try:
                s3_client = boto3.client(
                    's3',
                    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                    region_name=settings.AWS_S3_REGION_NAME
                )
                
                bucket_name = os.getenv('AWS_USER_BUCKET_NAME', 'monthly-look-user')
                
                # 파일 이름을 위한 Content-Disposition 헤더 설정
                original_filename = os.path.basename(file_path)
                
                # Presigned URL 생성 (1시간 유효)
                download_url = s3_client.generate_presigned_url(
                    'get_object',
                    Params={
                        'Bucket': bucket_name, 
                        'Key': file_path,
                        'ResponseContentDisposition': f'attachment; filename="{quote(original_filename)}"'
                    },
                    ExpiresIn=3600  # 1시간
                )
                
                return Response({
                    'download_url': download_url,
                    'filename': original_filename,
                    'expires_in': 3600  # 초 단위
                }, status=status.HTTP_200_OK)
                
            except ClientError as e:
                return Response({
                    'error': f'파일 다운로드 URL 생성 실패: {str(e)}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            # 로컬 파일 시스템 사용 시
            file_url = request.build_absolute_uri(request.user.eye_exam_file.url)
            return Response({
                'download_url': file_url,
                'filename': os.path.basename(file_path),
                'expires_in': None  # 로컬 파일은 만료 없음
            }, status=status.HTTP_200_OK)
            
    except Exception as e:
        return Response({
            'error': f'파일 다운로드 URL 생성 중 오류가 발생했습니다: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
