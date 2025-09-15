// 모든 컴포넌트를 로드하는 메인 JavaScript 파일
// 컴포넌트들이 순차적으로 로드되도록 보장

// 전역 Components 객체 초기화
window.Components = window.Components || {};

// 모든 컴포넌트 파일들을 로드하는 함수
function loadComponents() {
    const componentFiles = [
        '/static/web/src/i18n.js',  // i18n system first
        '/static/web/src/utils/api.js',
        '/static/web/src/components/Header.js',
        '/static/web/src/components/Footer.js',
        '/static/web/src/components/Hero.js',
        '/static/web/src/components/ProductCard.js',
        '/static/web/src/components/ProductList.js',
        '/static/web/src/App.js'
    ];

    // 순차적으로 스크립트 로드
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // 모든 스크립트를 순차적으로 로드
    async function loadAllScripts() {
        try {
            for (const file of componentFiles) {
                await loadScript(file);
                console.log(`Loaded: ${file}`);
            }
            console.log('All components loaded successfully');
        } catch (error) {
            console.error('Error loading components:', error);
        }
    }

    loadAllScripts();
}

// DOM이 로드되면 컴포넌트들을 로드
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadComponents);
} else {
    loadComponents();
}
