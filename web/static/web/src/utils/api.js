// API 기본 설정
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// API 요청 헬퍼 함수
const api = {
    get: async (endpoint) => {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`);
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
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
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
    }
};

// 상품 API
const productAPI = {
    getProducts: () => api.get('/products/'),
    getFeaturedProducts: () => api.get('/products/featured/'),
    getProduct: (slug) => api.get(`/products/${slug}/`),
    getCategories: () => api.get('/products/categories/'),
    getBrands: () => api.get('/products/brands/')
};

// 결제 API
const paymentAPI = {
    getStripePublicKey: () => api.get('/payments/stripe-public-key/'),
    createPaymentIntent: (data) => api.post('/payments/create-payment-intent/', data),
    confirmPayment: (data) => api.post('/payments/confirm-payment/', data)
};

// 전역 API 객체로 내보내기
window.API = {
    products: productAPI,
    payments: paymentAPI
};
