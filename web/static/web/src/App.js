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
        } else if (path === '/cart' || path === '/cart/') {
            setCurrentPage('cart');
            setSelectedProductId(null);
        } else if (path.startsWith('/products/')) {
            const id = path.split('/')[2];
            if (id) {
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
                        apiUrl: '/api/products/?featured=true',
                        sectionId: 'featured-products'
                    }),
                    
                    // Top Rated Products Section
                    React.createElement(window.Components.ProductList, {
                        title: '인기 상품',
                        apiUrl: '/api/products/?ordering=-average_rating',
                        sectionId: 'top-products'
                    }),
                    
                    // New Products Section
                    React.createElement(window.Components.ProductList, {
                        title: '신상품',
                        apiUrl: '/api/products/?ordering=-created_at',
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

// 페이지 로드 시 앱 마운트
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, mounting App');
    const rootElement = document.getElementById('root');
    if (rootElement) {
        console.log('Root element found, rendering App');
        ReactDOM.render(React.createElement(App), rootElement);
    } else {
        console.error('Root element not found');
    }
});

// 전역으로 내보내기
window.Components = window.Components || {};
window.Components.App = App;
