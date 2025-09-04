// 메인 앱 컴포넌트 (React Router 없는 버전)
const App = () => {
    const [currentPage, setCurrentPage] = React.useState('home');
    const [selectedProductId, setSelectedProductId] = React.useState(null);

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
            
            default:
                return React.createElement('div', null, '페이지를 찾을 수 없습니다.');
        }
    };

    return React.createElement('div', { className: 'app' },
        // Header
        React.createElement(window.Components.Header),
        
        // Main Content
        React.createElement('main', null, renderPage()),
        
        // Footer
        React.createElement('footer', { className: 'footer' },
            React.createElement('div', { className: 'container' },
                React.createElement('div', { className: 'footer-content' },
                    React.createElement('div', { className: 'footer-section' },
                        React.createElement('h3', null, 'MonthlyLook'),
                        React.createElement('p', null, '매월 새로운 스타일을 제안하는 프리미엄 패션 플랫폼')
                    ),
                    React.createElement('div', { className: 'footer-section' },
                        React.createElement('h3', null, '고객센터'),
                        React.createElement('p', null, '전화: 1588-0000'),
                        React.createElement('p', null, '이메일: support@monthlylook.com')
                    ),
                    React.createElement('div', { className: 'footer-section' },
                        React.createElement('h3', null, '정보'),
                        React.createElement('p', null, '이용약관'),
                        React.createElement('p', null, '개인정보처리방침')
                    )
                ),
                React.createElement('div', { className: 'footer-bottom' },
                    React.createElement('p', null, '© 2024 MonthlyLook. All rights reserved.')
                )
            )
        )
    );
};

// 전역으로 내보내기
window.Components = window.Components || {};
window.Components.App = App;

// 페이지별 렌더링은 각 템플릿에서 처리
