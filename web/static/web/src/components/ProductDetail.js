// 상품 상세 페이지 컴포넌트
const ProductDetail = ({ productId }) => {
    const [product, setProduct] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [selectedImage, setSelectedImage] = React.useState(0);
    const [quantity, setQuantity] = React.useState(1);

    React.useEffect(() => {
        fetchProduct();
    }, [productId]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/products/${productId}/`);
            if (!response.ok) {
                throw new Error('상품을 찾을 수 없습니다.');
            }
            const data = await response.json();
            setProduct(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        // 장바구니 추가 로직
        alert(`${product.name} ${quantity}개가 장바구니에 추가되었습니다.`);
    };

    const handleBuyNow = () => {
        // 바로 구매 로직
        alert(`${product.name} ${quantity}개 주문하기`);
    };

    if (loading) {
        return React.createElement('div', { className: 'loading-container' },
            React.createElement('div', { className: 'loading' }, '상품 정보를 불러오는 중...')
        );
    }

    if (error) {
        return React.createElement('div', { className: 'error-container' },
            React.createElement('div', { className: 'error' }, error),
            React.createElement('button', { 
                className: 'btn btn-primary',
                onClick: () => window.history.back()
            }, '돌아가기')
        );
    }

    if (!product) {
        return React.createElement('div', { className: 'error-container' },
            React.createElement('div', { className: 'error' }, '상품을 찾을 수 없습니다.')
        );
    }

    // 이미지 처리 함수
    const getProductImages = () => {
        // 1. images 배열이 있고 비어있지 않은 경우
        if (product.images && product.images.length > 0) {
            return product.images;
        }
        
        // 2. main_image가 있는 경우
        if (product.main_image) {
            return [{ image: product.main_image }];
        }
        
        // 3. Glass placeholder 이미지 사용
        return [{ image: '/static/web/img/glass.png' }];
    };

    const images = getProductImages();

    return React.createElement('div', { className: 'product-detail' },
        // Breadcrumb
        React.createElement('div', { className: 'container' },
            React.createElement('nav', { className: 'breadcrumb' },
                React.createElement('a', { href: '#', onClick: (e) => { e.preventDefault(); window.Router.navigate('/'); } }, '홈'),
                React.createElement('span', null, ' > '),
                React.createElement('a', { href: '#', onClick: (e) => { e.preventDefault(); window.Router.navigate('/products'); } }, '상품'),
                React.createElement('span', null, ' > '),
                React.createElement('span', null, product.name)
            )
        ),

        // Product Detail Container
        React.createElement('div', { className: 'container' },
            React.createElement('div', { className: 'product-detail-container' },
                // Product Images
                React.createElement('div', { className: 'product-images' },
                    React.createElement('div', { className: 'main-image' },
                        React.createElement('img', {
                            src: images[selectedImage]?.image || images[0]?.image,
                            alt: product.name,
                            className: 'main-product-image'
                        })
                    ),
                    images.length > 1 && React.createElement('div', { className: 'thumbnail-images' },
                        images.map((img, index) =>
                            React.createElement('img', {
                                key: index,
                                src: img.image,
                                alt: `${product.name} ${index + 1}`,
                                className: `thumbnail ${selectedImage === index ? 'active' : ''}`,
                                onClick: () => setSelectedImage(index)
                            })
                        )
                    )
                ),

                // Product Info
                React.createElement('div', { className: 'product-info-detail' },
                    React.createElement('div', { className: 'product-brand' }, product.brand?.name || '브랜드'),
                    React.createElement('h1', { className: 'product-title' }, product.name),
                    
                    // Rating
                    React.createElement('div', { className: 'product-rating' },
                        React.createElement('div', { className: 'stars' },
                            Array.from({ length: 5 }, (_, i) =>
                                React.createElement('span', {
                                    key: i,
                                    className: `star ${i < Math.floor(product.average_rating || 0) ? '' : 'empty'}`
                                }, '★')
                            )
                        ),
                        React.createElement('span', { className: 'rating-count' }, 
                            `(${product.review_count || 0}개 리뷰)`
                        )
                    ),

                    // Price
                    React.createElement('div', { className: 'product-price-detail' },
                        product.discount_price && product.discount_price < product.price && 
                        React.createElement('span', { className: 'original-price' }, 
                            `₩${product.price.toLocaleString()}`
                        ),
                        React.createElement('span', { className: 'current-price' }, 
                            `₩${(product.discount_price || product.price).toLocaleString()}`
                        ),
                        product.discount_price && product.discount_price < product.price &&
                        React.createElement('span', { className: 'discount-rate' },
                            `${Math.round((1 - product.discount_price / product.price) * 100)}% 할인`
                        )
                    ),

                    // Description
                    React.createElement('div', { className: 'product-description' },
                        React.createElement('h3', null, '상품 설명'),
                        React.createElement('p', null, product.description || '상품 설명이 없습니다.')
                    ),

                    // Quantity Selector
                    React.createElement('div', { className: 'quantity-selector' },
                        React.createElement('label', null, '수량:'),
                        React.createElement('div', { className: 'quantity-controls' },
                            React.createElement('button', {
                                type: 'button',
                                onClick: () => setQuantity(Math.max(1, quantity - 1)),
                                disabled: quantity <= 1
                            }, '-'),
                            React.createElement('span', { className: 'quantity' }, quantity),
                            React.createElement('button', {
                                type: 'button',
                                onClick: () => setQuantity(quantity + 1)
                            }, '+')
                        )
                    ),

                    // Action Buttons
                    React.createElement('div', { className: 'product-actions-detail' },
                        React.createElement('button', {
                            className: 'btn btn-outline btn-large',
                            onClick: handleAddToCart
                        }, '장바구니 담기'),
                        React.createElement('button', {
                            className: 'btn btn-primary btn-large',
                            onClick: handleBuyNow
                        }, '바로 구매')
                    )
                )
            )
        )
    );
};

// 전역으로 내보내기
window.Components = window.Components || {};
window.Components.ProductDetail = ProductDetail;
