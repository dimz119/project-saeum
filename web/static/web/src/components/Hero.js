// Hero 섹션 컴포넌트
const Hero = () => {
    const handleShopNow = () => {
        if (window.Router) {
            window.Router.navigate('/products');
        }
    };

    return React.createElement('section', { className: 'hero' },
        React.createElement('div', { className: 'hero-background' }),
        React.createElement('div', { className: 'container' },
            React.createElement('div', { className: 'hero-content' },
                React.createElement('div', { className: 'hero-text' },
                    React.createElement('h1', null, '프리미엄 라이프스타일'),
                    React.createElement('p', null, '감도 높은 디자인과 퀄리티를 경험하세요'),
                    React.createElement('div', { className: 'hero-actions' },
                        React.createElement('button', { 
                            className: 'btn btn-primary btn-large',
                            onClick: handleShopNow
                        }, '지금 쇼핑하기'),
                        React.createElement('button', { 
                            className: 'btn btn-outline btn-large',
                            onClick: () => document.getElementById('featured-products')?.scrollIntoView({ behavior: 'smooth' })
                        }, '컬렉션 보기')
                    )
                ),
                React.createElement('div', { className: 'hero-image' },
                    React.createElement('div', { className: 'floating-products' },
                        // 플로팅 상품 이미지들
                        React.createElement('div', { className: 'floating-product floating-1' },
                            React.createElement('img', {
                                src: 'https://via.placeholder.com/200x200/667eea/ffffff?text=New+Collection',
                                alt: 'New Collection'
                            })
                        ),
                        React.createElement('div', { className: 'floating-product floating-2' },
                            React.createElement('img', {
                                src: 'https://via.placeholder.com/150x150/764ba2/ffffff?text=Premium',
                                alt: 'Premium'
                            })
                        ),
                        React.createElement('div', { className: 'floating-product floating-3' },
                            React.createElement('img', {
                                src: 'https://via.placeholder.com/120x120/f093fb/ffffff?text=Sale',
                                alt: 'Sale'
                            })
                        )
                    )
                )
            )
        )
    );
};

// 전역으로 내보내기
window.Components = window.Components || {};
window.Components.Hero = Hero;
