const ProfilePage = () => {
    // Translation hook with fallback
    const { t } = window.useTranslation ? window.useTranslation() : { t: window.t || ((key) => key) };
    const [user, setUser] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [editing, setEditing] = React.useState(false);
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [success, setSuccess] = React.useState(false);
    
    const [formData, setFormData] = React.useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        date_of_birth: '',
        shipping_address: '',
        shipping_zipcode: '',
        shipping_phone: ''
    });

    React.useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                setError(t('auth.login_required'));
                setLoading(false);
                return;
            }

            const response = await fetch('/api/auth/profile/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
                setFormData({
                    first_name: userData.first_name || '',
                    last_name: userData.last_name || '',
                    email: userData.email || '',
                    phone_number: userData.phone_number || '',
                    date_of_birth: userData.date_of_birth || '',
                    shipping_address: userData.shipping_address || '',
                    shipping_zipcode: userData.shipping_zipcode || '',
                    shipping_phone: userData.shipping_phone || ''
                });
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
                        fetchUserProfile();
                        return;
                    }
                }
                setError(t('auth.login_required'));
            } else {
                setError(t('profile.load_error'));
            }
        } catch (error) {
            console.error('Profile loading error:', error);
            setError(t('profile.error'));
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field) => (e) => {
        setFormData(prev => ({
            ...prev,
            [field]: e.target.value
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setSuccess(false);

        try {
            // 생년월일이 비어있으면 기본값으로 1990-01-01 설정 (성인 나이 기준)
            const dataToSend = { ...formData };
            if (!dataToSend.date_of_birth || dataToSend.date_of_birth.trim() === '') {
                dataToSend.date_of_birth = '1990-01-01'; // 기본값: 1990년 1월 1일
            }

            const token = localStorage.getItem('access_token');
            const response = await fetch('/api/auth/profile/', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend)
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setUser(updatedUser);
                // formData도 업데이트된 데이터로 동기화
                setFormData({
                    first_name: updatedUser.first_name || '',
                    last_name: updatedUser.last_name || '',
                    email: updatedUser.email || '',
                    phone_number: updatedUser.phone_number || '',
                    date_of_birth: updatedUser.date_of_birth || '',
                    shipping_address: updatedUser.shipping_address || '',
                    shipping_zipcode: updatedUser.shipping_zipcode || '',
                    shipping_phone: updatedUser.shipping_phone || ''
                });
                setEditing(false);
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            } else {
                const errorData = await response.json();
                setError(errorData.message || t('profile.save_error'));
            }
        } catch (error) {
            console.error('Profile save error:', error);
            setError(t('profile.save_error'));
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            email: user.email || '',
            phone_number: user.phone_number || '',
            date_of_birth: user.date_of_birth || '',
            shipping_address: user.shipping_address || '',
            shipping_zipcode: user.shipping_zipcode || '',
            shipping_phone: user.shipping_phone || ''
        });
        setEditing(false);
        setError(null);
    };

    if (loading) {
        return React.createElement('div', {
            className: 'container',
            style: { padding: '2rem', textAlign: 'center' }
        },
            React.createElement('h2', null, t('profile.loading')),
            React.createElement('p', null, t('profile.loading_wait'))
        );
    }

    if (error) {
        return React.createElement('div', {
            className: 'container',
            style: { padding: '2rem', textAlign: 'center' }
        },
            React.createElement('h2', null, t('profile.error_title')),
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

    return React.createElement('div', {
        className: 'container',
        style: { padding: '2rem', maxWidth: '800px' }
    },
        React.createElement('h1', {
            style: { marginBottom: '2rem', color: '#2c3e50' }
        }, t('profile.title')),

        // Success message
        success && React.createElement('div', {
            style: {
                padding: '1rem',
                backgroundColor: '#d4edda',
                color: '#155724',
                border: '1px solid #c3e6cb',
                borderRadius: '4px',
                marginBottom: '1rem'
            }
        }, t('profile.save_success')),

        // Error message
        error && React.createElement('div', {
            style: {
                padding: '1rem',
                backgroundColor: '#f8d7da',
                color: '#721c24',
                border: '1px solid #f5c6cb',
                borderRadius: '4px',
                marginBottom: '1rem'
            }
        }, error),

        // Profile form
        React.createElement('div', {
            style: {
                backgroundColor: '#fff',
                padding: '2rem',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                border: '1px solid #ddd'
            }
        },
            // Actions
            React.createElement('div', {
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem',
                    paddingBottom: '1rem',
                    borderBottom: '1px solid #eee'
                }
            },
                React.createElement('h3', {
                    style: { margin: 0, color: '#2c3e50' }
                }, t('profile.personal_info')),
                !editing ? 
                    React.createElement('button', {
                        className: 'btn btn-primary',
                        onClick: () => setEditing(true)
                    }, t('profile.edit')) :
                    React.createElement('div', null,
                        React.createElement('button', {
                            className: 'btn btn-success',
                            onClick: handleSave,
                            disabled: saving,
                            style: { marginRight: '0.5rem' }
                        }, saving ? t('profile.saving') : t('profile.save')),
                        React.createElement('button', {
                            className: 'btn btn-secondary',
                            onClick: handleCancel,
                            disabled: saving
                        }, t('profile.cancel'))
                    )
            ),

            // Personal Information Section
            React.createElement('div', {
                style: { marginBottom: '2rem' }
            },
                React.createElement('div', {
                    style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }
                },
                    React.createElement('div', null,
                        React.createElement('label', {
                            style: { display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }
                        }, t('auth.first_name')),
                        editing ? 
                            React.createElement('input', {
                                type: 'text',
                                value: formData.first_name,
                                onChange: handleInputChange('first_name'),
                                style: {
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px'
                                }
                            }) :
                            React.createElement('p', {
                                style: { margin: 0, padding: '0.5rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }
                            }, formData.first_name || t('profile.not_set'))
                    ),
                    React.createElement('div', null,
                        React.createElement('label', {
                            style: { display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }
                        }, t('auth.last_name')),
                        editing ? 
                            React.createElement('input', {
                                type: 'text',
                                value: formData.last_name,
                                onChange: handleInputChange('last_name'),
                                style: {
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px'
                                }
                            }) :
                            React.createElement('p', {
                                style: { margin: 0, padding: '0.5rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }
                            }, formData.last_name || t('profile.not_set'))
                    )
                ),
                React.createElement('div', {
                    style: { marginBottom: '1rem' }
                },
                    React.createElement('label', {
                        style: { display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }
                    }, t('auth.email')),
                    React.createElement('p', {
                        style: { margin: 0, padding: '0.5rem', backgroundColor: '#f8f9fa', borderRadius: '4px', color: '#6c757d' }
                    }, formData.email, ' ', React.createElement('small', null, `(${t('profile.email_readonly')})`))
                ),
                React.createElement('div', {
                    style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }
                },
                    React.createElement('div', null,
                        React.createElement('label', {
                            style: { display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }
                        }, t('auth.phone_number')),
                        editing ? 
                            React.createElement('input', {
                                type: 'tel',
                                value: formData.phone_number,
                                onChange: handleInputChange('phone_number'),
                                style: {
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px'
                                }
                            }) :
                            React.createElement('p', {
                                style: { margin: 0, padding: '0.5rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }
                            }, formData.phone_number || t('profile.not_set'))
                    ),
                    React.createElement('div', null,
                        React.createElement('label', {
                            style: { display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }
                        }, t('auth.date_of_birth')),
                        editing ? 
                            React.createElement('input', {
                                type: 'date',
                                value: formData.date_of_birth,
                                onChange: handleInputChange('date_of_birth'),
                                placeholder: '1990-01-01',
                                style: {
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px'
                                }
                            }) :
                            React.createElement('p', {
                                style: { margin: 0, padding: '0.5rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }
                            }, formData.date_of_birth || t('profile.not_set'))
                    )
                )
            ),

            // Shipping Information Section
            React.createElement('div', {
                style: { borderTop: '1px solid #eee', paddingTop: '2rem' }
            },
                React.createElement('h3', {
                    style: { marginBottom: '1rem', color: '#2c3e50' }
                }, t('profile.shipping_info')),
                React.createElement('div', {
                    style: { marginBottom: '1rem' }
                },
                    React.createElement('label', {
                        style: { display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }
                    }, t('profile.shipping_address')),
                    editing ? 
                        React.createElement('textarea', {
                            value: formData.shipping_address,
                            onChange: handleInputChange('shipping_address'),
                            rows: 3,
                            style: {
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                resize: 'vertical'
                            }
                        }) :
                        React.createElement('p', {
                            style: { margin: 0, padding: '0.5rem', backgroundColor: '#f8f9fa', borderRadius: '4px', minHeight: '2.5rem' }
                        }, formData.shipping_address || t('profile.not_set'))
                ),
                React.createElement('div', {
                    style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }
                },
                    React.createElement('div', null,
                        React.createElement('label', {
                            style: { display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }
                        }, t('profile.shipping_zipcode')),
                        editing ? 
                            React.createElement('input', {
                                type: 'text',
                                value: formData.shipping_zipcode,
                                onChange: handleInputChange('shipping_zipcode'),
                                style: {
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px'
                                }
                            }) :
                            React.createElement('p', {
                                style: { margin: 0, padding: '0.5rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }
                            }, formData.shipping_zipcode || t('profile.not_set'))
                    ),
                    React.createElement('div', null,
                        React.createElement('label', {
                            style: { display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }
                        }, t('profile.shipping_phone')),
                        editing ? 
                            React.createElement('input', {
                                type: 'tel',
                                value: formData.shipping_phone,
                                onChange: handleInputChange('shipping_phone'),
                                style: {
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px'
                                }
                            }) :
                            React.createElement('p', {
                                style: { margin: 0, padding: '0.5rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }
                            }, formData.shipping_phone || t('profile.not_set'))
                    )
                )
            )
        )
    );
};

// 전역으로 내보내기
window.Components = window.Components || {};
window.Components.ProfilePage = ProfilePage;
