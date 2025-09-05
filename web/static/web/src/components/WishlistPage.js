// 찜목록 컴포넌트
const WishlistPage = () => {
    const [wishlistItems, setWishlistItems] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        loadWishlist();
    }, []);

    const loadWishlist = async () => {
        try {
            setLoading(true);
            const user = window.auth.getCurrentUserSync();
            
            if (!user) {
                setError('로그인이 필요한 서비스입니다.');
                setLoading(false);
                return;
            }

            const response = await window.API.wishlist.getWishlist();
            setWishlistItems(response);
            setError(null);
        } catch (err) {
            console.error('찜목록 로드 실패:', err);
            setError('찜목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFromWishlist = async (productId) => {
        try {
            await window.API.wishlist.toggleWishlist(productId);
            // 목록에서 제거
            setWishlistItems(prev => prev.filter(item => item.product.id !== productId));
            
            // 찜 카운트 업데이트
            if (window.updateWishlistCount) {
                window.updateWishlistCount();
            }
        } catch (error) {
            console.error('찜목록 제거 실패:', error);
            alert('오류가 발생했습니다. 다시 시도해주세요.');
        }
    };

    const handleProductClick = (productId) => {
        if (window.Router) {
            window.Router.navigate(`/products/${productId}`);
        }
    };

    if (loading) {
        return React.createElement('div', { className: 'container' },
            React.createElement('div', { className: 'loading' }, '로딩 중...')
        );
    }

    if (error) {
        return React.createElement('div', { className: 'container' },
            React.createElement('div', { className: 'error' }, error),
            !window.auth.getCurrentUserSync() && React.createElement('div', { style: { marginTop: '20px' } },
                React.createElement('button', {
                    className: 'btn btn-primary',
                    onClick: () => window.Router && window.Router.navigate('/login/')
                }, '로그인하러 가기')
            )
        );
    }

    return React.createElement('div', { className: 'container' },
        React.createElement('div', { className: 'wishlist-page' },
            React.createElement('h1', { className: 'page-title' }, '찜목록'),
            
            wishlistItems.length === 0 
                ? React.createElement('div', { className: 'empty-wishlist' },
                    React.createElement('p', null, '찜한 상품이 없습니다.'),
                    React.createElement('button', {
                        className: 'btn btn-primary',
                        onClick: () => window.Router && window.Router.navigate('/')
                    }, '쇼핑 계속하기')
                )
                : React.createElement('div', { className: 'wishlist-grid' },
                    wishlistItems.map(item => 
                        React.createElement('div', {
                            key: item.id,
                            className: 'wishlist-item'
                        },
                            React.createElement('div', {
                                className: 'wishlist-item-image',
                                onClick: () => handleProductClick(item.product.id),
                                style: { cursor: 'pointer' }
                            },
                                React.createElement('img', {
                                    src: item.product.main_image || '/static/web/img/glass.png',
                                    alt: item.product.name,
                                    onError: (e) => {
                                        e.target.src = '/static/web/img/glass.png';
                                    }
                                })
                            ),
                            React.createElement('div', { className: 'wishlist-item-info' },
                                React.createElement('h3', {
                                    className: 'product-name',
                                    onClick: () => handleProductClick(item.product.id),
                                    style: { cursor: 'pointer' }
                                }, item.product.name),
                                React.createElement('p', { className: 'product-brand' }, 
                                    item.product.brand?.name || '브랜드'
                                ),
                                React.createElement('div', { className: 'product-price' },
                                    item.product.is_on_sale && item.product.sale_price
                                        ? React.createElement('div', null,
                                            React.createElement('span', { className: 'original-price' }, 
                                                `₩${parseInt(item.product.price).toLocaleString()}`
                                            ),
                                            React.createElement('span', { className: 'sale-price' }, 
                                                `₩${parseInt(item.product.sale_price).toLocaleString()}`
                                            )
                                        )
                                        : React.createElement('span', { className: 'current-price' }, 
                                            `₩${parseInt(item.product.current_price || item.product.price).toLocaleString()}`
                                        )
                                ),
                                React.createElement('div', { className: 'wishlist-actions' },
                                    React.createElement('button', {
                                        className: 'btn btn-secondary',
                                        onClick: () => handleProductClick(item.product.id)
                                    }, '상품 보기'),
                                    React.createElement('button', {
                                        className: 'btn btn-outline remove-btn',
                                        onClick: () => handleRemoveFromWishlist(item.product.id)
                                    }, '찜목록에서 제거')
                                )
                            )
                        )
                    )
                )
        )
    );
};

// 전역으로 내보내기
window.Components = window.Components || {};
window.Components.WishlistPage = WishlistPage;
