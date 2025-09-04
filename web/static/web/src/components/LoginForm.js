// 로그인 컴포넌트
const LoginForm = () => {
    const [formData, setFormData] = React.useState({
        email: '',
        password: ''
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

        const result = await window.auth.login(formData.email, formData.password);
        
        if (result.success) {
            console.log('Login successful:', result);
            setMessage(result.message);
            // 로그인 성공 시 즉시 메인 페이지로 리다이렉트
            console.log('Redirecting to home page...');
            
            // 더 강력한 리다이렉트 방법 시도
            try {
                window.location.replace('/');
            } catch (e) {
                console.log('replace failed, trying href:', e);
                window.location.href = '/';
            }
        } else {
            console.log('Login failed:', result.errors);
            setErrors(result.errors);
        }
        
        setLoading(false);
    };

    return React.createElement('div', { className: 'auth-container' },
        React.createElement('div', { className: 'auth-form' },
            React.createElement('h2', { className: 'auth-title' }, '로그인'),
            
            message && React.createElement('div', { className: 'success-message' }, message),
            
            React.createElement('form', { onSubmit: handleSubmit },
                React.createElement('div', { className: 'form-group' },
                    React.createElement('label', { htmlFor: 'email' }, '이메일'),
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
                    React.createElement('label', { htmlFor: 'password' }, '비밀번호'),
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
                
                errors.non_field_errors && React.createElement('div', { className: 'error-text' }, errors.non_field_errors),
                errors.general && React.createElement('div', { className: 'error-text' }, errors.general),
                
                React.createElement('button', {
                    type: 'submit',
                    disabled: loading,
                    className: 'submit-btn'
                }, loading ? '로그인 중...' : '로그인'),
                
                React.createElement('div', { className: 'auth-links' },
                    React.createElement('a', { href: '/register' }, '계정이 없으신가요? 회원가입'),
                )
            )
        )
    );
};

window.LoginForm = LoginForm;
