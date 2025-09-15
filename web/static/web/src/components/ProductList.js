// 상품 목록 컴포넌트
const ProductList = ({ title, apiUrl, sectionId, filterParams }) => {
    // i18n hook 사용
    const { t } = window.useTranslation ? window.useTranslation() : { t: window.t || ((key) => key) };
    
    const [products, setProducts] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        fetchProducts();
    }, [apiUrl, filterParams]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            let url = apiUrl;
            
            // 필터 파라미터가 있으면 URL에 추가
            if (filterParams) {
                const urlParams = new URLSearchParams();
                Object.keys(filterParams).forEach(key => {
                    if (filterParams[key]) {
                        urlParams.append(key, filterParams[key]);
                    }
                });
                if (urlParams.toString()) {
                    url += (url.includes('?') ? '&' : '?') + urlParams.toString();
                }
            }
            
            console.log(`ProductList fetching from: ${url}`); // 디버깅 로그 추가
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(t('common.load_products_error'));
            }
            const data = await response.json();
            console.log(`ProductList received data:`, data); // 디버깅 로그 추가
            setProducts(data.results || data);
        } catch (err) {
            console.error('ProductList fetch error:', err); // 에러 로그 추가
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return React.createElement('div', { className: 'loading' }, t('common.loading'));
    }

    if (error) {
        return React.createElement('div', { className: 'error' }, error);
    }

    if (products.length === 0 && !loading) {
        return React.createElement('section', 
            { id: sectionId, className: 'section' },
            React.createElement('div', { className: 'container' },
                React.createElement('h2', { className: 'section-title' }, title),
                React.createElement('div', { className: 'no-products' }, 
                    React.createElement('p', null, t('common.no_products'))
                )
            )
        );
    }

    return React.createElement('section', 
        { id: sectionId, className: 'section' },
        React.createElement('div', { className: 'container' },
            React.createElement('h2', { className: 'section-title' }, title),
            React.createElement('div', { className: 'product-grid' },
                products.slice(0, 8).map(product => 
                    React.createElement(window.Components.ProductCard, {
                        key: product.id,
                        product: product
                    })
                )
            )
        )
    );
};

// 전역으로 내보내기
window.Components = window.Components || {};
window.Components.ProductList = ProductList;
