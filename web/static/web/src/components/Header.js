// Header 컴포넌트
const Header = () => {
    const handleNavigation = (path, e) => {
        e.preventDefault();
        if (window.Router) {
            window.Router.navigate(path);
        } else {
            window.location.href = path;
        }
    };

    return React.createElement('div', null,
        React.createElement('div', { className: 'header-top' },
            '🎉 8월 스페셜 혜택 - 전 상품 무료배송! 🚚'
        ),
        React.createElement('header', { className: 'header' },
            React.createElement('div', { className: 'container' },
                React.createElement('nav', { className: 'navbar' },
                    React.createElement('a', { 
                        href: '/', 
                        className: 'logo',
                        onClick: (e) => handleNavigation('/', e)
                    }, 'monthlylook'),
                    React.createElement('ul', { className: 'nav-menu' },
                        React.createElement('li', null,
                            React.createElement('a', { 
                                href: '/products/featured',
                                onClick: (e) => handleNavigation('/products/featured', e)
                            }, '추천상품')
                        ),
                        React.createElement('li', null,
                            React.createElement('a', { 
                                href: '/brands',
                                onClick: (e) => handleNavigation('/brands', e)
                            }, '브랜드')
                        ),
                        React.createElement('li', null,
                            React.createElement('a', { 
                                href: '/products/new',
                                onClick: (e) => handleNavigation('/products/new', e)
                            }, '신상품')
                        ),
                        React.createElement('li', null,
                            React.createElement('a', { 
                                href: '/products/sale',
                                onClick: (e) => handleNavigation('/products/sale', e)
                            }, '세일')
                        )
                    ),
                    React.createElement('div', { className: 'nav-icons' },
                        React.createElement('i', { className: 'fas fa-search' }),
                        React.createElement('i', { className: 'fas fa-heart' }),
                        React.createElement('i', { 
                            className: 'fas fa-shopping-bag cart-icon',
                            onClick: (e) => {
                                e.preventDefault();
                                if (window.Router) {
                                    window.Router.navigate('/cart');
                                }
                            },
                            style: { cursor: 'pointer', position: 'relative' }
                        }),
                        // 사용자 인증 정보 컴포넌트 추가
                        window.UserInfo ? React.createElement(window.UserInfo) : 
                            React.createElement('div', { className: 'auth-links' },
                                React.createElement('a', { 
                                    href: '/login/',
                                    className: 'auth-link',
                                    onClick: (e) => handleNavigation('/login/', e),
                                    title: '로그인'
                                }, React.createElement('i', { className: 'fas fa-sign-in-alt' })),
                                React.createElement('a', { 
                                    href: '/register/',
                                    className: 'auth-link',
                                    onClick: (e) => handleNavigation('/register/', e),
                                    title: '회원가입'
                                }, React.createElement('i', { className: 'fas fa-user-plus' }))
                            )
                    )
                )
            )
        )
    );
};

// 전역으로 내보내기
window.Components = window.Components || {};
window.Components.Header = Header;
