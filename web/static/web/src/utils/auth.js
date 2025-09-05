// Authentication 관련 유틸리티 함수들

// 토큰 저장소 관리
const tokenStorage = {
    setTokens(tokens) {
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
    },
    
    getAccessToken() {
        return localStorage.getItem('access_token');
    },
    
    getRefreshToken() {
        return localStorage.getItem('refresh_token');
    },
    
    clearTokens() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }
};

// API 호출 헬퍼
const apiCall = async (endpoint, options = {}) => {
    const url = `${window.CONFIG.API_BASE_URL}${endpoint}`;
    const token = tokenStorage.getAccessToken();
    
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        },
        ...options
    };
    
    try {
        const response = await fetch(url, config);
        
        if (!response.ok) {
            // 400, 401 등의 에러에서도 JSON 응답을 확인
            if (response.status === 400) {
                try {
                    const errorData = await response.json();
                    console.error('API 400 Error:', errorData);
                    return errorData; // 에러 응답을 반환
                } catch (parseError) {
                    console.error('Error parsing 400 response:', parseError);
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }
            
            // 토큰이 만료된 경우 토큰 갱신 시도
            if (response.status === 401 && token) {
                const refreshed = await refreshToken();
                if (refreshed) {
                    // 새 토큰으로 다시 시도
                    config.headers.Authorization = `Bearer ${tokenStorage.getAccessToken()}`;
                    const retryResponse = await fetch(url, config);
                    return await retryResponse.json();
                } else {
                    // 토큰 갱신 실패시 로그아웃
                    tokenStorage.clearTokens();
                    window.location.href = '/login';
                    return null;
                }
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
};

// 토큰 갱신
const refreshToken = async () => {
    const refresh = tokenStorage.getRefreshToken();
    if (!refresh) return false;
    
    try {
        const response = await fetch(`${window.CONFIG.API_BASE_URL}/token/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh })
        });
        
        if (response.ok) {
            const data = await response.json();
            tokenStorage.setTokens({ access: data.access, refresh });
            return true;
        }
        return false;
    } catch (error) {
        console.error('Token refresh failed:', error);
        return false;
    }
};

// 인증 상태 확인
const isAuthenticated = () => {
    return !!tokenStorage.getAccessToken();
};

// 현재 사용자 캐시
let currentUserCache = null;

// 사용자 정보 가져오기 (비동기)
const getCurrentUser = async () => {
    if (!isAuthenticated()) return null;
    
    try {
        const userData = await apiCall('/auth/user-info/');
        currentUserCache = userData; // 캐시에 저장
        return userData;
    } catch (error) {
        console.error('Failed to get user info:', error);
        return null;
    }
};

// 동기적으로 캐시된 사용자 정보 반환
const getCurrentUserSync = () => {
    if (!isAuthenticated()) return null;
    return currentUserCache;
};

// 사용자 캐시 초기화
const clearUserCache = () => {
    currentUserCache = null;
};

// CSRF 토큰 가져오기
const getCSRFToken = () => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, 10) === 'csrftoken=') {
                cookieValue = decodeURIComponent(cookie.substring(10));
                break;
            }
        }
    }
    return cookieValue;
};

// 로그인
const login = async (email, password) => {
    console.log('Starting login process:', { email });
    
    try {
        const csrfToken = getCSRFToken();
        const headers = {
            'Content-Type': 'application/json',
        };
        
        if (csrfToken) {
            headers['X-CSRFToken'] = csrfToken;
        }
        
        const response = await fetch(`${window.CONFIG.API_BASE_URL}/auth/login/`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ email, password })
        });
        
        console.log('Login response status:', response.status);
        const data = await response.json();
        console.log('Login response data:', data);
        
        if (response.ok) {
            tokenStorage.setTokens(data.tokens);
            currentUserCache = data.user; // 사용자 정보 캐시에 저장
            console.log('Tokens saved successfully');
            return { success: true, user: data.user, message: data.message };
        } else {
            console.log('Login failed with errors:', data);
            return { success: false, errors: data };
        }
    } catch (error) {
        console.error('Login failed:', error);
        return { success: false, errors: { general: '로그인 중 오류가 발생했습니다.' } };
    }
};

// 회원가입
const register = async (userData) => {
    try {
        const response = await fetch(`${window.CONFIG.API_BASE_URL}/auth/register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            tokenStorage.setTokens(data.tokens);
            return { success: true, user: data.user, message: data.message };
        } else {
            return { success: false, errors: data };
        }
    } catch (error) {
        console.error('Registration failed:', error);
        return { success: false, errors: { general: '회원가입 중 오류가 발생했습니다.' } };
    }
};

// 로그아웃
const logout = async () => {
    const refresh = tokenStorage.getRefreshToken();
    
    if (refresh) {
        try {
            await apiCall('/auth/logout/', {
                method: 'POST',
                body: JSON.stringify({ refresh })
            });
        } catch (error) {
            console.error('Logout API call failed:', error);
        }
    }
    
    tokenStorage.clearTokens();
    clearUserCache(); // 사용자 캐시 초기화
    window.location.href = '/';
};

// 전역으로 함수들을 내보내기
window.auth = {
    login,
    register,
    logout,
    getCurrentUser,
    getCurrentUserSync,
    clearUserCache,
    isAuthenticated,
    tokenStorage,
    apiCall,
    refreshToken
};
