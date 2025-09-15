// Footer component with language switcher
const Footer = () => {
    const [currentLanguage, setCurrentLanguage] = React.useState('ko');
    
    // Translation hook with fallback
    const { t } = window.useTranslation ? window.useTranslation() : { t: window.t || ((key) => key) };

    // Language change handler
    const handleLanguageChange = React.useCallback((newLanguage) => {
        setCurrentLanguage(newLanguage);
    }, []);

    // Initialize language listener
    React.useEffect(() => {
        if (window.i18n) {
            // Set initial language
            setCurrentLanguage(window.i18n.getCurrentLanguage());
            
            // Add language change listener
            window.i18n.addLanguageChangeListener(handleLanguageChange);
            
            return () => {
                window.i18n.removeLanguageChangeListener(handleLanguageChange);
            };
        }
    }, [handleLanguageChange]);

    // Handle language switch
    const switchLanguage = (language) => {
        if (window.i18n && language !== currentLanguage) {
            window.i18n.changeLanguage(language);
        }
    };

    return React.createElement('footer', { className: 'footer' },
        React.createElement('div', { className: 'container' },
            React.createElement('div', { className: 'footer-content' },
                React.createElement('div', { className: 'footer-section' },
                    React.createElement('h3', null, t('footer.brand')),
                    React.createElement('p', null, t('footer.brand_description'))
                ),
                React.createElement('div', { className: 'footer-section' },
                    React.createElement('h3', null, t('footer.customer_service')),
                    React.createElement('p', null, t('footer.phone')),
                    React.createElement('p', null, t('footer.email'))
                ),
                React.createElement('div', { className: 'footer-section' },
                    React.createElement('h3', null, t('footer.information')),
                    React.createElement('p', null, t('footer.terms')),
                    React.createElement('p', null, t('footer.privacy'))
                ),
                React.createElement('div', { className: 'footer-section language-section' },
                    React.createElement('h3', null, t('footer.language_switcher')),
                    React.createElement('div', { className: 'language-switcher' },
                        React.createElement('button', {
                            className: `language-btn ${currentLanguage === 'en' ? 'active' : ''}`,
                            onClick: () => switchLanguage('en'),
                            type: 'button'
                        }, t('footer.select_english')),
                        React.createElement('button', {
                            className: `language-btn ${currentLanguage === 'ko' ? 'active' : ''}`,
                            onClick: () => switchLanguage('ko'),
                            type: 'button'
                        }, t('footer.select_korean'))
                    )
                )
            ),
            React.createElement('div', { className: 'footer-bottom' },
                React.createElement('p', null, t('footer.copyright'))
            )
        )
    );
};

// Export globally
window.Components = window.Components || {};
window.Components.Footer = Footer;