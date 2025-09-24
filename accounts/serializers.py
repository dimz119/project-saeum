from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('email', 'username', 'password', 'password_confirm', 
                 'first_name', 'last_name', 'phone_number', 'date_of_birth')

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("비밀번호가 일치하지 않습니다.")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError('이메일 또는 비밀번호가 올바르지 않습니다.')
            if not user.is_active:
                raise serializers.ValidationError('계정이 비활성화되어 있습니다.')
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('이메일과 비밀번호를 입력해주세요.')

class UserSerializer(serializers.ModelSerializer):
    has_eye_exam = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'first_name', 'last_name', 
                 'phone_number', 'date_of_birth', 'shipping_address', 
                 'shipping_zipcode', 'shipping_phone', 'shipping_country', 'shipping_city',
                 'date_joined', 'is_active', 'eye_exam_file', 'eye_exam_uploaded_at', 'has_eye_exam')
        read_only_fields = ('id', 'date_joined', 'is_active', 'eye_exam_uploaded_at', 'has_eye_exam')

class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'phone_number', 'date_of_birth',
                 'shipping_address', 'shipping_zipcode', 'shipping_phone', 
                 'shipping_country', 'shipping_city', 'eye_exam_file')

    def update(self, instance, validated_data):
        # eye_exam_file이 업로드되면 업로드 시간 설정
        if 'eye_exam_file' in validated_data and validated_data['eye_exam_file']:
            from django.utils import timezone
            instance.eye_exam_uploaded_at = timezone.now()
        
        return super().update(instance, validated_data)
