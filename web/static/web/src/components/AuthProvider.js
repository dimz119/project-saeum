// 사용자 인증 상태 관리 컴포넌트
const AuthProvider = ({ children }) => {
    const [user, setUser] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);

    React.useEffect(() => {
        // window.auth가 로드되었는지 확인 후 실행
        const checkAuth = () => {
            if (window.auth) {
                checkAuthStatus();
            } else {
                // window.auth가 아직 로드되지 않았다면 로딩 해제하고 인증되지 않은 상태로 설정
                console.log('window.auth not ready, setting unauthenticated');
                setIsAuthenticated(false);
                setLoading(false);
            }
        };
        
        // 즉시 실행 (지연 시간 제거)
        checkAuth();
    }, []);

    const checkAuthStatus = async () => {
        try {
            if (window.auth && window.auth.isAuthenticated()) {
                const userData = await window.auth.getCurrentUser();
                if (userData && userData.user) {
                    setUser(userData.user);
                    setIsAuthenticated(true);
                } else {
                    // 토큰이 유효하지 않은 경우
                    window.auth.tokenStorage.clearTokens();
                    setIsAuthenticated(false);
                }
            } else {
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            if (window.auth && window.auth.tokenStorage) {
                window.auth.tokenStorage.clearTokens();
            }
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const result = await window.auth.login(email, password);
        if (result.success) {
            setUser(result.user);
            setIsAuthenticated(true);
        }
        return result;
    };

    const register = async (userData) => {
        const result = await window.auth.register(userData);
        if (result.success) {
            setUser(result.user);
            setIsAuthenticated(true);
        }
        return result;
    };

    const logout = async () => {
        await window.auth.logout();
        setUser(null);
        setIsAuthenticated(false);
    };

    const updateProfile = async (profileData) => {
        try {
            const result = await window.auth.apiCall('/auth/profile/update/', {
                method: 'PUT',
                body: JSON.stringify(profileData)
            });
            if (result.user) {
                setUser(result.user);
                return { success: true, message: result.message };
            }
            return result;
        } catch (error) {
            console.error('Profile update failed:', error);
            return { success: false, errors: { general: '프로필 업데이트 중 오류가 발생했습니다.' } };
        }
    };

    // Context 값 생성
    const contextValue = {
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        updateProfile,
        checkAuthStatus
    };

    // 전역 auth 객체에 context 메서드들 추가
    React.useEffect(() => {
        window.authContext = contextValue;
    }, [contextValue]);

    if (loading) {
        // 로딩 상태를 최소한으로 표시하거나 아예 표시하지 않음
        return React.createElement('div', { style: { opacity: 0.5 } }, children);
    }

    return children;
};

// UserInfo 컴포넌트 (헤더에서 사용)
const UserInfo = () => {
    const [user, setUser] = React.useState(null);
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            if (window.auth.isAuthenticated()) {
                const userData = await window.auth.getCurrentUser();
                if (userData && userData.user) {
                    setUser(userData.user);
                    setIsAuthenticated(true);
                }
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await window.auth.logout();
        setUser(null);
        setIsAuthenticated(false);
    };

    if (loading) {
        return React.createElement('div', { className: 'user-info-loading' }, '...');
    }

    if (!isAuthenticated) {
        return React.createElement('div', { className: 'auth-links' },
            React.createElement('a', { 
                href: '/login/', 
                className: 'auth-link',
                title: '로그인'
            }, 
                React.createElement('i', { className: 'fas fa-sign-in-alt' })
            ),
            React.createElement('a', { 
                href: '/register/', 
                className: 'auth-link',
                title: '회원가입'
            }, 
                React.createElement('i', { className: 'fas fa-user-plus' })
            )
        );
    }

    return React.createElement('div', { className: 'user-info' },
        React.createElement('span', { className: 'user-greeting' }, `안녕하세요, ${user.first_name || user.username}님`),
        React.createElement('div', { className: 'user-menu' },
            React.createElement('a', { href: '/profile', className: 'user-link', title: '프로필' }, 
                React.createElement('i', { className: 'fas fa-user' })
            ),
            React.createElement('a', { href: '/orders', className: 'user-link', title: '주문내역' }, 
                React.createElement('i', { className: 'fas fa-box' })
            ),
            React.createElement('button', { 
                onClick: handleLogout, 
                className: 'logout-btn',
                title: '로그아웃'
            }, React.createElement('i', { className: 'fas fa-sign-out-alt' }))
        )
    );
};

window.AuthProvider = AuthProvider;
window.UserInfo = UserInfo;
