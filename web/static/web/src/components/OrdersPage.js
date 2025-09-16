const OrdersPage = () => {
    // Translation hook with fallback
    const { t } = window.useTranslation ? window.useTranslation() : { t: window.t || ((key) => key) };
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
                setError(t('auth.login_required'));
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
                setError(t('auth.login_required'));
            } else {
                setError(t('order.load_error'));
            }
        } catch (error) {
            console.error('Order list loading error:', error);
            setError(t('order.error'));
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
            'pending': t('order.status_pending'),
            'confirmed': t('order.status_confirmed'),
            'preparing': t('order.status_preparing'),
            'shipped': t('order.status_shipped'),
            'delivered': t('order.status_delivered'),
            'cancelled': t('order.status_cancelled')
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
            React.createElement('h2', null, t('order.loading')),
            React.createElement('p', null, t('order.loading_wait'))
        );
    }

    if (error) {
        return React.createElement('div', {
            className: 'container',
            style: { padding: '2rem', textAlign: 'center' }
        },
            React.createElement('h2', null, t('order.error_title')),
            React.createElement('p', { style: { color: '#e74c3c' } }, error),
            React.createElement('button', {
                className: 'btn btn-primary',
                onClick: () => {
                    if (window.Router) {
                        window.Router.navigate('/');
                    }
                }
            }, t('pages.go_home'))
        );
    }

    if (!orders || orders.length === 0) {
        return React.createElement('div', {
            className: 'container',
            style: { padding: '2rem', textAlign: 'center' }
        },
            React.createElement('h2', null, t('order.no_orders')),
            React.createElement('p', null, t('order.no_orders_message')),
            React.createElement('button', {
                className: 'btn btn-primary',
                onClick: () => {
                    if (window.Router) {
                        window.Router.navigate('/');
                    }
                }
            }, t('order.shop_now'))
        );
    }

    return React.createElement('div', {
        className: 'container',
        style: { padding: '2rem' }
    },
        React.createElement('h1', {
            style: { marginBottom: '2rem', color: '#2c3e50' }
        }, t('order.title')),
        
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
                            }, `${t('order.order_number')}: ${order.order_number}`),
                            React.createElement('p', {
                                style: { margin: '0', color: '#7f8c8d', fontSize: '0.9rem' }
                            }, `${t('order.date')}: ${formatDate(order.created_at)}`)
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
                            }, `${t('order.total')}: ₩${Number(order.final_amount).toLocaleString()}`)
                        )
                    ),
                    
                    // 배송 정보
                    order.shipping_name && React.createElement('div', {
                        style: { marginBottom: '1rem' }
                    },
                        React.createElement('h4', {
                            style: { margin: '0 0 0.5rem 0', color: '#27ae60' }
                        }, t('order.shipping_info')),
                        React.createElement('div', {
                            style: { fontSize: '0.9rem', color: '#555' }
                        },
                            React.createElement('p', { style: { margin: '0.25rem 0' } }, `${t('order.recipient')}: ${order.shipping_name}`),
                            order.shipping_email && React.createElement('p', { style: { margin: '0.25rem 0' } }, `${t('order.email')}: ${order.shipping_email}`),
                            order.shipping_phone && React.createElement('p', { style: { margin: '0.25rem 0' } }, `${t('order.contact')}: ${order.shipping_phone}`),
                            order.shipping_address && React.createElement('p', { style: { margin: '0.25rem 0' } }, `${t('order.address')}: ${order.shipping_address}`),
                            order.shipping_zipcode && React.createElement('p', { style: { margin: '0.25rem 0' } }, `${t('order.zipcode')}: ${order.shipping_zipcode}`)
                        )
                    ),
                    
                    // 주문 상품
                    order.items && order.items.length > 0 && React.createElement('div', null,
                        React.createElement('h4', {
                            style: { margin: '0 0 0.5rem 0', color: '#2c3e50' }
                        }, t('product.ordered_items')),
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
