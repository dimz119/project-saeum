// i18n Configuration and Translation System
// Simple internationalization system for React components

class I18nProvider {
    constructor() {
        this.currentLanguage = this.getStoredLanguage() || this.detectBrowserLanguage();
        this.translations = {};
        this.fallbackLanguage = 'en';
        this.listeners = [];
        this.initialized = false;
    }

    // Get language from localStorage
    getStoredLanguage() {
        if (typeof Storage !== 'undefined') {
            return localStorage.getItem('monthlylook-language');
        }
        return null;
    }

    // Detect browser language
    detectBrowserLanguage() {
        if (typeof navigator !== 'undefined') {
            const browserLang = navigator.language || navigator.userLanguage;
            // Check if browser language starts with supported languages
            if (browserLang.startsWith('ko')) return 'ko';
            if (browserLang.startsWith('en')) return 'en';
        }
        return 'en'; // Default to English
    }

    // Store language preference
    setStoredLanguage(language) {
        if (typeof Storage !== 'undefined') {
            localStorage.setItem('monthlylook-language', language);
        }
    }

    // Load translations for a specific language
    async loadTranslations(language) {
        if (this.translations[language]) {
            return this.translations[language];
        }

        try {
            const response = await fetch(`/static/web/src/locales/${language}.json`);
            if (response.ok) {
                this.translations[language] = await response.json();
                return this.translations[language];
            } else {
                console.warn(`Failed to load translations for ${language}`);
                return {};
            }
        } catch (error) {
            console.error(`Error loading translations for ${language}:`, error);
            return {};
        }
    }

    // Initialize i18n system
    async init() {
        // Load current language translations
        await this.loadTranslations(this.currentLanguage);
        
        // Load fallback language if different
        if (this.currentLanguage !== this.fallbackLanguage) {
            await this.loadTranslations(this.fallbackLanguage);
        }

        // Setup global translation function
        this.setupGlobalT();
        
        // Setup global useTranslation hook
        this.setupUseTranslation();
        
        // Mark as initialized
        this.initialized = true;

        console.log(`i18n initialized with language: ${this.currentLanguage}`);
    }

    // Check if i18n system is fully initialized
    isInitialized() {
        return this.initialized === true;
    }

    // Setup global translation function
    setupGlobalT() {
        window.t = (key, options = {}) => {
            return this.translate(key, options);
        };
    }

    // Setup React-like useTranslation hook
    setupUseTranslation() {
        // Global useTranslation function
        window.useTranslation = () => {
            return {
                t: (key, options = {}) => this.translate(key, options),
                i18n: {
                    language: this.currentLanguage,
                    changeLanguage: (lang) => this.changeLanguage(lang)
                }
            };
        };
        
        // Also add it to the i18n instance for consistency
        this.useTranslation = window.useTranslation;
    }

    // Translate function with nested key support
    translate(key, options = {}) {
        const currentTranslations = this.translations[this.currentLanguage] || {};
        const fallbackTranslations = this.translations[this.fallbackLanguage] || {};
        
        // Get translation from current language or fallback
        let translation = this.getNestedValue(currentTranslations, key) || 
                         this.getNestedValue(fallbackTranslations, key) || 
                         key;

        // Replace interpolations
        if (options && typeof translation === 'string') {
            Object.keys(options).forEach(optionKey => {
                const placeholder = `{{${optionKey}}}`;
                translation = translation.replace(new RegExp(placeholder, 'g'), options[optionKey]);
            });
        }

        return translation;
    }

    // Get nested value from object using dot notation
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : null;
        }, obj);
    }

    // Change language
    async changeLanguage(language) {
        console.log(`Attempting to change language from ${this.currentLanguage} to ${language}`);
        
        if (language === this.currentLanguage) {
            console.log('Language is already current, skipping change');
            return;
        }

        // Load new language translations
        await this.loadTranslations(language);
        
        // Update current language
        this.currentLanguage = language;
        
        // Store preference
        this.setStoredLanguage(language);
        
        // Notify listeners
        this.notifyListeners();
        
        console.log(`Language successfully changed to: ${language}`);
    }

    // Add language change listener
    addLanguageChangeListener(callback) {
        this.listeners.push(callback);
    }

    // Remove language change listener
    removeLanguageChangeListener(callback) {
        this.listeners = this.listeners.filter(listener => listener !== callback);
    }

    // Notify all listeners of language change
    notifyListeners() {
        this.listeners.forEach(callback => {
            try {
                callback(this.currentLanguage);
            } catch (error) {
                console.error('Error in language change listener:', error);
            }
        });
        
        // Also dispatch DOM event for components that use addEventListener
        if (typeof window !== 'undefined' && window.dispatchEvent) {
            const event = new CustomEvent('languageChanged', {
                detail: { language: this.currentLanguage }
            });
            window.dispatchEvent(event);
        }
    }

    // Get current language
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    // Get available languages
    getAvailableLanguages() {
        return ['en', 'ko'];
    }

    // Get language display name
    getLanguageDisplayName(language) {
        const displayNames = {
            'en': 'English',
            'ko': '한국어'
        };
        return displayNames[language] || language;
    }
}

// Create global i18n instance
window.i18n = new I18nProvider();

// Provide fallback translation function
window.t = window.t || function(key) {
    return key; // Return the key itself as fallback
};

// Initialize i18n when DOM is ready
function initializeI18n() {
    window.i18n.init().catch(error => {
        console.error('Failed to initialize i18n:', error);
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeI18n);
} else {
    initializeI18n();
}

// Export for module systems if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18nProvider;
}
