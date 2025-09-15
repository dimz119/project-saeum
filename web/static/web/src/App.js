// 메인 앱 컴포넌트 (React Router 없는 버전)
const App = () => {
    const [currentPage, setCurrentPage] = React.useState('home');
    const [selectedProductId, setSelectedProductId] = React.useState(null);
    const [language, setLanguage] = React.useState('ko');
    const [i18nReady, setI18nReady] = React.useState(false);

    // Safe translation hook
    const t = React.useCallback((key) => {
        if (window.useTranslation && i18nReady) {
            try {
                const { t: translateFn } = window.useTranslation();
                return translateFn(key);
            } catch (error) {
                console.warn('Translation error:', error);
            }
        }
        if (window.t) {
            return window.t(key);
        }
        return key;
    }, [i18nReady]);

    // Language change handler
    const handleLanguageChange = React.useCallback((newLanguage) => {
        setLanguage(newLanguage);
    }, []);

    // Initialize i18n system
    React.useEffect(() => {
        const initI18n = () => {
            if (window.i18n) {
                // Set initial language
                setLanguage(window.i18n.getCurrentLanguage());
                
                // Add language change listener
                window.i18n.addLanguageChangeListener(handleLanguageChange);
                
                // Mark i18n as ready
                setI18nReady(true);
                
                return () => {
                    window.i18n.removeLanguageChangeListener(handleLanguageChange);
                };
            } else {
                // Retry after a short delay if i18n is not ready
                setTimeout(initI18n, 100);
            }
        };

        initI18n();
    }, [handleLanguageChange]);

    // 현재 URL을 기반으로 초기 상태 설정
    React.useEffect(() => {
        const path = window.location.pathname;
        updatePageFromPath(path);
    }, []);

    // URL 경로를 기반으로 페이지 상태 업데이트
    const updatePageFromPath = (path) => {
        if (path === '/' || path === '') {
            setCurrentPage('home');
            setSelectedProductId(null);
        } else if (path === '/products' || path === '/products/') {
            setCurrentPage('products');
            setSelectedProductId(null);
        } else if (path === '/products/featured' || path === '/products/featured/') {
            setCurrentPage('products-featured');
            setSelectedProductId(null);
        } else if (path === '/products/new' || path === '/products/new/') {
            setCurrentPage('products-new');
            setSelectedProductId(null);
        } else if (path === '/products/sale' || path === '/products/sale/') {
            setCurrentPage('products-sale');
            setSelectedProductId(null);
        } else if (path === '/brands' || path === '/brands/') {
            setCurrentPage('brands');
            setSelectedProductId(null);
        } else if (path === '/cart' || path === '/cart/') {
            setCurrentPage('cart');
            setSelectedProductId(null);
        } else if (path === '/orders' || path === '/orders/') {
            setCurrentPage('orders');
            setSelectedProductId(null);
        } else if (path === '/wishlist' || path === '/wishlist/') {
            setCurrentPage('wishlist');
            setSelectedProductId(null);
        } else if (path === '/search' || path === '/search/' || path.startsWith('/search/?')) {
            setCurrentPage('search');
            setSelectedProductId(null);
        } else if (path === '/cart/success' || path === '/cart/success/' || path.startsWith('/cart/success/?') ||
                   path === '/checkout-success' || path === '/checkout-success/' || path.startsWith('/checkout-success/?')) {
            setCurrentPage('checkout-success');
            setSelectedProductId(null);
        } else if (path.startsWith('/announcements/')) {
            setCurrentPage('announcement-detail');
            setSelectedProductId(null);
        } else if (path.startsWith('/products/')) {
            const segments = path.split('/');
            const id = segments[2];
            if (id && !isNaN(id)) {
                setCurrentPage('product-detail');
                setSelectedProductId(id);
            }
        }
    };

    // 브라우저 뒤로가기/앞으로가기 처리
    React.useEffect(() => {
        const handlePopState = (event) => {
            updatePageFromPath(window.location.pathname);
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // 전역 Router 객체 설정
    React.useEffect(() => {
        window.Router = {
            navigate: (path) => {
                console.log('Navigate to:', path);
                
                // 브라우저 히스토리에 URL 추가
                window.history.pushState({}, '', path);
                
                // 페이지 상태 업데이트
                updatePageFromPath(path);
            }
        };
    }, []);

    const renderPage = () => {
        switch (currentPage) {
            case 'home':
                return React.createElement('div', null,
                    // Hero Section
                    React.createElement(window.Components.Hero),
                    
                    // Featured Products Section
                    React.createElement(window.Components.ProductList, {
                        title: '추천 상품',
                        apiUrl: '/api/products/featured/',
                        sectionId: 'featured-products'
                    }),
                    
                    // Top Rated Products Section
                    React.createElement(window.Components.ProductList, {
                        title: '인기 상품',
                        apiUrl: '/api/products/?ordering=-created_at',
                        sectionId: 'top-products'
                    }),
                    
                    // New Products Section
                    React.createElement(window.Components.ProductList, {
                        title: '신상품',
                        apiUrl: '/api/products/new/',
                        sectionId: 'new-products'
                    })
                );
            
            case 'products':
                return React.createElement('div', { className: 'container' },
                    React.createElement('h1', { className: 'page-title' }, '전체 상품'),
                    React.createElement(window.Components.ProductList, {
                        title: '',
                        apiUrl: '/api/products/',
                        sectionId: 'all-products'
                    })
                );
            
            case 'products-featured':
                return React.createElement('div', { className: 'container' },
                    React.createElement('h1', { className: 'page-title' }, '추천 상품'),
                    React.createElement(window.Components.ProductList, {
                        title: '',
                        apiUrl: '/api/products/featured/',
                        sectionId: 'featured-products'
                    })
                );
            
            case 'products-new':
                return React.createElement('div', { className: 'container' },
                    React.createElement('h1', { className: 'page-title' }, '신상품'),
                    React.createElement(window.Components.ProductList, {
                        title: '',
                        apiUrl: '/api/products/new/',
                        sectionId: 'new-products'
                    })
                );
            
            case 'products-sale':
                return React.createElement('div', { className: 'container' },
                    React.createElement('h1', { className: 'page-title' }, '세일 상품'),
                    React.createElement(window.Components.ProductList, {
                        title: '',
                        apiUrl: '/api/products/sale/',
                        sectionId: 'sale-products'
                    })
                );
            
            case 'brands':
                return React.createElement('div', { className: 'container' },
                    React.createElement('h1', { className: 'page-title' }, '브랜드별 상품'),
                    React.createElement(window.Components.ProductList, {
                        title: '',
                        apiUrl: '/api/products/?ordering=brand__name',
                        sectionId: 'brand-products'
                    })
                );
            
            case 'product-detail':
                return React.createElement(window.Components.ProductDetail, { 
                    productId: selectedProductId 
                });
            
            case 'cart':
                return React.createElement(window.Components.Cart);
            
            case 'orders':
                return React.createElement(window.Components.OrdersPage);
            
            case 'wishlist':
                return React.createElement(window.Components.WishlistPage);
            
            case 'search':
                return React.createElement(window.Components.SearchPage);
            
            case 'checkout-success':
                return React.createElement(window.Components.CheckoutSuccess);
            
            case 'announcement-detail':
                return React.createElement(window.Components.AnnouncementDetail);
            
            default:
                return React.createElement('div', null, t('pages.not_found'));
        }
    };

    return React.createElement('div', { className: 'app' },
        // Header
        React.createElement(window.Components.Header),
        
        // Main Content
        React.createElement('main', null, renderPage()),
        
        // Footer
        React.createElement(window.Components.Footer)
    );
};

// 전역으로 내보내기
window.Components = window.Components || {};
window.Components.App = App;

// 페이지별 렌더링은 각 템플릿에서 처리
