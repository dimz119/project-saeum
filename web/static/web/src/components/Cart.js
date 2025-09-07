// 장바구니 페이지 컴포넌트
const Cart = () => {
    const [cartItems, setCartItems] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [user, setUser] = React.useState(null);

    console.log('Cart 컴포넌트 렌더링됨');

    React.useEffect(() => {
        // 로그인 상태 확인
        const currentUser = window.auth?.getCurrentUserSync();
        setUser(currentUser);
        
        if (currentUser) {
            loadCartItems();
        }
    }, []);

    const loadCartItems = async () => {
        if (window.CartManager) {
            const items = window.CartManager.getCart();
            
            // 각 아이템의 최신 가격 정보를 가져와서 업데이트
            const updatedItems = await Promise.all(items.map(async (item) => {
                try {
                    const response = await fetch(`/api/products/${item.id}/`);
                    if (response.ok) {
                        const productData = await response.json();
                        return {
                            ...item,
                            price: productData.current_price,
                            originalPrice: parseFloat(productData.price),
                            name: productData.name,
                            brand: productData.brand?.name || '브랜드'
                        };
                    }
                } catch (error) {
                    console.error('상품 정보 업데이트 실패:', error);
                }
                return item; // 업데이트 실패시 기존 아이템 반환
            }));
            
            // 업데이트된 장바구니 저장
            if (window.CartManager) {
                window.CartManager.saveCart(updatedItems);
            }
            
            setCartItems(updatedItems);
        }
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(productId);
            return;
        }
        
        if (window.CartManager) {
            window.CartManager.updateQuantity(productId, newQuantity);
            loadCartItems();
        }
    };

    const removeFromCart = (productId) => {
        if (window.CartManager) {
            window.CartManager.removeFromCart(productId);
            loadCartItems();
        }
    };

    const clearCart = () => {
        if (window.CartManager) {
            window.CartManager.clearCart();
            loadCartItems();
        }
    };

    const getTotalPrice = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const handleCheckout = async () => {
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

        // 바로 Stripe Checkout으로 이동
        await proceedToCheckout();
    };

    const proceedToCheckout = async () => {
        console.log('Stripe checkout 직접 진행');
        setLoading(true);
        
        try {
            const response = await fetch('/api/payments/create-checkout-session/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({
                    items: cartItems.map(item => ({
                        product_id: item.id,
                        quantity: item.quantity
                    })),
                    success_url: `${window.location.origin}/checkout-success/?session_id={CHECKOUT_SESSION_ID}`,
                    cancel_url: `${window.location.origin}/cart/`
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.checkout_url) {
                    window.location.href = data.checkout_url;
                } else {
                    alert('체크아웃 URL을 받지 못했습니다.');
                }
            } else {
                const errorData = await response.json();
                alert(`결제 준비 중 오류가 발생했습니다: ${errorData.error || '알 수 없는 오류'}`);
            }
        } catch (error) {
            console.error('체크아웃 오류:', error);
            alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
        }
        
        setLoading(false);
    };

    // CSRF 토큰 가져오기
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('ko-KR').format(price);
    };

    if (!user) {
        return React.createElement('div', {
            className: 'cart-page'
        },
            React.createElement('div', {
                className: 'container'
            },
                React.createElement('div', {
                    className: 'empty-cart'
                },
                    React.createElement('div', {
                        className: 'empty-cart-icon'
                    }, '🔒'),
                    React.createElement('h2', null, '로그인이 필요합니다'),
                    React.createElement('p', null, '장바구니를 보려면 로그인해주세요.'),
                    React.createElement('button', {
                        className: 'btn btn-primary',
                        onClick: () => {
                            if (window.Router) {
                                window.Router.navigate('/login/');
                            }
                        }
                    }, '로그인하기')
                )
            )
        );
    }

    if (cartItems.length === 0) {
        return React.createElement('div', {
            className: 'cart-page'
        },
            React.createElement('div', {
                className: 'container'
            },
                React.createElement('h1', {
                    className: 'cart-title'
                }, '장바구니'),
                React.createElement('div', {
                    className: 'empty-cart'
                },
                    React.createElement('div', {
                        className: 'empty-cart-icon'
                    }, '🛒'),
                    React.createElement('h2', null, '장바구니가 비어있습니다'),
                    React.createElement('p', null, '마음에 드는 상품을 담아보세요!'),
                    React.createElement('button', {
                        className: 'btn btn-primary',
                        onClick: () => {
                            if (window.Router) {
                                window.Router.navigate('/');
                            }
                        }
                    }, '쇼핑하러 가기')
                )
            )
        );
    }

    return React.createElement('div', null,
        // 장바구니 메인 컨텐츠
        React.createElement('div', {
            className: 'cart-page'
        },
            React.createElement('div', {
                className: 'container'
            },
                React.createElement('h1', {
                    className: 'cart-title'
                }, '장바구니'),
                
                // 장바구니 아이템들
                React.createElement('div', {
                    className: 'cart-items'
                },
                    cartItems.map(item =>
                        React.createElement('div', {
                            key: item.id,
                            className: 'cart-item'
                        },
                            React.createElement('div', {
                                className: 'cart-item-image'
                            },
                                React.createElement('img', {
                                    src: item.image_url || '/static/web/img/model.jpg',
                                    alt: item.name
                                })
                            ),
                            React.createElement('div', {
                                className: 'cart-item-details'
                            },
                                React.createElement('h3', {
                                    className: 'cart-item-name'
                                }, item.name),
                                React.createElement('p', {
                                    className: 'cart-item-brand'
                                }, item.brand || '브랜드'),
                                React.createElement('div', {
                                    className: 'cart-item-price'
                                },
                                    React.createElement('span', {
                                        className: 'current-price'
                                    }, '₩' + formatPrice(item.price))
                                )
                            ),
                            React.createElement('div', {
                                className: 'cart-item-quantity'
                            },
                                React.createElement('button', {
                                    className: 'quantity-btn',
                                    onClick: () => updateQuantity(item.id, item.quantity - 1),
                                    disabled: loading || item.quantity <= 1
                                }, '-'),
                                React.createElement('span', {
                                    className: 'quantity'
                                }, item.quantity),
                                React.createElement('button', {
                                    className: 'quantity-btn',
                                    onClick: () => updateQuantity(item.id, item.quantity + 1),
                                    disabled: loading
                                }, '+')
                            ),
                            React.createElement('div', {
                                className: 'cart-item-total'
                            }, '₩' + formatPrice(item.price * item.quantity)),
                            React.createElement('button', {
                                className: 'remove-btn',
                                onClick: () => removeFromCart(item.id),
                                disabled: loading,
                                title: '삭제'
                            }, '🗑️')
                        )
                    )
                ),

                // 장바구니 요약 및 주문 버튼
                React.createElement('div', {
                    className: 'cart-summary'
                },
                    React.createElement('div', {
                        className: 'summary-row total'
                    },
                        React.createElement('span', null, '총 금액'),
                        React.createElement('span', null, '₩' + formatPrice(getTotalPrice()))
                    ),
                    React.createElement('div', {
                        className: 'cart-actions'
                    },
                        React.createElement('button', {
                            className: 'btn btn-secondary',
                            onClick: clearCart,
                            disabled: loading
                        }, '장바구니 비우기'),
                        React.createElement('button', {
                            className: 'btn btn-outline',
                            onClick: () => {
                                if (window.Router) {
                                    window.Router.navigate('/');
                                }
                            }
                        }, '쇼핑 계속하기'),
                        React.createElement('button', {
                            className: 'btn btn-primary',
                            onClick: handleCheckout,
                            disabled: loading
                        }, loading ? '주문 처리 중...' : '주문하기')
                    )
                )
            )
        )
    );
};

// 전역으로 내보내기
window.Components = window.Components || {};
window.Components.Cart = Cart;
