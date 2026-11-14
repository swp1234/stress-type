class I18n {
    constructor() {
        this.translations = {};
        this.supportedLanguages = ['ko', 'en', 'ja', 'es', 'pt', 'zh', 'id', 'tr', 'de', 'fr', 'hi', 'ru'];
        this.currentLang = this.detectLanguage();
    }
    detectLanguage() {
        try {
            const queryLang = new URLSearchParams(window.location.search || '').get('lang');
            if (queryLang && this.supportedLanguages.includes(queryLang)) return queryLang;
            const savedLang = localStorage.getItem('app_language');
            if (savedLang && this.supportedLanguages.includes(savedLang)) return savedLang;
            const browserLang = (navigator.language || navigator.userLanguage || 'en').split('-')[0];
            if (this.supportedLanguages.includes(browserLang)) return browserLang;
        } catch (e) {}
        return 'en';
    }
    async loadTranslations(lang) {
        try {
            const response = await fetch(`js/locales/${lang}.json`);
            if (!response.ok) throw new Error('Not found');
            this.translations[lang] = await response.json();
            return true;
        } catch (e) {
            if (lang !== 'en') return this.loadTranslations('en');
            return false;
        }
    }
    t(key) {
        try {
            const keys = key.split('.');
            let value = this.translations[this.currentLang];
            for (const k of keys) {
                if (value && typeof value === 'object' && k in value) {
                    value = value[k];
                } else {
                    return key;
                }
            }
            return value !== undefined ? value : key;
        } catch (e) {
            return key;
        }
    }
    async setLanguage(lang) {
        if (!this.supportedLanguages.includes(lang)) return false;
        try {
            if (!this.translations[lang]) await this.loadTranslations(lang);
            this.currentLang = lang;
            localStorage.setItem('app_language', lang);
            this.syncSeoState(lang);
            this.updateUI();
        } catch (e) {}
        return true;
    }
    getSeoHref(lang = this.currentLang) {
        const baseUrl = 'https://dopabrain.com/stress-type/';
        const safeLang = this.supportedLanguages.includes(lang) ? lang : 'en';
        const alt = document.querySelector(`link[rel="alternate"][hreflang="${safeLang}"]`);
        if (alt && alt.href) return alt.href;
        return safeLang === 'en' ? baseUrl : `${baseUrl}?lang=${encodeURIComponent(safeLang)}`;
    }
    syncSeoState(lang = this.currentLang) {
        const safeLang = this.supportedLanguages.includes(lang) ? lang : 'en';
        document.documentElement.lang = safeLang;
        const seoHref = this.getSeoHref(safeLang);
        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) canonical.href = seoHref;
        const ogUrl = document.querySelector('meta[property="og:url"]');
        if (ogUrl) ogUrl.content = seoHref;
        const ogLocaleMap = {
            ko: 'ko_KR', en: 'en_US', ja: 'ja_JP', zh: 'zh_CN', es: 'es_ES', pt: 'pt_BR',
            hi: 'hi_IN', ru: 'ru_RU', id: 'id_ID', tr: 'tr_TR', de: 'de_DE', fr: 'fr_FR'
        };
        const ogLocale = document.querySelector('meta[property="og:locale"]');
        if (ogLocale && ogLocaleMap[safeLang]) ogLocale.content = ogLocaleMap[safeLang];
    }
    updateUI() {
        try {
            this.syncSeoState(this.currentLang);
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                const val = this.t(key);
                if (typeof val === 'string' && val && val !== key) el.textContent = val;
            });
            document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
                const key = el.getAttribute('data-i18n-placeholder');
                const val = this.t(key);
                if (typeof val === 'string' && val && val !== key) el.placeholder = val;
            });
            const titleKey = 'app.title';
            const title = this.t(titleKey);
            if (typeof title === 'string' && title !== titleKey) document.title = title;
            const meta = document.querySelector('meta[name="description"]');
            if (meta) {
                const desc = this.t('app.description');
                if (typeof desc === 'string' && desc !== 'app.description') meta.content = desc;
            }
        } catch (e) {}
    }
    getCurrentLanguage() { return this.currentLang; }
    getLanguageName(lang) {
        const names = {
            ko: '한국어', en: 'English', ja: '日本語', es: 'Español',
            pt: 'Português', zh: '简体中文', id: 'Bahasa Indonesia',
            tr: 'Türkçe', de: 'Deutsch', fr: 'Français', hi: 'हिन्दी', ru: 'Русский'
        };
        return names[lang] || lang;
    }
}
const i18n = new I18n();
window.i18n = i18n;
