// 장바구니 상태 관리 유틸리티
window.CartManager = {
    // 장바구니 데이터 가져오기
    getCart: function() {
        try {
            const cart = localStorage.getItem('cart');
            return cart ? JSON.parse(cart) : [];
        } catch (e) {
            console.error('장바구니 데이터 파싱 오류:', e);
            return [];
        }
    },

    // 장바구니 데이터 저장
    saveCart: function(cart) {
        try {
            localStorage.setItem('cart', JSON.stringify(cart));
            this.updateCartCount();
        } catch (e) {
            console.error('장바구니 데이터 저장 오류:', e);
        }
    },

    // 장바구니에 상품 추가
    addToCart: function(product, quantity = 1) {
        const cart = this.getCart();
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.discount_price || product.price,
                originalPrice: product.price,
                image: product.main_image || '/static/web/img/glass.png',
                quantity: quantity,
                brand: product.brand?.name || '브랜드'
            });
        }

        this.saveCart(cart);
        return cart;
    },

    // 장바구니에서 상품 제거
    removeFromCart: function(productId) {
        const cart = this.getCart();
        const updatedCart = cart.filter(item => item.id !== productId);
        this.saveCart(updatedCart);
        return updatedCart;
    },

    // 장바구니 수량 업데이트
    updateQuantity: function(productId, quantity) {
        const cart = this.getCart();
        const item = cart.find(item => item.id === productId);
        
        if (item) {
            if (quantity <= 0) {
                return this.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                this.saveCart(cart);
            }
        }
        return cart;
    },

    // 장바구니 전체 개수 계산
    getTotalCount: function() {
        const cart = this.getCart();
        return cart.reduce((total, item) => total + item.quantity, 0);
    },

    // 장바구니 총 금액 계산
    getTotalPrice: function() {
        const cart = this.getCart();
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    // 장바구니 카운트 UI 업데이트
    updateCartCount: function() {
        const count = this.getTotalCount();
        const cartIcon = document.querySelector('.cart-icon');
        
        if (cartIcon) {
            // 기존 카운트 제거
            const existingCount = cartIcon.querySelector('.cart-count');
            if (existingCount) {
                existingCount.remove();
            }

            // 새 카운트 추가 (0보다 클 때만)
            if (count > 0) {
                const countElement = document.createElement('span');
                countElement.className = 'cart-count';
                countElement.textContent = count;
                cartIcon.appendChild(countElement);
            }
        }
    },

    // 장바구니 비우기
    clearCart: function() {
        localStorage.removeItem('cart');
        this.updateCartCount();
    }
};

// 페이지 로드 시 카운트 업데이트
document.addEventListener('DOMContentLoaded', function() {
    if (window.CartManager) {
        window.CartManager.updateCartCount();
    }
});
