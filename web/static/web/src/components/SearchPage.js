// 검색 페이지 컴포넌트
const SearchPage = () => {
    const { t } = window.useTranslation();
    const [searchQuery, setSearchQuery] = React.useState('');
    const [searchResults, setSearchResults] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);

    React.useEffect(() => {
        // URL에서 검색어 가져오기
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('q');
        if (query) {
            setSearchQuery(query);
            performSearch(query);
        }
    }, []);

    const performSearch = async (query) => {
        if (!query.trim()) return;
        
        setLoading(true);
        setHasSearched(true);
        
        try {
            const response = await fetch(`/api/products/?search=${encodeURIComponent(query)}`);
            if (!response.ok) {
                throw new Error(t('search.errors.request_failed'));
            }
            const data = await response.json();
            setSearchResults(data.results || data);
        } catch (error) {
            console.error(t('search.errors.search_failed'), error);
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        
        // URL 업데이트
        const newUrl = `/search/?q=${encodeURIComponent(searchQuery)}`;
        window.history.pushState({}, '', newUrl);
        
        performSearch(searchQuery);
    };

    const handleProductClick = (productId) => {
        if (window.Router) {
            window.Router.navigate(`/products/${productId}`);
        }
    };

    const renderProductCard = (product) => {
        return React.createElement('div', {
            key: product.id,
            className: 'search-result-item',
            onClick: () => handleProductClick(product.id)
        },
            React.createElement('div', { className: 'search-item-image' },
                React.createElement('img', {
                    src: product.main_image || '/static/web/img/glass.png',
                    alt: product.name,
                    onError: (e) => {
                        e.target.src = '/static/web/img/glass.png';
                    }
                })
            ),
            React.createElement('div', { className: 'search-item-info' },
                React.createElement('h3', { className: 'search-item-name' }, product.name),
                React.createElement('p', { className: 'search-item-brand' }, 
                    product.brand?.name || t('product.brand')
                ),
                React.createElement('div', { className: 'search-item-price' },
                    product.is_on_sale && product.sale_price
                        ? React.createElement('div', null,
                            React.createElement('span', { className: 'original-price' }, 
                                `₩${parseInt(product.price).toLocaleString()}`
                            ),
                            React.createElement('span', { className: 'sale-price' }, 
                                `₩${parseInt(product.sale_price).toLocaleString()}`
                            )
                        )
                        : React.createElement('span', { className: 'current-price' }, 
                            `₩${parseInt(product.current_price || product.price).toLocaleString()}`
                        )
                )
            )
        );
    };

    return React.createElement('div', { className: 'container' },
        React.createElement('div', { className: 'search-page' },
            React.createElement('div', { className: 'search-header' },
                React.createElement('h1', { className: 'page-title' }, t('search.product_search')),
                React.createElement('form', { 
                    className: 'search-form',
                    onSubmit: handleSearchSubmit
                },
                    React.createElement('div', { className: 'search-input-container' },
                        React.createElement('input', {
                            type: 'text',
                            className: 'search-input',
                            placeholder: t('search.placeholder'),
                            value: searchQuery,
                            onChange: (e) => setSearchQuery(e.target.value)
                        }),
                        React.createElement('button', {
                            type: 'submit',
                            className: 'search-button'
                        },
                            React.createElement('i', { className: 'fas fa-search' })
                        )
                    )
                )
            ),
            
            loading && React.createElement('div', { className: 'search-loading' },
                React.createElement('div', { className: 'loading-spinner' }),
                React.createElement('p', null, t('common.loading'))
            ),
            
            !loading && hasSearched && React.createElement('div', { className: 'search-results' },
                React.createElement('div', { className: 'search-results-header' },
                    React.createElement('h2', null, 
                        searchResults.length > 0 
                            ? t('search.showing_results', { query: searchQuery, count: searchResults.length })
                            : t('search.no_results_for', { query: searchQuery })
                    )
                ),
                
                searchResults.length > 0 
                    ? React.createElement('div', { className: 'search-results-grid' },
                        searchResults.map(renderProductCard)
                    )
                    : React.createElement('div', { className: 'no-results' },
                        React.createElement('div', { className: 'no-results-icon' },
                            React.createElement('i', { className: 'fas fa-search' })
                        ),
                        React.createElement('h3', null, t('search.no_results')),
                        React.createElement('p', null, t('search.search_suggestions')),
                        React.createElement('ul', { className: 'search-suggestions' },
                            React.createElement('li', null, t('search.search_tips.brand')),
                            React.createElement('li', null, t('search.search_tips.product_type')),
                            React.createElement('li', null, t('search.search_tips.check_spelling'))
                        )
                    )
            ),
            
            !hasSearched && React.createElement('div', { className: 'search-welcome' },
                React.createElement('div', { className: 'search-welcome-icon' },
                    React.createElement('i', { className: 'fas fa-search' })
                ),
                React.createElement('h2', null, '원하는 상품을 검색해보세요'),
                React.createElement('p', null, '브랜드, 상품명으로 쉽게 찾을 수 있습니다'),
                React.createElement('div', { className: 'popular-searches' },
                    React.createElement('h3', null, '인기 검색어'),
                    React.createElement('div', { className: 'search-tags' },
                        ['레이밴', '구찌', '선글라스', '안경', '톰포드'].map(tag =>
                            React.createElement('span', {
                                key: tag,
                                className: 'search-tag',
                                onClick: () => {
                                    setSearchQuery(tag);
                                    performSearch(tag);
                                }
                            }, tag)
                        )
                    )
                )
            )
        )
    );
};

// 전역으로 내보내기
window.Components = window.Components || {};
window.Components.SearchPage = SearchPage;
