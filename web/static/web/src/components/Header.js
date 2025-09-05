// Header 컴포넌트
const Header = () => {
    const [wishlistCount, setWishlistCount] = React.useState(0);
    const [cartCount, setCartCount] = React.useState(0);
    
    // 찜목록 카운트 업데이트 함수
    const updateWishlistCount = React.useCallback(async () => {
        try {
            const user = window.auth.getCurrentUserSync();
            if (user && window.API?.wishlist) {
                const wishlist = await window.API.wishlist.getWishlist();
                setWishlistCount(wishlist.length);
            } else {
                setWishlistCount(0);
            }
        } catch (error) {
            console.error('찜목록 카운트 업데이트 실패:', error);
            setWishlistCount(0);
        }
    }, []);

    // 장바구니 카운트 업데이트 함수
    const updateCartCount = React.useCallback(async () => {
        try {
            const user = window.auth.getCurrentUserSync();
            if (user && window.cartUtils) {
                const cartItems = window.cartUtils.getCartItems();
                const totalCount = cartItems.reduce((total, item) => total + item.quantity, 0);
                setCartCount(totalCount);
            } else {
                setCartCount(0);
            }
        } catch (error) {
            console.error('장바구니 카운트 업데이트 실패:', error);
            setCartCount(0);
        }
    }, []);
    
    // 컴포넌트 마운트 시 카운트 로드
    React.useEffect(() => {
        updateWishlistCount();
        updateCartCount();
        
        // 전역 함수로 등록하여 다른 컴포넌트에서 호출 가능하게 함
        window.updateWishlistCount = updateWishlistCount;
        window.updateCartCount = updateCartCount;
        
        return () => {
            // 컴포넌트 언마운트 시 전역 함수 제거
            delete window.updateWishlistCount;
            delete window.updateCartCount;
        };
    }, [updateWishlistCount, updateCartCount]);

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
                        React.createElement('div', { 
                            className: 'wishlist-icon-container'
                        },
                            React.createElement('i', { 
                                className: 'fas fa-heart wishlist-icon',
                                onClick: (e) => {
                                    e.preventDefault();
                                    const user = window.auth.getCurrentUserSync();
                                    if (!user) {
                                        alert('로그인이 필요한 서비스입니다.');
                                        if (window.Router) {
                                            window.Router.navigate('/login/');
                                        }
                                        return;
                                    }
                                    if (window.Router) {
                                        window.Router.navigate('/wishlist');
                                    }
                                },
                                style: { cursor: 'pointer' },
                                title: '찜목록'
                            }),
                            wishlistCount > 0 && React.createElement('span', {
                                className: 'count-badge'
                            }, wishlistCount)
                        ),
                        React.createElement('div', { 
                            className: 'cart-icon-container'
                        },
                            React.createElement('i', { 
                                className: 'fas fa-shopping-bag cart-icon',
                                onClick: (e) => {
                                    e.preventDefault();
                                    if (window.Router) {
                                        window.Router.navigate('/cart');
                                    }
                                },
                                style: { cursor: 'pointer' },
                                title: '장바구니'
                            }),
                            cartCount > 0 && React.createElement('span', {
                                className: 'count-badge'
                            }, cartCount)
                        ),
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
