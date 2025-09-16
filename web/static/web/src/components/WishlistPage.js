// 찜목록 컴포넌트
const WishlistPage = () => {
    // i18n hook 사용
    const { t } = window.useTranslation ? window.useTranslation() : { t: window.t || ((key) => key) };
    
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
                setError(t('auth.login_required'));
                setLoading(false);
                return;
            }

            const response = await window.API.wishlist.getWishlist();
            setWishlistItems(response);
            setError(null);
        } catch (err) {
            console.error(t('wishlist.errors.load_failed'), err);
            setError(t('wishlist.errors.load_failed'));
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
            console.error(t('wishlist.errors.remove_failed'), error);
            alert(t('wishlist.error'));
        }
    };

    const handleAddToCart = (product) => {
        try {
            if (window.CartManager) {
                window.CartManager.addToCart(product, 1);
                alert(t('wishlist.added_to_cart'));
            }
        } catch (error) {
            console.error('Failed to add to cart:', error);
            alert('장바구니 추가에 실패했습니다. 다시 시도해주세요.');
        }
    };

    const handleProductClick = (productId) => {
        if (window.Router) {
            window.Router.navigate(`/products/${productId}`);
        }
    };

    if (loading) {
        return React.createElement('div', { className: 'container' },
            React.createElement('div', { className: 'loading' }, t('common.loading'))
        );
    }

    if (error) {
        return React.createElement('div', { className: 'container' },
            React.createElement('div', { className: 'error' }, error),
            !window.auth.getCurrentUserSync() && React.createElement('div', { style: { marginTop: '20px' } },
                React.createElement('button', {
                    className: 'btn btn-primary',
                    onClick: () => window.Router && window.Router.navigate('/login/')
                }, t('auth.go_to_login'))
            )
        );
    }

    return React.createElement('div', { className: 'container' },
        React.createElement('div', { className: 'wishlist-page' },
            React.createElement('h1', { className: 'page-title' }, t('pages.wishlist')),
            
            wishlistItems.length === 0 
                ? React.createElement('div', { className: 'empty-wishlist' },
                    React.createElement('p', null, t('wishlist.empty')),
                    React.createElement('button', {
                        className: 'btn btn-primary',
                        onClick: () => window.Router && window.Router.navigate('/')
                    }, t('common.continue_shopping'))
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
                                    item.product.brand?.name || t('product.brand')
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
                                    }, t('product.view_details')),
                                    React.createElement('button', {
                                        className: 'btn btn-primary',
                                        onClick: () => handleAddToCart(item.product)
                                    }, '장바구니 추가'),
                                    React.createElement('button', {
                                        className: 'btn btn-outline remove-btn',
                                        onClick: () => handleRemoveFromWishlist(item.product.id)
                                    }, t('wishlist.remove_from_wishlist'))
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
