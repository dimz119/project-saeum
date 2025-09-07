// 배송지 주소 입력 모달
const ShippingAddressModal = ({ onClose, onSubmit }) => {
    const [formData, setFormData] = React.useState({
        name: '',
        phone: '',
        address: '',
        zipcode: '',
        detail_address: ''
    });

    const [errors, setErrors] = React.useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // 입력 시 해당 필드 에러 제거
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = '받는 분 성함을 입력해주세요.';
        }
        
        if (!formData.phone.trim()) {
            newErrors.phone = '휴대폰 번호를 입력해주세요.';
        } else if (!/^[0-9-]{10,13}$/.test(formData.phone)) {
            newErrors.phone = '올바른 휴대폰 번호를 입력해주세요.';
        }
        
        if (!formData.address.trim()) {
            newErrors.address = '주소를 입력해주세요.';
        }
        
        if (!formData.zipcode.trim()) {
            newErrors.zipcode = '우편번호를 입력해주세요.';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    return React.createElement('div', {
        style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }
    },
        React.createElement('div', {
            style: {
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '8px',
                maxWidth: '500px',
                width: '90%',
                maxHeight: '80vh',
                overflowY: 'auto'
            }
        },
            React.createElement('div', {
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                    borderBottom: '1px solid #dee2e6',
                    paddingBottom: '1rem'
                }
            },
                React.createElement('h3', {
                    style: { margin: 0 }
                }, '배송지 정보 입력'),
                React.createElement('button', {
                    onClick: onClose,
                    style: {
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer'
                    }
                }, '×')
            ),

            React.createElement('form', {
                onSubmit: handleSubmit
            },
                // 받는 분 성함
                React.createElement('div', {
                    style: { marginBottom: '1rem' }
                },
                    React.createElement('label', {
                        style: {
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: 'bold'
                        }
                    }, '받는 분 성함 *'),
                    React.createElement('input', {
                        type: 'text',
                        name: 'name',
                        value: formData.name,
                        onChange: handleInputChange,
                        style: {
                            width: '100%',
                            padding: '0.75rem',
                            border: errors.name ? '1px solid #dc3545' : '1px solid #dee2e6',
                            borderRadius: '4px',
                            fontSize: '1rem'
                        },
                        placeholder: '받는 분의 성함을 입력해주세요'
                    }),
                    errors.name && React.createElement('div', {
                        style: {
                            color: '#dc3545',
                            fontSize: '0.875rem',
                            marginTop: '0.25rem'
                        }
                    }, errors.name)
                ),

                // 휴대폰 번호
                React.createElement('div', {
                    style: { marginBottom: '1rem' }
                },
                    React.createElement('label', {
                        style: {
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: 'bold'
                        }
                    }, '휴대폰 번호 *'),
                    React.createElement('input', {
                        type: 'tel',
                        name: 'phone',
                        value: formData.phone,
                        onChange: handleInputChange,
                        style: {
                            width: '100%',
                            padding: '0.75rem',
                            border: errors.phone ? '1px solid #dc3545' : '1px solid #dee2e6',
                            borderRadius: '4px',
                            fontSize: '1rem'
                        },
                        placeholder: '010-1234-5678'
                    }),
                    errors.phone && React.createElement('div', {
                        style: {
                            color: '#dc3545',
                            fontSize: '0.875rem',
                            marginTop: '0.25rem'
                        }
                    }, errors.phone)
                ),

                // 우편번호
                React.createElement('div', {
                    style: { marginBottom: '1rem' }
                },
                    React.createElement('label', {
                        style: {
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: 'bold'
                        }
                    }, '우편번호 *'),
                    React.createElement('input', {
                        type: 'text',
                        name: 'zipcode',
                        value: formData.zipcode,
                        onChange: handleInputChange,
                        style: {
                            width: '100%',
                            padding: '0.75rem',
                            border: errors.zipcode ? '1px solid #dc3545' : '1px solid #dee2e6',
                            borderRadius: '4px',
                            fontSize: '1rem'
                        },
                        placeholder: '12345'
                    }),
                    errors.zipcode && React.createElement('div', {
                        style: {
                            color: '#dc3545',
                            fontSize: '0.875rem',
                            marginTop: '0.25rem'
                        }
                    }, errors.zipcode)
                ),

                // 주소
                React.createElement('div', {
                    style: { marginBottom: '1rem' }
                },
                    React.createElement('label', {
                        style: {
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: 'bold'
                        }
                    }, '주소 *'),
                    React.createElement('input', {
                        type: 'text',
                        name: 'address',
                        value: formData.address,
                        onChange: handleInputChange,
                        style: {
                            width: '100%',
                            padding: '0.75rem',
                            border: errors.address ? '1px solid #dc3545' : '1px solid #dee2e6',
                            borderRadius: '4px',
                            fontSize: '1rem'
                        },
                        placeholder: '기본 주소를 입력해주세요'
                    }),
                    errors.address && React.createElement('div', {
                        style: {
                            color: '#dc3545',
                            fontSize: '0.875rem',
                            marginTop: '0.25rem'
                        }
                    }, errors.address)
                ),

                // 상세주소
                React.createElement('div', {
                    style: { marginBottom: '1.5rem' }
                },
                    React.createElement('label', {
                        style: {
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: 'bold'
                        }
                    }, '상세주소'),
                    React.createElement('input', {
                        type: 'text',
                        name: 'detail_address',
                        value: formData.detail_address,
                        onChange: handleInputChange,
                        style: {
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #dee2e6',
                            borderRadius: '4px',
                            fontSize: '1rem'
                        },
                        placeholder: '아파트, 동/호수 등 (선택사항)'
                    })
                ),

                // 버튼
                React.createElement('div', {
                    style: {
                        display: 'flex',
                        gap: '1rem',
                        justifyContent: 'flex-end'
                    }
                },
                    React.createElement('button', {
                        type: 'button',
                        onClick: onClose,
                        style: {
                            padding: '0.75rem 1.5rem',
                            border: '1px solid #dee2e6',
                            backgroundColor: 'white',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }
                    }, '취소'),
                    React.createElement('button', {
                        type: 'submit',
                        style: {
                            padding: '0.75rem 1.5rem',
                            border: 'none',
                            backgroundColor: '#007bff',
                            color: 'white',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }
                    }, '확인')
                )
            )
        )
    );
};

// 전역으로 내보내기
window.Components = window.Components || {};
window.Components.ShippingAddressModal = ShippingAddressModal;
