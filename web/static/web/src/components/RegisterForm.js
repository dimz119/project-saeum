// 회원가입 컴포넌트
const RegisterForm = () => {
    // Translation hook with fallback
    const { t } = window.useTranslation ? window.useTranslation() : { t: window.t || ((key) => key) };
    const [formData, setFormData] = React.useState({
        email: '',
        username: '',
        password: '',
        password_confirm: '',
        first_name: '',
        last_name: '',
        phone_number: '',
        date_of_birth: ''
    });
    const [errors, setErrors] = React.useState({});
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // 입력 시 해당 필드의 에러 제거
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setMessage('');

        const result = await window.auth.register(formData);
        
        if (result.success) {
            setMessage(result.message);
            // 회원가입 성공 시 즉시 메인 페이지로 리다이렉트
            window.location.href = '/';
        } else {
            setErrors(result.errors);
        }
        
        setLoading(false);
    };

    return React.createElement('div', { className: 'auth-container' },
        React.createElement('div', { className: 'auth-form register-form' },
            React.createElement('h2', { className: 'auth-title' }, t('auth.register')),
            
            message && React.createElement('div', { className: 'success-message' }, message),
            
            React.createElement('form', { onSubmit: handleSubmit },
                React.createElement('div', { className: 'form-row' },
                    React.createElement('div', { className: 'form-group' },
                        React.createElement('label', { htmlFor: 'email' }, t('auth.email_required')),
                        React.createElement('input', {
                            type: 'email',
                            id: 'email',
                            name: 'email',
                            value: formData.email,
                            onChange: handleChange,
                            required: true,
                            className: errors.email ? 'error' : ''
                        }),
                        errors.email && React.createElement('span', { className: 'error-text' }, errors.email)
                    ),
                    
                    React.createElement('div', { className: 'form-group' },
                        React.createElement('label', { htmlFor: 'username' }, t('auth.username_required')),
                        React.createElement('input', {
                            type: 'text',
                            id: 'username',
                            name: 'username',
                            value: formData.username,
                            onChange: handleChange,
                            required: true,
                            className: errors.username ? 'error' : ''
                        }),
                        errors.username && React.createElement('span', { className: 'error-text' }, errors.username)
                    )
                ),
                
                React.createElement('div', { className: 'form-row' },
                    React.createElement('div', { className: 'form-group' },
                        React.createElement('label', { htmlFor: 'password' }, t('auth.password_required')),
                        React.createElement('input', {
                            type: 'password',
                            id: 'password',
                            name: 'password',
                            value: formData.password,
                            onChange: handleChange,
                            required: true,
                            className: errors.password ? 'error' : ''
                        }),
                        errors.password && React.createElement('span', { className: 'error-text' }, errors.password)
                    ),
                    
                    React.createElement('div', { className: 'form-group' },
                        React.createElement('label', { htmlFor: 'password_confirm' }, t('auth.confirm_password_required')),
                        React.createElement('input', {
                            type: 'password',
                            id: 'password_confirm',
                            name: 'password_confirm',
                            value: formData.password_confirm,
                            onChange: handleChange,
                            required: true,
                            className: errors.password_confirm ? 'error' : ''
                        }),
                        errors.password_confirm && React.createElement('span', { className: 'error-text' }, errors.password_confirm)
                    )
                ),
                
                React.createElement('div', { className: 'form-row' },
                    React.createElement('div', { className: 'form-group' },
                        React.createElement('label', { htmlFor: 'first_name' }, t('auth.first_name')),
                        React.createElement('input', {
                            type: 'text',
                            id: 'first_name',
                            name: 'first_name',
                            value: formData.first_name,
                            onChange: handleChange,
                            className: errors.first_name ? 'error' : ''
                        }),
                        errors.first_name && React.createElement('span', { className: 'error-text' }, errors.first_name)
                    ),
                    
                    React.createElement('div', { className: 'form-group' },
                        React.createElement('label', { htmlFor: 'last_name' }, t('auth.last_name')),
                        React.createElement('input', {
                            type: 'text',
                            id: 'last_name',
                            name: 'last_name',
                            value: formData.last_name,
                            onChange: handleChange,
                            className: errors.last_name ? 'error' : ''
                        }),
                        errors.last_name && React.createElement('span', { className: 'error-text' }, errors.last_name)
                    )
                ),
                
                React.createElement('div', { className: 'form-row' },
                    React.createElement('div', { className: 'form-group' },
                        React.createElement('label', { htmlFor: 'phone_number' }, t('auth.phone_number')),
                        React.createElement('input', {
                            type: 'tel',
                            id: 'phone_number',
                            name: 'phone_number',
                            value: formData.phone_number,
                            onChange: handleChange,
                            placeholder: '010-1234-5678',
                            className: errors.phone_number ? 'error' : ''
                        }),
                        errors.phone_number && React.createElement('span', { className: 'error-text' }, errors.phone_number)
                    ),
                    
                    React.createElement('div', { className: 'form-group' },
                        React.createElement('label', { htmlFor: 'date_of_birth' }, t('auth.date_of_birth')),
                        React.createElement('input', {
                            type: 'date',
                            id: 'date_of_birth',
                            name: 'date_of_birth',
                            value: formData.date_of_birth,
                            onChange: handleChange,
                            className: errors.date_of_birth ? 'error' : ''
                        }),
                        errors.date_of_birth && React.createElement('span', { className: 'error-text' }, errors.date_of_birth)
                    )
                ),
                
                errors.non_field_errors && React.createElement('div', { className: 'error-text' }, errors.non_field_errors),
                errors.general && React.createElement('div', { className: 'error-text' }, errors.general),
                
                React.createElement('button', {
                    type: 'submit',
                    disabled: loading,
                    className: 'submit-btn'
                }, loading ? t('auth.registering') : t('auth.register')),
                
                React.createElement('div', { className: 'auth-links' },
                    React.createElement('a', { href: '/login' }, t('auth.have_account_login')),
                )
            )
        )
    );
};

window.RegisterForm = RegisterForm;
