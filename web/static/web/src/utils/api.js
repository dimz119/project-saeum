// API 호출 관련 함수들

// API 요청 헬퍼 함수
const api = {
    get: async (endpoint) => {
        try {
            const token = window.auth?.tokenStorage?.getAccessToken();
            const headers = {
                'Content-Type': 'application/json',
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch(`${window.CONFIG.API_BASE_URL}${endpoint}`, {
                method: 'GET',
                headers: headers
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API GET Error:', error);
            throw error;
        }
    },

    post: async (endpoint, data) => {
        try {
            const token = window.auth?.tokenStorage?.getAccessToken();
            const headers = {
                'Content-Type': 'application/json',
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch(`${window.CONFIG.API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API POST Error:', error);
            throw error;
        }
    },

    delete: async (endpoint) => {
        try {
            const token = window.auth?.tokenStorage?.getAccessToken();
            const headers = {
                'Content-Type': 'application/json',
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch(`${window.CONFIG.API_BASE_URL}${endpoint}`, {
                method: 'DELETE',
                headers: headers
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.status === 204 ? {} : await response.json();
        } catch (error) {
            console.error('API DELETE Error:', error);
            throw error;
        }
    }
};

// 상품 API
const productAPI = {
    getProducts: () => api.get('/products/'),
    getFeaturedProducts: () => api.get('/products/featured/'),
    getNewProducts: () => api.get('/products/new/'),
    getSaleProducts: () => api.get('/products/sale/'),
    getProduct: (id) => api.get(`/products/${id}/`),
    getCategories: () => api.get('/products/categories/'),
    getBrands: () => api.get('/products/brands/')
};

// 결제 API
const paymentAPI = {
    getStripePublicKey: () => api.get('/payments/stripe-public-key/'),
    createPaymentIntent: (data) => api.post('/payments/create-payment-intent/', data),
    confirmPayment: (data) => api.post('/payments/confirm-payment/', data)
};

// 찜목록 API
const wishlistAPI = {
    getWishlist: () => api.get('/products/wishlist/'),
    toggleWishlist: (productId) => api.post('/products/wishlist/toggle/', { product_id: productId }),
    checkWishlist: (productId) => api.get(`/products/wishlist/check/?product_id=${productId}`)
};

// 전역 API 객체로 내보내기
window.API = {
    products: productAPI,
    payments: paymentAPI,
    wishlist: wishlistAPI
};
