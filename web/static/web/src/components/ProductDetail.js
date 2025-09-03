// 상품 상세 페이지 컴포넌트
const ProductDetail = ({ productId }) => {
    const [product, setProduct] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [selectedImage, setSelectedImage] = React.useState(0);
    const [quantity, setQuantity] = React.useState(1);
    const [reviews, setReviews] = React.useState([]);
    const [newComment, setNewComment] = React.useState('');
    const [newRating, setNewRating] = React.useState(5);
    const [modelPhotos, setModelPhotos] = React.useState([]);

    React.useEffect(() => {
        fetchProduct();
        fetchReviews();
        fetchModelPhotos();
    }, [productId]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/products/${productId}/`);
            if (!response.ok) {
                throw new Error('상품을 찾을 수 없습니다.');
            }
            const data = await response.json();
            setProduct(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            // 임시 샘플 리뷰 데이터 (실제로는 API에서 가져오기)
            const sampleReviews = [
                {
                    id: 1,
                    user: '김철수',
                    rating: 5,
                    comment: '정말 마음에 드는 상품입니다. 품질도 좋고 디자인도 예뻐요!',
                    date: '2025-09-01'
                },
                {
                    id: 2,
                    user: '이영희',
                    rating: 4,
                    comment: '배송도 빠르고 상품도 사진과 동일해요. 추천합니다.',
                    date: '2025-08-30'
                },
                {
                    id: 3,
                    user: '박민수',
                    rating: 5,
                    comment: '가격 대비 정말 만족스러운 구매였습니다.',
                    date: '2025-08-28'
                }
            ];
            setReviews(sampleReviews);
        } catch (err) {
            console.error('리뷰 로딩 실패:', err);
        }
    };

    const fetchModelPhotos = async () => {
        try {
            // 임시 샘플 모델 사진 데이터 (실제로는 API에서 가져오기)
            const sampleModelPhotos = [
                {
                    id: 1,
                    image: '/static/web/img/model.jpg',
                    alt: '모델 착용 사진 1',
                    caption: '일상 스타일링 - 편안하고 자연스러운 룩'
                },
                {
                    id: 2,
                    image: '/static/web/img/model.jpg',
                    alt: '모델 착용 사진 2',
                    caption: '비즈니스 룩 - 세련되고 전문적인 이미지'
                },
                {
                    id: 3,
                    image: '/static/web/img/model.jpg',
                    alt: '모델 착용 사진 3',
                    caption: '캐주얼 스타일 - 여유롭고 편안한 분위기'
                }
            ];
            setModelPhotos(sampleModelPhotos);
        } catch (err) {
            console.error('모델 사진 로딩 실패:', err);
        }
    };

    const handleAddToCart = () => {
        if (window.CartManager && product) {
            window.CartManager.addToCart(product, quantity);
            alert(`${product.name} ${quantity}개가 장바구니에 추가되었습니다.`);
            
            // 수량을 1로 리셋
            setQuantity(1);
        } else {
            alert('장바구니 기능을 사용할 수 없습니다.');
        }
    };

    const handleBuyNow = () => {
        // 바로 구매 로직
        alert(`${product.name} ${quantity}개 주문하기`);
    };

    const handleSubmitReview = (e) => {
        e.preventDefault();
        if (newComment.trim()) {
            const newReview = {
                id: reviews.length + 1,
                user: '새 사용자', // 실제로는 로그인한 사용자 정보
                rating: newRating,
                comment: newComment.trim(),
                date: new Date().toISOString().split('T')[0]
            };
            setReviews([newReview, ...reviews]);
            setNewComment('');
            setNewRating(5);
            alert('리뷰가 추가되었습니다!');
        }
    };

    if (loading) {
        return React.createElement('div', { className: 'loading-container' },
            React.createElement('div', { className: 'loading' }, '상품 정보를 불러오는 중...')
        );
    }

    if (error) {
        return React.createElement('div', { className: 'error-container' },
            React.createElement('div', { className: 'error' }, error),
            React.createElement('button', { 
                className: 'btn btn-primary',
                onClick: () => window.history.back()
            }, '돌아가기')
        );
    }

    if (!product) {
        return React.createElement('div', { className: 'error-container' },
            React.createElement('div', { className: 'error' }, '상품을 찾을 수 없습니다.')
        );
    }

    // 이미지 처리 함수 - 항상 4개 이미지 제공
    const getProductImages = () => {
        const baseImages = [];
        
        // 1. 실제 상품 이미지들 추가
        if (product.images && product.images.length > 0) {
            baseImages.push(...product.images);
        } else if (product.main_image) {
            baseImages.push({ image: product.main_image });
        }
        
        // 2. 부족한 이미지를 glass.png로 채우기 (총 4개가 되도록)
        while (baseImages.length < 4) {
            baseImages.push({ image: '/static/web/img/glass.png' });
        }
        
        // 3. 4개만 선택 (혹시 더 많은 이미지가 있다면)
        return baseImages.slice(0, 4);
    };

    const images = getProductImages();

    return React.createElement('div', { className: 'product-detail' },
        // Breadcrumb
        React.createElement('div', { className: 'container' },
            React.createElement('nav', { className: 'breadcrumb' },
                React.createElement('a', { href: '#', onClick: (e) => { e.preventDefault(); window.Router.navigate('/'); } }, '홈'),
                React.createElement('span', null, ' > '),
                React.createElement('a', { href: '#', onClick: (e) => { e.preventDefault(); window.Router.navigate('/products'); } }, '상품'),
                React.createElement('span', null, ' > '),
                React.createElement('span', null, product.name)
            )
        ),

        // Product Detail Container
        React.createElement('div', { className: 'container' },
            React.createElement('div', { className: 'product-detail-container' },
                // Product Images
                React.createElement('div', { className: 'product-images' },
                    React.createElement('div', { className: 'main-image' },
                        React.createElement('img', {
                            src: images[selectedImage]?.image || images[0]?.image,
                            alt: product.name,
                            className: 'main-product-image'
                        })
                    ),
                    images.length > 1 && React.createElement('div', { className: 'thumbnail-images' },
                        images.map((img, index) =>
                            React.createElement('img', {
                                key: index,
                                src: img.image,
                                alt: `${product.name} ${index + 1}`,
                                className: `thumbnail ${selectedImage === index ? 'active' : ''}`,
                                onClick: () => setSelectedImage(index)
                            })
                        )
                    )
                ),

                // Product Info
                React.createElement('div', { className: 'product-info-detail' },
                    React.createElement('div', { className: 'product-brand' }, product.brand?.name || '브랜드'),
                    React.createElement('h1', { className: 'product-title' }, product.name),
                    
                    // Rating
                    React.createElement('div', { className: 'product-rating' },
                        React.createElement('div', { className: 'stars' },
                            Array.from({ length: 5 }, (_, i) =>
                                React.createElement('span', {
                                    key: i,
                                    className: `star ${i < Math.floor(product.average_rating || 0) ? '' : 'empty'}`
                                }, '★')
                            )
                        ),
                        React.createElement('span', { className: 'rating-count' }, 
                            `(${product.review_count || 0}개 리뷰)`
                        )
                    ),

                    // Price
                    React.createElement('div', { className: 'product-price-detail' },
                        product.discount_price && product.discount_price < product.price && 
                        React.createElement('span', { className: 'original-price' }, 
                            `₩${product.price.toLocaleString()}`
                        ),
                        React.createElement('span', { className: 'current-price' }, 
                            `₩${(product.discount_price || product.price).toLocaleString()}`
                        ),
                        product.discount_price && product.discount_price < product.price &&
                        React.createElement('span', { className: 'discount-rate' },
                            `${Math.round((1 - product.discount_price / product.price) * 100)}% 할인`
                        )
                    ),

                    // Description
                    React.createElement('div', { className: 'product-description' },
                        React.createElement('h3', null, '상품 설명'),
                        React.createElement('p', null, product.description || '상품 설명이 없습니다.')
                    ),

                    // Quantity Selector
                    React.createElement('div', { className: 'quantity-selector' },
                        React.createElement('label', null, '수량:'),
                        React.createElement('div', { className: 'quantity-controls' },
                            React.createElement('button', {
                                type: 'button',
                                onClick: () => setQuantity(Math.max(1, quantity - 1)),
                                disabled: quantity <= 1
                            }, '-'),
                            React.createElement('span', { className: 'quantity' }, quantity),
                            React.createElement('button', {
                                type: 'button',
                                onClick: () => setQuantity(quantity + 1)
                            }, '+')
                        )
                    ),

                    // Action Buttons
                    React.createElement('div', { className: 'product-actions-detail' },
                        React.createElement('button', {
                            className: 'btn btn-outline btn-large',
                            onClick: handleAddToCart
                        }, '장바구니 담기'),
                        React.createElement('button', {
                            className: 'btn btn-primary btn-large',
                            onClick: handleBuyNow
                        }, '바로 구매')
                    )
                )
            ),

            // Model Photos Section
            React.createElement('div', { className: 'model-photos-section' },
                React.createElement('h2', { className: 'model-photos-title' }, '착용 사진'),
                React.createElement('p', { className: 'model-photos-subtitle' }, '다양한 스타일링을 확인해보세요 (스크롤하여 더 많은 사진 보기)'),
                React.createElement('div', { className: 'model-photos-grid' },
                    modelPhotos.map(photo =>
                        React.createElement('div', { key: photo.id, className: 'model-photo-item' },
                            React.createElement('div', { className: 'model-photo-wrapper' },
                                React.createElement('img', {
                                    src: photo.image,
                                    alt: photo.alt,
                                    className: 'model-photo',
                                    onError: (e) => {
                                        e.target.src = '/static/web/img/model.jpg';
                                    }
                                })
                            ),
                            React.createElement('p', { className: 'model-photo-caption' }, photo.caption)
                        )
                    )
                )
            ),

            // Reviews Section
            React.createElement('div', { className: 'reviews-section' },
                React.createElement('h2', { className: 'reviews-title' }, '상품 리뷰'),
                
                // Review Form
                React.createElement('div', { className: 'review-form' },
                    React.createElement('h3', null, '리뷰 작성'),
                    React.createElement('form', { onSubmit: handleSubmitReview },
                        React.createElement('div', { className: 'rating-input' },
                            React.createElement('label', null, '평점: '),
                            React.createElement('select', {
                                value: newRating,
                                onChange: (e) => setNewRating(parseInt(e.target.value)),
                                className: 'rating-select'
                            },
                                React.createElement('option', { value: 5 }, '★★★★★ (5점)'),
                                React.createElement('option', { value: 4 }, '★★★★☆ (4점)'),
                                React.createElement('option', { value: 3 }, '★★★☆☆ (3점)'),
                                React.createElement('option', { value: 2 }, '★★☆☆☆ (2점)'),
                                React.createElement('option', { value: 1 }, '★☆☆☆☆ (1점)')
                            )
                        ),
                        React.createElement('div', { className: 'comment-input' },
                            React.createElement('textarea', {
                                value: newComment,
                                onChange: (e) => setNewComment(e.target.value),
                                placeholder: '상품에 대한 리뷰를 작성해주세요...',
                                className: 'comment-textarea',
                                rows: 4
                            })
                        ),
                        React.createElement('button', {
                            type: 'submit',
                            className: 'btn btn-primary',
                            disabled: !newComment.trim()
                        }, '리뷰 등록')
                    )
                ),

                // Reviews List
                React.createElement('div', { className: 'reviews-list' },
                    React.createElement('h3', null, `리뷰 (${reviews.length}개)`),
                    reviews.length === 0 ? 
                        React.createElement('p', { className: 'no-reviews' }, '아직 리뷰가 없습니다. 첫 번째 리뷰를 작성해보세요!') :
                        reviews.map(review =>
                            React.createElement('div', { key: review.id, className: 'review-item' },
                                React.createElement('div', { className: 'review-header' },
                                    React.createElement('div', { className: 'review-user' },
                                        React.createElement('strong', null, review.user),
                                        React.createElement('span', { className: 'review-date' }, review.date)
                                    ),
                                    React.createElement('div', { className: 'review-rating' },
                                        Array.from({ length: 5 }, (_, i) =>
                                            React.createElement('span', {
                                                key: i,
                                                className: `star ${i < review.rating ? 'filled' : 'empty'}`
                                            }, '★')
                                        )
                                    )
                                ),
                                React.createElement('div', { className: 'review-content' },
                                    React.createElement('p', null, review.comment)
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
window.Components.ProductDetail = ProductDetail;
