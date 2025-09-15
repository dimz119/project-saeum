// Header 컴포넌트
const Header = () => {
    const [wishlistCount, setWishlistCount] = React.useState(0);
    const [cartCount, setCartCount] = React.useState(0);
    const [announcement, setAnnouncement] = React.useState({ title: '', id: null });
    
    // Translation hook with fallback
    const { t } = window.useTranslation ? window.useTranslation() : { t: window.t || ((key) => key) };
    
    // 공지사항 로드 함수
    const loadAnnouncement = React.useCallback(async () => {
        try {
            console.log('공지사항 로드 시작');
            const response = await fetch('/api/products/announcements/latest/');
            if (response.ok) {
                const data = await response.json();
                console.log('공지사항 데이터:', data);
                setAnnouncement({ title: data.title, id: data.id });
            } else {
                console.log('공지사항 응답 실패:', response.status);
            }
        } catch (error) {
            console.error('공지사항 로드 실패:', error);
        }
    }, []);
    
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
        loadAnnouncement();
        
        // 전역 함수로 등록하여 다른 컴포넌트에서 호출 가능하게 함
        window.updateWishlistCount = updateWishlistCount;
        window.updateCartCount = updateCartCount;
        
        return () => {
            // 컴포넌트 언마운트 시 전역 함수 제거
            delete window.updateWishlistCount;
            delete window.updateCartCount;
        };
    }, [updateWishlistCount, updateCartCount, loadAnnouncement]);

    const handleNavigation = (path, e) => {
        e.preventDefault();
        if (window.Router) {
            window.Router.navigate(path);
        } else {
            window.location.href = path;
        }
    };

    const handleAnnouncementClick = (e) => {
        e.preventDefault();
        console.log('공지사항 클릭됨:', announcement);
        console.log('Router 존재 여부:', !!window.Router);
        if (announcement.id && window.Router) {
            console.log('네비게이션 실행:', `/announcements/${announcement.id}`);
            window.Router.navigate(`/announcements/${announcement.id}`);
        } else {
            console.log('네비게이션 실패 - announcement.id:', announcement.id, 'Router:', !!window.Router);
            // 폴백으로 일반 페이지 이동 시도
            if (announcement.id) {
                window.location.href = `/announcements/${announcement.id}`;
            }
        }
    };

    return React.createElement('div', null,
        announcement.title && React.createElement('div', { 
            className: 'header-top',
            onClick: handleAnnouncementClick,
            style: { cursor: announcement.id ? 'pointer' : 'default' }
        }, announcement.title),
        React.createElement('header', { className: 'header' },
            React.createElement('div', { className: 'container' },
                React.createElement('nav', { className: 'navbar' },
                    React.createElement('a', { 
                        href: '/', 
                        className: 'logo',
                        onClick: (e) => handleNavigation('/', e)
                    }, t('header.brand')),
                    React.createElement('ul', { className: 'nav-menu' },
                        React.createElement('li', null,
                            React.createElement('a', { 
                                href: '/products/featured',
                                onClick: (e) => handleNavigation('/products/featured', e)
                            }, t('header.featured_products'))
                        ),
                        React.createElement('li', null,
                            React.createElement('a', { 
                                href: '/brands',
                                onClick: (e) => handleNavigation('/brands', e)
                            }, t('header.brands'))
                        ),
                        React.createElement('li', null,
                            React.createElement('a', { 
                                href: '/products/new',
                                onClick: (e) => handleNavigation('/products/new', e)
                            }, t('header.new_products'))
                        ),
                        React.createElement('li', null,
                            React.createElement('a', { 
                                href: '/products/sale',
                                onClick: (e) => handleNavigation('/products/sale', e)
                            }, t('header.sale'))
                        )
                    ),
                    React.createElement('div', { className: 'nav-icons' },
                        React.createElement('i', { 
                            className: 'fas fa-search',
                            onClick: (e) => {
                                e.preventDefault();
                                if (window.Router) {
                                    window.Router.navigate('/search/');
                                }
                            },
                            style: { cursor: 'pointer' },
                            title: t('header.search')
                        }),
                        React.createElement('div', { 
                            className: 'wishlist-icon-container'
                        },
                            React.createElement('i', { 
                                className: 'fas fa-heart wishlist-icon',
                                onClick: (e) => {
                                    e.preventDefault();
                                    const user = window.auth.getCurrentUserSync();
                                    if (!user) {
                                        alert(t('auth.login_required'));
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
                                title: t('header.wishlist')
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
                                title: t('header.cart')
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
                                    title: t('header.login')
                                }, React.createElement('i', { className: 'fas fa-sign-in-alt' })),
                                React.createElement('a', { 
                                    href: '/register/',
                                    className: 'auth-link',
                                    onClick: (e) => handleNavigation('/register/', e),
                                    title: t('header.register')
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
