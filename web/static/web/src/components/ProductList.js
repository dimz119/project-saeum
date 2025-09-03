// 상품 목록 컴포넌트
const ProductList = ({ title, apiUrl, sectionId, filterParams }) => {
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
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('상품을 불러오는데 실패했습니다.');
            }
            const data = await response.json();
            setProducts(data.results || data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return React.createElement('div', { className: 'loading' }, '로딩 중...');
    }

    if (error) {
        return React.createElement('div', { className: 'error' }, error);
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
