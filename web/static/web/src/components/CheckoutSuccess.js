// 체크아웃 성공 페이지 컴포넌트
const CheckoutSuccess = () => {
    const [orderInfo, setOrderInfo] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        // URL에서 session_id 가져오기
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');
        
        console.log('CheckoutSuccess 컴포넌트 로드됨, session_id:', sessionId);
        
        if (sessionId) {
            processCheckoutSuccess(sessionId);
        } else {
            console.log('session_id가 없습니다.');
            setLoading(false);
        }
        
        // 장바구니 비우기
        if (window.CartManager) {
            window.CartManager.clearCart();
            console.log('장바구니가 비워졌습니다.');
        }
    }, []);

    const processCheckoutSuccess = async (sessionId) => {
        try {
            console.log('주문 처리 시작, session_id:', sessionId);
            
            // GET 방식으로 변경
            const response = await fetch(`/api/payments/process-checkout-success/?session_id=${sessionId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('API 응답 상태:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('받은 주문 데이터:', data);
                setOrderInfo(data);
            } else {
                const errorData = await response.json();
                console.error('주문 처리 중 오류 발생:', errorData);
                setOrderInfo({ error: errorData.error || '주문 처리 중 오류가 발생했습니다.' });
            }
        } catch (error) {
            console.error('체크아웃 처리 오류:', error);
            setOrderInfo({ error: '네트워크 오류가 발생했습니다.' });
        } finally {
            setLoading(false);
        }
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

    if (loading) {
        return React.createElement('div', {
            className: 'cart-page'
        },
            React.createElement('div', {
                className: 'container'
            },
                React.createElement('div', {
                    className: 'empty-cart'
                },
                    React.createElement('h2', null, '주문 처리 중...'),
                    React.createElement('p', null, '잠시만 기다려주세요.')
                )
            )
        );
    }

    // 에러가 있는 경우
    if (orderInfo && orderInfo.error) {
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
                        className: 'empty-cart-icon',
                        style: { color: '#e74c3c', fontSize: '5rem' }
                    }, '❌'),
                    React.createElement('h2', {
                        style: { color: '#e74c3c' }
                    }, '주문 처리 실패'),
                    React.createElement('p', null, orderInfo.error),
                    React.createElement('button', {
                        className: 'btn btn-primary',
                        onClick: () => {
                            if (window.Router) {
                                window.Router.navigate('/cart/');
                            }
                        }
                    }, '장바구니로 돌아가기')
                )
            )
        );
    }

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
                    className: 'empty-cart-icon',
                    style: { color: '#27ae60', fontSize: '5rem' }
                }, '✅'),
                React.createElement('h2', {
                    style: { color: '#27ae60' }
                }, '주문이 완료되었습니다!'),
                React.createElement('p', null, '결제가 성공적으로 처리되었습니다.'),
                
                // 디버깅: 받은 데이터 표시
                React.createElement('div', {
                    style: { 
                        background: '#f8f9fa', 
                        padding: '1rem', 
                        borderRadius: '4px', 
                        margin: '1rem 0',
                        fontSize: '0.9rem',
                        color: '#666'
                    }
                }, `Debug: ${JSON.stringify(orderInfo, null, 2)}`),
                
                // 주문 정보가 있는 경우에만 표시
                orderInfo && orderInfo.order && React.createElement('div', {
                    style: { 
                        background: '#f8f9fa', 
                        padding: '1.5rem', 
                        borderRadius: '8px', 
                        margin: '2rem 0',
                        textAlign: 'left',
                        maxWidth: '400px',
                        marginLeft: 'auto',
                        marginRight: 'auto'
                    }
                },
                    React.createElement('h3', {
                        style: { marginBottom: '1rem', textAlign: 'center' }
                    }, '주문 정보'),
                    orderInfo.order.order_number && React.createElement('p', null, 
                        React.createElement('strong', null, '주문번호: '),
                        orderInfo.order.order_number
                    ),
                    orderInfo.order.total_amount && React.createElement('p', null,
                        React.createElement('strong', null, '결제금액: '),
                        '₩' + new Intl.NumberFormat('ko-KR').format(orderInfo.order.total_amount)
                    ),
                    
                    // 배송지 정보 표시
                    orderInfo.order.shipping_info && React.createElement('div', {
                        style: { 
                            marginTop: '1rem',
                            padding: '1rem',
                            background: '#e8f5e8',
                            borderRadius: '4px'
                        }
                    },
                        React.createElement('h4', {
                            style: { marginBottom: '0.5rem', color: '#27ae60' }
                        }, '배송 정보'),
                        orderInfo.order.shipping_info.name && React.createElement('p', { style: { margin: '0.25rem 0' } },
                            React.createElement('strong', null, '받는 분: '),
                            orderInfo.order.shipping_info.name
                        ),
                        orderInfo.order.shipping_info.email && React.createElement('p', { style: { margin: '0.25rem 0' } },
                            React.createElement('strong', null, '이메일: '),
                            orderInfo.order.shipping_info.email
                        ),
                        orderInfo.order.shipping_info.phone && React.createElement('p', { style: { margin: '0.25rem 0' } },
                            React.createElement('strong', null, '연락처: '),
                            orderInfo.order.shipping_info.phone
                        ),
                        orderInfo.order.shipping_info.address && React.createElement('p', { style: { margin: '0.25rem 0' } },
                            React.createElement('strong', null, '주소: '),
                            orderInfo.order.shipping_info.address
                        ),
                        orderInfo.order.shipping_info.zipcode && React.createElement('p', { style: { margin: '0.25rem 0' } },
                            React.createElement('strong', null, '우편번호: '),
                            orderInfo.order.shipping_info.zipcode
                        )
                    )
                ),
                
                // 주문 정보가 없는 경우 메시지
                (!orderInfo || !orderInfo.order) && React.createElement('div', {
                    style: { 
                        background: '#fff3cd', 
                        padding: '1rem', 
                        borderRadius: '4px', 
                        margin: '1rem 0',
                        color: '#856404'
                    }
                }, '주문 정보를 불러오는 중이거나 세션이 만료되었습니다.'),
                
                React.createElement('div', {
                    style: { marginTop: '2rem' }
                },
                    React.createElement('button', {
                        className: 'btn btn-primary',
                        onClick: () => {
                            if (window.Router) {
                                window.Router.navigate('/');
                            }
                        },
                        style: { marginRight: '1rem' }
                    }, '홈으로'),
                    React.createElement('button', {
                        className: 'btn btn-outline',
                        onClick: () => {
                            if (window.Router) {
                                window.Router.navigate('/orders/');
                            }
                        }
                    }, '주문내역 보기')
                )
            )
        )
    );
};

// 전역으로 내보내기
window.Components = window.Components || {};
window.Components.CheckoutSuccess = CheckoutSuccess;
