// Hero 섹션 컴포넌트
const Hero = () => {
    // i18n hook 사용 - Header/Footer와 동일한 방식
    const { t } = window.useTranslation ? window.useTranslation() : { t: window.t || ((key) => key) };

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
                    React.createElement('h1', null, t('hero.title')),
                    React.createElement('p', null, t('hero.subtitle')),
                    React.createElement('div', { className: 'hero-actions' },
                        React.createElement('button', { 
                            className: 'btn btn-primary btn-large',
                            onClick: handleShopNow
                        }, t('hero.shop_now')),
                        React.createElement('button', { 
                            className: 'btn btn-outline btn-large',
                            onClick: () => document.getElementById('featured-products')?.scrollIntoView({ behavior: 'smooth' })
                        }, t('hero.view_collection'))
                    )
                ),
                React.createElement('div', { className: 'hero-image' },
                    React.createElement('div', { className: 'floating-products' },
                        // 플로팅 상품 이미지들
                        React.createElement('div', { className: 'floating-product floating-1' },
                            React.createElement('img', {
                                src: '/static/web/img/main1.jpeg',
                                alt: t('hero.new_collection_alt')
                            })
                        ),
                        React.createElement('div', { className: 'floating-product floating-2' },
                            React.createElement('img', {
                                src: '/static/web/img/main2.jpeg',
                                alt: t('hero.premium_alt')
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
