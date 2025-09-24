const ProfilePage = () => {
    // Translation hook with fallback
    const { t } = window.useTranslation ? window.useTranslation() : { t: window.t || ((key) => key) };
    const [user, setUser] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [editing, setEditing] = React.useState(false);
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [success, setSuccess] = React.useState(false);
    
    // Eye exam 관련 상태
    const [eyeExamUploading, setEyeExamUploading] = React.useState(false);
    const [selectedFile, setSelectedFile] = React.useState(null);
    
    const [formData, setFormData] = React.useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        date_of_birth: '',
        shipping_address: '',
        shipping_zipcode: '',
        shipping_phone: '',
        shipping_country: '',
        shipping_city: ''
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
                    shipping_phone: userData.shipping_phone || '',
                    shipping_country: userData.shipping_country || '',
                    shipping_city: userData.shipping_city || ''
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
                    shipping_phone: updatedUser.shipping_phone || '',
                    shipping_country: updatedUser.shipping_country || '',
                    shipping_city: updatedUser.shipping_city || ''
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
            shipping_phone: user.shipping_phone || '',
            shipping_country: user.shipping_country || '',
            shipping_city: user.shipping_city || ''
        });
        setEditing(false);
        setError(null);
    };

    // Eye exam 파일 선택 처리
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // 파일 크기 검증 (5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError(t('profile.eye_exam_file_size_error'));
                return;
            }
            
            // 파일 확장자 검증
            const allowedTypes = ['pdf', 'jpg', 'jpeg', 'png', 'gif'];
            const fileExtension = file.name.split('.').pop().toLowerCase();
            if (!allowedTypes.includes(fileExtension)) {
                setError(t('profile.eye_exam_file_type_error'));
                return;
            }
            
            setSelectedFile(file);
            setError(null);
        }
    };

    // Eye exam 파일 업로드
    const handleEyeExamUpload = async () => {
        if (!selectedFile) {
            setError(t('profile.eye_exam_select_file'));
            return;
        }

        setEyeExamUploading(true);
        setError(null);

        const uploadFile = async (token) => {
            const formData = new FormData();
            formData.append('eye_exam_file', selectedFile);

            const response = await fetch('/api/auth/upload-eye-exam/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData
            });

            return response;
        };

        try {
            const token = localStorage.getItem('access_token');
            let response = await uploadFile(token);

            // 401 에러 시 토큰 갱신 시도
            if (response.status === 401) {
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
                        // 새 토큰으로 다시 시도
                        response = await uploadFile(refreshData.access);
                    } else {
                        setError(t('auth.login_required'));
                        setEyeExamUploading(false);
                        return;
                    }
                } else {
                    setError(t('auth.login_required'));
                    setEyeExamUploading(false);
                    return;
                }
            }

            if (response.ok) {
                const result = await response.json();
                setUser(result.user);
                setSelectedFile(null);
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
                
                // 파일 입력 필드 초기화
                const fileInput = document.getElementById('eye-exam-file-input');
                if (fileInput) fileInput.value = '';
                
            } else {
                const errorData = await response.json();
                setError(errorData.error || t('profile.eye_exam_upload_error'));
            }
        } catch (error) {
            console.error('Eye exam upload error:', error);
            setError(t('profile.eye_exam_upload_error'));
        } finally {
            setEyeExamUploading(false);
        }
    };

    // Eye exam 파일 삭제
    const handleEyeExamDelete = async () => {
        if (!window.confirm(t('profile.delete_eye_exam') + '?')) {
            return;
        }

        setEyeExamUploading(true);
        setError(null);

        const deleteFile = async (token) => {
            const response = await fetch('/api/auth/delete-eye-exam/', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            return response;
        };

        try {
            const token = localStorage.getItem('access_token');
            let response = await deleteFile(token);

            // 401 에러 시 토큰 갱신 시도
            if (response.status === 401) {
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
                        // 새 토큰으로 다시 시도
                        response = await deleteFile(refreshData.access);
                    } else {
                        setError(t('auth.login_required'));
                        setEyeExamUploading(false);
                        return;
                    }
                } else {
                    setError(t('auth.login_required'));
                    setEyeExamUploading(false);
                    return;
                }
            }

            if (response.ok) {
                const result = await response.json();
                setUser(result.user);
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            } else {
                const errorData = await response.json();
                setError(errorData.error || t('profile.eye_exam_delete_error'));
            }
        } catch (error) {
            console.error('Eye exam delete error:', error);
            setError(t('profile.eye_exam_delete_error'));
        } finally {
            setEyeExamUploading(false);
        }
    };

    // Eye exam 파일 다운로드
    const handleEyeExamDownload = async () => {
        setEyeExamUploading(true);
        setError(null);

        const getDownloadUrl = async (token) => {
            const response = await fetch('/api/auth/download-eye-exam/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
            return response;
        };

        try {
            const token = localStorage.getItem('access_token');
            let response = await getDownloadUrl(token);

            // 401 에러 시 토큰 갱신 시도
            if (response.status === 401) {
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
                        // 새 토큰으로 다시 시도
                        response = await getDownloadUrl(refreshData.access);
                    } else {
                        setError(t('auth.login_required'));
                        setEyeExamUploading(false);
                        return;
                    }
                } else {
                    setError(t('auth.login_required'));
                    setEyeExamUploading(false);
                    return;
                }
            }

            if (response.ok) {
                const result = await response.json();
                
                // 새 창에서 파일 다운로드
                const link = document.createElement('a');
                link.href = result.download_url;
                link.download = result.filename || 'eye_exam_file';
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
            } else {
                const errorData = await response.json();
                setError(errorData.error || t('profile.eye_exam_download_error'));
            }
        } catch (error) {
            console.error('Eye exam download error:', error);
            setError(t('profile.eye_exam_download_error'));
        } finally {
            setEyeExamUploading(false);
        }
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
                    ),
                    React.createElement('div', null,
                        React.createElement('label', {
                            style: { display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }
                        }, t('profile.shipping_country')),
                        editing ? 
                            React.createElement('input', {
                                type: 'text',
                                value: formData.shipping_country,
                                onChange: handleInputChange('shipping_country'),
                                placeholder: t('profile.shipping_country_placeholder'),
                                style: {
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px'
                                }
                            }) :
                            React.createElement('p', {
                                style: { margin: 0, padding: '0.5rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }
                            }, formData.shipping_country || t('profile.not_set'))
                    ),
                    React.createElement('div', null,
                        React.createElement('label', {
                            style: { display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }
                        }, t('profile.shipping_city')),
                        editing ? 
                            React.createElement('input', {
                                type: 'text',
                                value: formData.shipping_city,
                                onChange: handleInputChange('shipping_city'),
                                placeholder: t('profile.shipping_city_placeholder'),
                                style: {
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px'
                                }
                            }) :
                            React.createElement('p', {
                                style: { margin: 0, padding: '0.5rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }
                            }, formData.shipping_city || t('profile.not_set'))
                    )
                )
            ),
            
            // Eye Exam 정보 섹션
            React.createElement('div', {
                style: { borderTop: '1px solid #eee', paddingTop: '2rem' }
            },
                React.createElement('h3', {
                    style: { marginBottom: '1rem', color: '#2c3e50' }
                }, t('profile.eye_exam_info')),
                
                // Eye exam 상태 표시
                React.createElement('div', {
                    style: { marginBottom: '1rem' }
                },
                    React.createElement('label', {
                        style: { display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }
                    }, t('profile.eye_exam_status')),
                    React.createElement('div', {
                        style: { 
                            padding: '0.75rem',
                            backgroundColor: user.has_eye_exam ? '#d4edda' : '#f8d7da',
                            border: `1px solid ${user.has_eye_exam ? '#c3e6cb' : '#f5c6cb'}`,
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }
                    },
                        React.createElement('span', {
                            style: {
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: user.has_eye_exam ? '#28a745' : '#dc3545'
                            }
                        }),
                        React.createElement('span', {
                            style: { 
                                fontWeight: 'bold',
                                color: user.has_eye_exam ? '#155724' : '#721c24'
                            }
                        }, user.has_eye_exam ? t('profile.eye_exam_uploaded') : t('profile.eye_exam_not_uploaded'))
                    )
                ),
                
                // 업로드 날짜 표시 (파일이 있는 경우)
                user.has_eye_exam && user.eye_exam_uploaded_at ? 
                    React.createElement('div', {
                        style: { marginBottom: '1rem' }
                    },
                        React.createElement('label', {
                            style: { display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }
                        }, t('profile.eye_exam_upload_date')),
                        React.createElement('p', {
                            style: { margin: 0, padding: '0.5rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }
                        }, new Date(user.eye_exam_uploaded_at).toLocaleDateString())
                    ) : null,
                
                // 파일 업로드 또는 삭제 버튼
                React.createElement('div', {
                    style: { marginBottom: '1rem' }
                },
                    user.has_eye_exam ? 
                        // 파일이 있는 경우 - 다운로드 및 삭제 버튼
                        React.createElement('div', {
                            style: { 
                                display: 'flex', 
                                gap: '0.5rem',
                                flexWrap: 'wrap'
                            }
                        },
                            React.createElement('button', {
                                onClick: handleEyeExamDownload,
                                disabled: eyeExamUploading,
                                style: {
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: eyeExamUploading ? 'not-allowed' : 'pointer',
                                    opacity: eyeExamUploading ? 0.6 : 1
                                }
                            }, eyeExamUploading ? t('profile.saving') : t('profile.download_eye_exam')),
                            React.createElement('button', {
                                onClick: handleEyeExamDelete,
                                disabled: eyeExamUploading,
                                style: {
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: eyeExamUploading ? 'not-allowed' : 'pointer',
                                    opacity: eyeExamUploading ? 0.6 : 1
                                }
                            }, eyeExamUploading ? t('profile.saving') : t('profile.delete_eye_exam'))
                        ) :
                        // 파일이 없는 경우 - 업로드 섹션
                        React.createElement('div', null,
                            React.createElement('div', {
                                style: { marginBottom: '1rem' }
                            },
                                React.createElement('input', {
                                    type: 'file',
                                    id: 'eye-exam-file-input',
                                    accept: '.pdf,.jpg,.jpeg,.png,.gif',
                                    onChange: handleFileSelect,
                                    style: { marginBottom: '0.5rem' }
                                }),
                                React.createElement('small', {
                                    style: { color: '#6c757d', display: 'block' }
                                }, t('profile.eye_exam_file_type_error'))
                            ),
                            selectedFile && React.createElement('div', {
                                style: { 
                                    marginBottom: '1rem',
                                    padding: '0.5rem',
                                    backgroundColor: '#e9ecef',
                                    borderRadius: '4px'
                                }
                            },
                                React.createElement('strong', null, t('profile.eye_exam_select_file'), ': '),
                                selectedFile.name,
                                React.createElement('small', {
                                    style: { display: 'block', color: '#6c757d' }
                                }, `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`)
                            ),
                            React.createElement('button', {
                                onClick: handleEyeExamUpload,
                                disabled: !selectedFile || eyeExamUploading,
                                style: {
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: (!selectedFile || eyeExamUploading) ? '#6c757d' : '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: (!selectedFile || eyeExamUploading) ? 'not-allowed' : 'pointer'
                                }
                            }, eyeExamUploading ? t('profile.eye_exam_uploading') : t('profile.upload_eye_exam'))
                        )
                )
            )
        )
    );
};

// 전역으로 내보내기
window.Components = window.Components || {};
window.Components.ProfilePage = ProfilePage;
