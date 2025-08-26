// Header 컴포넌트
const Header = () => {
    const handleNavigation = (path, e) => {
        e.preventDefault();
        if (window.Router) {
            window.Router.navigate(path);
        } else {
            window.location.href = path;
        }
    };

    return React.createElement('div', null,
        React.createElement('div', { className: 'header-top' },
            '🎉 8월 스페셜 혜택 - 전 상품 무료배송! 🚚'
        ),
        React.createElement('header', { className: 'header' },
            React.createElement('div', { className: 'container' },
                React.createElement('nav', { className: 'navbar' },
                    React.createElement('a', { 
                        href: '/', 
                        className: 'logo',
                        onClick: (e) => handleNavigation('/', e)
                    }, 'SAEUM'),
                    React.createElement('ul', { className: 'nav-menu' },
                        React.createElement('li', null,
                            React.createElement('a', { 
                                href: '/products',
                                onClick: (e) => handleNavigation('/products', e)
                            }, '추천상품')
                        ),
                        React.createElement('li', null,
                            React.createElement('a', { 
                                href: '/products',
                                onClick: (e) => handleNavigation('/products', e)
                            }, '브랜드')
                        ),
                        React.createElement('li', null,
                            React.createElement('a', { 
                                href: '/products',
                                onClick: (e) => handleNavigation('/products', e)
                            }, '신상품')
                        ),
                        React.createElement('li', null,
                            React.createElement('a', { 
                                href: '/products',
                                onClick: (e) => handleNavigation('/products', e)
                            }, '세일')
                        )
                    ),
                    React.createElement('div', { className: 'nav-icons' },
                        React.createElement('i', { className: 'fas fa-search' }),
                        React.createElement('i', { className: 'fas fa-user' }),
                        React.createElement('i', { className: 'fas fa-heart' }),
                        React.createElement('i', { className: 'fas fa-shopping-bag' })
                    )
                )
            )
        )
    );
};

// 전역으로 내보내기
window.Components = window.Components || {};
window.Components.Header = Header;
