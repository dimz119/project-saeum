// 장바구니 페이지 컴포넌트
const Cart = () => {
    const [cartItems, setCartItems] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [user, setUser] = React.useState(null);

    React.useEffect(() => {
        // 로그인 상태 확인
        const currentUser = window.auth?.getCurrentUserSync();
        setUser(currentUser);
        
        if (currentUser) {
            loadCartItems();
        }
    }, []);

    const loadCartItems = () => {
        if (window.CartManager) {
            const items = window.CartManager.getCart();
            setCartItems(items);
        }
    };

    const updateQuantity = (productId, newQuantity) => {
        if (window.CartManager) {
            window.CartManager.updateQuantity(productId, newQuantity);
            loadCartItems(); // 화면 업데이트
        }
    };

    const removeItem = (productId) => {
        if (window.CartManager) {
            window.CartManager.removeFromCart(productId);
            loadCartItems(); // 화면 업데이트
        }
    };

    const getTotalPrice = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const handleCheckout = () => {
        if (!user) {
            alert('로그인이 필요한 서비스입니다.');
            if (window.Router) {
                window.Router.navigate('/login/');
            }
            return;
        }
        
        if (cartItems.length === 0) {
            alert('장바구니가 비어있습니다.');
            return;
        }
        
        setLoading(true);
        // 체크아웃 로직 시뮬레이션
        setTimeout(() => {
            alert('주문이 완료되었습니다!');
            if (window.CartManager) {
                window.CartManager.clearCart();
            }
            loadCartItems();
            setLoading(false);
        }, 2000);
    };

    // 로그인하지 않은 사용자에게 안내 화면 표시
    if (!user) {
        return React.createElement('div', { className: 'cart-page' },
            React.createElement('div', { className: 'container' },
                React.createElement('h1', { className: 'cart-title' }, '장바구니'),
                React.createElement('div', { className: 'login-required' },
                    React.createElement('div', { className: 'login-required-icon' },
                        React.createElement('i', { className: 'fas fa-lock' })
                    ),
                    React.createElement('h2', null, '로그인이 필요한 서비스입니다'),
                    React.createElement('p', null, '장바구니를 사용하려면 먼저 로그인해주세요.'),
                    React.createElement('div', { className: 'login-actions' },
                        React.createElement('button', {
                            className: 'btn btn-primary',
                            onClick: () => {
                                if (window.Router) {
                                    window.Router.navigate('/login/');
                                }
                            }
                        }, '로그인하러 가기'),
                        React.createElement('button', {
                            className: 'btn btn-secondary',
                            onClick: () => {
                                if (window.Router) {
                                    window.Router.navigate('/');
                                }
                            }
                        }, '메인으로 돌아가기')
                    )
                )
            )
        );
    }

    if (cartItems.length === 0) {
        return React.createElement('div', { className: 'cart-page' },
            React.createElement('div', { className: 'container' },
                React.createElement('h1', { className: 'cart-title' }, '장바구니'),
                React.createElement('div', { className: 'empty-cart' },
                    React.createElement('i', { className: 'fas fa-shopping-cart empty-cart-icon' }),
                    React.createElement('h2', null, '장바구니가 비어있습니다'),
                    React.createElement('p', null, '쇼핑을 계속하여 상품을 추가해보세요!'),
                    React.createElement('button', {
                        className: 'btn btn-primary',
                        onClick: () => {
                            if (window.Router) {
                                window.Router.navigate('/');
                            }
                        }
                    }, '쇼핑 계속하기')
                )
            )
        );
    }

    return React.createElement('div', { className: 'cart-page' },
        React.createElement('div', { className: 'container' },
            React.createElement('h1', { className: 'cart-title' }, '장바구니'),
            
            React.createElement('div', { className: 'cart-items' },
                cartItems.map(item =>
                    React.createElement('div', { key: item.id, className: 'cart-item' },
                        React.createElement('div', { className: 'cart-item-image' },
                            React.createElement('img', {
                                src: item.image,
                                alt: item.name,
                                onError: (e) => {
                                    e.target.src = '/static/web/img/glass.png';
                                }
                            })
                        ),
                        React.createElement('div', { className: 'cart-item-details' },
                            React.createElement('h3', { className: 'cart-item-name' }, item.name),
                            React.createElement('p', { className: 'cart-item-brand' }, item.brand),
                            React.createElement('div', { className: 'cart-item-price' },
                                item.originalPrice > item.price &&
                                React.createElement('span', { className: 'original-price' },
                                    `₩${item.originalPrice.toLocaleString()}`
                                ),
                                React.createElement('span', { className: 'current-price' },
                                    `₩${item.price.toLocaleString()}`
                                )
                            )
                        ),
                        React.createElement('div', { className: 'cart-item-quantity' },
                            React.createElement('button', {
                                className: 'quantity-btn',
                                onClick: () => updateQuantity(item.id, item.quantity - 1),
                                disabled: item.quantity <= 1
                            }, '-'),
                            React.createElement('span', { className: 'quantity' }, item.quantity),
                            React.createElement('button', {
                                className: 'quantity-btn',
                                onClick: () => updateQuantity(item.id, item.quantity + 1)
                            }, '+')
                        ),
                        React.createElement('div', { className: 'cart-item-total' },
                            `₩${(item.price * item.quantity).toLocaleString()}`
                        ),
                        React.createElement('button', {
                            className: 'remove-btn',
                            onClick: () => removeItem(item.id),
                            title: '삭제'
                        }, React.createElement('i', { className: 'fas fa-trash' }))
                    )
                )
            ),

            React.createElement('div', { className: 'cart-summary' },
                React.createElement('div', { className: 'summary-row' },
                    React.createElement('span', null, '총 상품 개수:'),
                    React.createElement('span', null, `${cartItems.reduce((total, item) => total + item.quantity, 0)}개`)
                ),
                React.createElement('div', { className: 'summary-row total' },
                    React.createElement('span', null, '총 결제 금액:'),
                    React.createElement('span', null, `₩${getTotalPrice().toLocaleString()}`)
                ),
                React.createElement('div', { className: 'cart-actions' },
                    React.createElement('button', {
                        className: 'btn btn-outline',
                        onClick: () => {
                            if (window.Router) {
                                window.Router.navigate('/');
                            }
                        }
                    }, '쇼핑 계속하기'),
                    React.createElement('button', {
                        className: 'btn btn-primary btn-large',
                        onClick: handleCheckout,
                        disabled: loading
                    }, loading ? '주문 처리 중...' : '주문하기')
                )
            )
        )
    );
};

// 전역으로 내보내기
window.Components = window.Components || {};
window.Components.Cart = Cart;
