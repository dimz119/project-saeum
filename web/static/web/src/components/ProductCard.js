// 상품 카드 컴포넌트
const ProductCard = ({ product }) => {
    const hasDiscount = product.sale_price && parseFloat(product.sale_price) < parseFloat(product.price);
    
    const handleClick = () => {
        // React Router 네비게이션 사용
        if (window.Router) {
            window.Router.navigate(`/products/${product.id}`);
        } else {
            // 폴백: 페이지 리로드
            window.location.href = `/products/${product.id}`;
        }
    };

    // 이미지 URL 결정 로직
    const getImageUrl = () => {
        // 1. main_image가 있으면 사용
        if (product.main_image) {
            return product.main_image;
        }
        
        // 2. images 배열에서 첫 번째 이미지 사용
        if (product.images && product.images.length > 0) {
            return product.images[0].image;
        }
        
        // 3. Glass placeholder 이미지 사용
        return '/static/web/img/glass.png';
    };

    const imageUrl = getImageUrl();

    return React.createElement('div', 
        { 
            className: 'product-card',
            onClick: handleClick,
            style: { cursor: 'pointer' }
        },
        React.createElement('div', { className: 'product-image' },
            React.createElement('img', {
                src: imageUrl,
                alt: product.name,
                onError: (e) => {
                    // 이미지 로드 실패 시 glass.png로 교체
                    e.target.src = '/static/web/img/glass.png';
                },
                style: { 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease'
                }
            }),
            hasDiscount && React.createElement('div', { className: 'product-badge' }, 'SALE')
        ),
        React.createElement('div', { className: 'product-info' },
            React.createElement('div', { className: 'product-brand' }, 
                product.brand?.name || '브랜드'
            ),
            React.createElement('h3', { className: 'product-name' }, 
                product.name
            ),
            
            // 평점 표시
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
                    `(${product.review_count || 0})`
                )
            ),
            
            // 가격 정보
            React.createElement('div', { className: 'product-price' },
                hasDiscount && React.createElement('span', { className: 'original-price' },
                    `₩${parseInt(product.price).toLocaleString()}`
                ),
                React.createElement('span', { className: 'current-price' },
                    `₩${parseInt(product.current_price || product.sale_price || product.price).toLocaleString()}`
                ),
                hasDiscount && React.createElement('span', { className: 'discount-rate' },
                    `${Math.round((1 - parseFloat(product.sale_price) / parseFloat(product.price)) * 100)}%`
                )
            ),
            
            // 액션 버튼
            React.createElement('div', { className: 'product-actions' },
                React.createElement('button', {
                    className: 'btn-add-cart',
                    onClick: (e) => {
                        e.stopPropagation();
                        alert(`${product.name}이(가) 장바구니에 추가되었습니다.`);
                    }
                }, '장바구니'),
                React.createElement('button', {
                    className: 'btn-wishlist',
                    onClick: (e) => {
                        e.stopPropagation();
                        alert(`${product.name}이(가) 찜 목록에 추가되었습니다.`);
                    }
                }, '♡')
            )
        )
    );
};

// 전역으로 내보내기
window.Components = window.Components || {};
window.Components.ProductCard = ProductCard;
