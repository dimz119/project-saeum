// 간단한 테스트 앱 (React Router 없이)
const SimpleApp = () => {
    const [products, setProducts] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        console.log('SimpleApp mounted');
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            console.log('Fetching products...');
            const response = await fetch('/api/products/');
            const data = await response.json();
            console.log('Products fetched:', data);
            setProducts(data.results || data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return React.createElement('div', { className: 'loading' }, 'Loading...');
    }

    return React.createElement('div', { className: 'simple-app' },
        React.createElement('h1', null, 'Simple App Test'),
        React.createElement('p', null, `Found ${products.length} products`),
        React.createElement('div', null,
            products.slice(0, 3).map(product =>
                React.createElement('div', { key: product.id },
                    React.createElement('h3', null, product.name),
                    React.createElement('p', null, `Price: ₩${product.price}`)
                )
            )
        )
    );
};

// 페이지 로드 시 SimpleApp 마운트
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, mounting SimpleApp');
    const rootElement = document.getElementById('root');
    if (rootElement) {
        console.log('Root element found, rendering SimpleApp');
        ReactDOM.render(React.createElement(SimpleApp), rootElement);
    } else {
        console.error('Root element not found');
    }
});

// 전역으로 내보내기
window.SimpleApp = SimpleApp;
