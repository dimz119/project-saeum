const CelebrityLook = () => {
    const [celebrities, setCelebrities] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    // i18n 번역 함수 가져오기
    const { t } = window.useTranslation ? window.useTranslation() : { t: window.t || ((key) => key) };

    // Celebrity 데이터 로드
    React.useEffect(() => {
        const fetchCelebrities = async () => {
            try {
                console.log('Fetching celebrities from API...');
                const response = await fetch('/api/celebrities/');
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('Celebrities data received:', data);
                console.log('First celebrity data structure:', data.results?.[0] || data[0]);
                setCelebrities(data.results || data || []);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching celebrities:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchCelebrities();
    }, []);

    const handleImageError = (e) => {
        console.log('Image load error for URL:', e.target.src);
        console.log('Error event:', e);
        e.target.style.display = 'none';
        
        // 에러 정보를 부모 div에 표시
        const container = e.target.parentNode;
        if (container) {
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: #d32f2f;
                text-align: center;
                font-size: 0.9rem;
                padding: 1rem;
            `;
            errorDiv.innerHTML = `
                <div>이미지 로드 실패</div>
                <div style="font-size: 0.8rem; margin-top: 0.5rem; color: #666;">
                    URL: ${e.target.src.substring(0, 50)}...
                </div>
            `;
            container.appendChild(errorDiv);
        }
    };

    if (loading) {
        return React.createElement('div', {
            style: {
                padding: '3rem',
                textAlign: 'center'
            }
        }, 
            React.createElement('h1', null, `🌟 ${t('celebrity.page_title')}`),
            React.createElement('div', {
                style: {
                    margin: '2rem 0',
                    fontSize: '1.2rem'
                }
            }, t('common.loading') || '로딩 중...')
        );
    }

    if (error) {
        return React.createElement('div', {
            style: {
                padding: '3rem',
                textAlign: 'center'
            }
        }, 
            React.createElement('h1', null, `🌟 ${t('celebrity.page_title')}`),
            React.createElement('div', {
                style: {
                    margin: '2rem 0',
                    fontSize: '1.2rem',
                    color: '#d32f2f'
                }
            }, t('celebrity.error_loading'))
        );
    }

    if (!celebrities || celebrities.length === 0) {
        return React.createElement('div', {
            style: {
                padding: '3rem',
                textAlign: 'center'
            }
        }, 
            React.createElement('h1', null, `🌟 ${t('celebrity.page_title')}`),
            React.createElement('div', {
                style: {
                    margin: '2rem 0',
                    fontSize: '1.2rem',
                    color: '#666'
                }
            }, t('celebrity.no_celebrities'))
        );
    }

    return React.createElement('div', {
        style: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '2rem'
        }
    }, [
        // 페이지 제목
        React.createElement('div', {
            key: 'header',
            style: {
                textAlign: 'center',
                marginBottom: '3rem'
            }
        }, [
            React.createElement('h1', {
                key: 'title',
                style: {
                    fontSize: '2.5rem',
                    marginBottom: '1rem',
                    color: '#333'
                }
            }, `🌟 ${t('celebrity.page_title')}`),
            React.createElement('p', {
                key: 'subtitle',
                style: {
                    fontSize: '1.1rem',
                    color: '#666',
                    marginBottom: '0'
                }
            }, t('celebrity.page_description'))
        ]),

        // Celebrity 그리드
        React.createElement('div', {
            key: 'grid',
            style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem',
                padding: '1rem 0'
            }
        }, celebrities.map((celebrity, index) => 
            React.createElement('div', {
                key: `celebrity-${celebrity.id || index}`,
                style: {
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    cursor: 'pointer'
                },
                onMouseEnter: (e) => {
                    e.target.style.transform = 'translateY(-5px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                },
                onMouseLeave: (e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                }
            }, [
                // Celebrity 이미지
                celebrity.image_url ? React.createElement('div', {
                    key: 'image-container',
                    style: {
                        width: '100%',
                        height: '400px',
                        overflow: 'hidden',
                        position: 'relative'
                    }
                }, [
                    React.createElement('img', {
                        key: 'image',
                        src: celebrity.image_url,
                        alt: celebrity.name || 'Celebrity Look',
                        onError: handleImageError,
                        style: {
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease'
                        },
                        onMouseEnter: (e) => {
                            e.target.style.transform = 'scale(1.05)';
                        },
                        onMouseLeave: (e) => {
                            e.target.style.transform = 'scale(1)';
                        }
                    })
                ]) : React.createElement('div', {
                    key: 'no-image',
                    style: {
                        width: '100%',
                        height: '400px',
                        backgroundColor: '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#999',
                        fontSize: '1.2rem'
                    }
                }, '이미지 없음'),

                // Celebrity 정보
                React.createElement('div', {
                    key: 'info',
                    style: {
                        padding: '1.5rem'
                    }
                }, [
                    celebrity.name && React.createElement('h3', {
                        key: 'name',
                        style: {
                            fontSize: '1.3rem',
                            fontWeight: 'bold',
                            marginBottom: '0.5rem',
                            color: '#333'
                        }
                    }, celebrity.name),
                    
                    celebrity.description && React.createElement('p', {
                        key: 'description',
                        style: {
                            fontSize: '0.95rem',
                            color: '#666',
                            lineHeight: '1.5',
                            marginBottom: '1rem'
                        }
                    }, celebrity.description),

                    React.createElement('div', {
                        key: 'meta',
                        style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '0.85rem',
                            color: '#999'
                        }
                    }, [
                        React.createElement('span', {
                            key: 'order'
                        }, `#${celebrity.order || index + 1}`),
                        
                        celebrity.created_at && React.createElement('span', {
                            key: 'date'
                        }, new Date(celebrity.created_at).toLocaleDateString('ko-KR'))
                    ])
                ])
            ])
        ))
    ]);
};

// 전역으로 내보내기
window.Components = window.Components || {};
window.Components.CelebrityLook = CelebrityLook;
