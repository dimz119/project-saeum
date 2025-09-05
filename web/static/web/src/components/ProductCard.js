// 상품 카드 컴포넌트
const ProductCard = ({ product }) => {
    const [isWishlisted, setIsWishlisted] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    
    const hasDiscount = product.sale_price && parseFloat(product.sale_price) < parseFloat(product.price);
    
    // 컴포넌트 마운트 시 찜상태 확인
    React.useEffect(() => {
        const user = window.auth.getCurrentUserSync();
        if (user && window.API?.wishlist) {
            window.API.wishlist.checkWishlist(product.id)
                .then(result => setIsWishlisted(result.is_wishlisted))
                .catch(console.error);
        }
    }, [product.id]);
    
    const handleClick = () => {
        // React Router 네비게이션 사용
        if (window.Router) {
            window.Router.navigate(`/products/${product.id}`);
        } else {
            // 폴백: 페이지 리로드
            window.location.href = `/products/${product.id}`;
        }
    };

    const handleWishlistToggle = async (e) => {
        e.stopPropagation(); // 카드 클릭 이벤트 방지
        
        const user = window.auth.getCurrentUserSync();
        if (!user) {
            alert('로그인이 필요한 서비스입니다.');
            if (window.Router) {
                window.Router.navigate('/login/');
            }
            return;
        }

        if (isLoading) return;
        
        setIsLoading(true);
        try {
            const result = await window.API.wishlist.toggleWishlist(product.id);
            setIsWishlisted(result.is_wishlisted);
            
            // 사용자에게 피드백 제공
            if (result.is_wishlisted) {
                alert('찜목록에 추가되었습니다.');
                console.log('찜목록에 추가되었습니다.');
            } else {
                alert('찜목록에서 제거되었습니다.');
                console.log('찜목록에서 제거되었습니다.');
            }
            
            // 찜 카운트 업데이트 이벤트 발생
            if (window.updateWishlistCount) {
                window.updateWishlistCount();
            }
        } catch (error) {
            console.error('찜목록 처리 중 오류:', error);
            alert('오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
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
            hasDiscount && React.createElement('div', { className: 'product-badge' }, 'SALE'),
            // 찜하기 버튼 추가
            React.createElement('button', {
                className: `wishlist-btn ${isWishlisted ? 'active' : ''}`,
                onClick: handleWishlistToggle,
                disabled: isLoading,
                style: {
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '35px',
                    height: '35px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    zIndex: 2
                }
            }, React.createElement('i', {
                className: `fas fa-heart`,
                style: {
                    color: isWishlisted ? '#ff4757' : '#ddd',
                    fontSize: '16px'
                }
            }))
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
                        
                        // 로그인 확인
                        const user = window.auth?.getCurrentUserSync();
                        if (!user) {
                            alert('로그인이 필요한 서비스입니다.');
                            if (window.Router) {
                                window.Router.navigate('/login/');
                            }
                            return;
                        }
                        
                        if (window.CartManager) {
                            window.CartManager.addToCart(product, 1);
                            // 성공 메시지 표시
                            alert(`${product.name}이(가) 장바구니에 추가되었습니다.`);
                        } else {
                            alert('장바구니 기능을 초기화 중입니다. 잠시 후 다시 시도해주세요.');
                        }
                    }
                }, '장바구니'),
                React.createElement('button', {
                    className: `btn-wishlist ${isWishlisted ? 'active' : ''}`,
                    onClick: handleWishlistToggle,
                    disabled: isLoading,
                    style: {
                        color: isWishlisted ? '#ff4757' : '#666'
                    }
                }, isWishlisted ? '♥' : '♡')
            )
        )
    );
};

// 전역으로 내보내기
window.Components = window.Components || {};
window.Components.ProductCard = ProductCard;
