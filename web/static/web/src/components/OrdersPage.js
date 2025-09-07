const OrdersPage = () => {
    const [orders, setOrders] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                setError('로그인이 필요합니다.');
                setLoading(false);
                return;
            }

            const response = await fetch('/api/orders/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                setOrders(data.results || data);
            } else if (response.status === 401) {
                // 토큰 갱신 시도
                const refreshToken = localStorage.getItem('refresh_token');
                if (refreshToken) {
                    const refreshResponse = await fetch('/api/token/refresh/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            refresh: refreshToken
                        })
                    });

                    if (refreshResponse.ok) {
                        const refreshData = await refreshResponse.json();
                        localStorage.setItem('access_token', refreshData.access);
                        // 다시 주문 목록 요청
                        fetchOrders();
                        return;
                    }
                }
                setError('로그인이 필요합니다.');
            } else {
                setError('주문 목록을 불러오는데 실패했습니다.');
            }
        } catch (error) {
            console.error('주문 목록 로딩 오류:', error);
            setError('네트워크 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusText = (status) => {
        const statusMap = {
            'pending': '대기중',
            'confirmed': '주문확인',
            'preparing': '상품준비중',
            'shipped': '배송중',
            'delivered': '배송완료',
            'cancelled': '주문취소'
        };
        return statusMap[status] || status;
    };

    const getStatusColor = (status) => {
        const colorMap = {
            'pending': '#ffa500',
            'confirmed': '#27ae60',
            'preparing': '#3498db',
            'shipped': '#9b59b6',
            'delivered': '#2ecc71',
            'cancelled': '#e74c3c'
        };
        return colorMap[status] || '#95a5a6';
    };

    if (loading) {
        return React.createElement('div', {
            className: 'container',
            style: { padding: '2rem', textAlign: 'center' }
        },
            React.createElement('h2', null, '주문내역을 불러오는 중...'),
            React.createElement('p', null, '잠시만 기다려주세요.')
        );
    }

    if (error) {
        return React.createElement('div', {
            className: 'container',
            style: { padding: '2rem', textAlign: 'center' }
        },
            React.createElement('h2', null, '오류 발생'),
            React.createElement('p', { style: { color: '#e74c3c' } }, error),
            React.createElement('button', {
                className: 'btn btn-primary',
                onClick: () => {
                    if (window.Router) {
                        window.Router.navigate('/');
                    }
                }
            }, '홈으로 돌아가기')
        );
    }

    if (!orders || orders.length === 0) {
        return React.createElement('div', {
            className: 'container',
            style: { padding: '2rem', textAlign: 'center' }
        },
            React.createElement('h2', null, '주문내역이 없습니다'),
            React.createElement('p', null, '아직 주문한 상품이 없습니다.'),
            React.createElement('button', {
                className: 'btn btn-primary',
                onClick: () => {
                    if (window.Router) {
                        window.Router.navigate('/');
                    }
                }
            }, '쇼핑하러 가기')
        );
    }

    return React.createElement('div', {
        className: 'container',
        style: { padding: '2rem' }
    },
        React.createElement('h1', {
            style: { marginBottom: '2rem', color: '#2c3e50' }
        }, '주문내역'),
        
        React.createElement('div', {
            style: { display: 'flex', flexDirection: 'column', gap: '1.5rem' }
        },
            orders.map(order => 
                React.createElement('div', {
                    key: order.id,
                    style: {
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        padding: '1.5rem',
                        backgroundColor: '#fff',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }
                },
                    // 주문 헤더
                    React.createElement('div', {
                        style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1rem',
                            paddingBottom: '1rem',
                            borderBottom: '1px solid #eee'
                        }
                    },
                        React.createElement('div', null,
                            React.createElement('h3', {
                                style: { margin: '0 0 0.5rem 0', color: '#2c3e50' }
                            }, `주문번호: ${order.order_number}`),
                            React.createElement('p', {
                                style: { margin: '0', color: '#7f8c8d', fontSize: '0.9rem' }
                            }, `주문일시: ${formatDate(order.created_at)}`)
                        ),
                        React.createElement('div', {
                            style: {
                                textAlign: 'right'
                            }
                        },
                            React.createElement('span', {
                                style: {
                                    padding: '0.5rem 1rem',
                                    borderRadius: '20px',
                                    backgroundColor: getStatusColor(order.status),
                                    color: 'white',
                                    fontSize: '0.9rem',
                                    fontWeight: 'bold'
                                }
                            }, getStatusText(order.status)),
                            React.createElement('p', {
                                style: { margin: '0.5rem 0 0 0', fontSize: '1.1rem', fontWeight: 'bold', color: '#2c3e50' }
                            }, `₩${Number(order.final_amount).toLocaleString()}`)
                        )
                    ),
                    
                    // 배송 정보
                    order.shipping_name && React.createElement('div', {
                        style: { marginBottom: '1rem' }
                    },
                        React.createElement('h4', {
                            style: { margin: '0 0 0.5rem 0', color: '#27ae60' }
                        }, '배송 정보'),
                        React.createElement('div', {
                            style: { fontSize: '0.9rem', color: '#555' }
                        },
                            React.createElement('p', { style: { margin: '0.25rem 0' } }, `받는 분: ${order.shipping_name}`),
                            order.shipping_email && React.createElement('p', { style: { margin: '0.25rem 0' } }, `이메일: ${order.shipping_email}`),
                            order.shipping_phone && React.createElement('p', { style: { margin: '0.25rem 0' } }, `연락처: ${order.shipping_phone}`),
                            order.shipping_address && React.createElement('p', { style: { margin: '0.25rem 0' } }, `주소: ${order.shipping_address}`),
                            order.shipping_zipcode && React.createElement('p', { style: { margin: '0.25rem 0' } }, `우편번호: ${order.shipping_zipcode}`)
                        )
                    ),
                    
                    // 주문 상품
                    order.items && order.items.length > 0 && React.createElement('div', null,
                        React.createElement('h4', {
                            style: { margin: '0 0 0.5rem 0', color: '#2c3e50' }
                        }, '주문 상품'),
                        React.createElement('div', {
                            style: { display: 'flex', flexDirection: 'column', gap: '0.5rem' }
                        },
                            order.items.map((item, index) =>
                                React.createElement('div', {
                                    key: index,
                                    style: {
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '0.5rem',
                                        backgroundColor: '#f8f9fa',
                                        borderRadius: '4px'
                                    }
                                },
                                    React.createElement('span', null, `${item.product_name} × ${item.quantity}`),
                                    React.createElement('span', {
                                        style: { fontWeight: 'bold' }
                                    }, `₩${Number(item.total).toLocaleString()}`)
                                )
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
window.Components.OrdersPage = OrdersPage;
