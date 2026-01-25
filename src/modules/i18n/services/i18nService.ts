import { SUPPORTED_LANGUAGES, COUNTRY_LANGUAGE_MAP } from '../config/languages';
import { en } from '../translations/en';
import { es } from '../translations/es';
import type { Language, Translation } from '../types';

class I18nService {
  private translations: Record<string, Translation> = { en, es };

  async detectCountry(): Promise<string> {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return data.country_code || 'US';
    } catch (error) {
      console.warn('Country detection failed:', error);
      return 'US';
    }
  }

  detectBrowserLanguage(): string {
    const browserLang = navigator.language.split('-')[0];
    const supportedCodes = SUPPORTED_LANGUAGES.map(lang => lang.code);
    return supportedCodes.includes(browserLang) ? browserLang : 'en';
  }

  getLanguageForCountry(countryCode: string): string {
    return COUNTRY_LANGUAGE_MAP[countryCode] || 'en';
  }

  getAvailableLanguages(): Language[] {
    return SUPPORTED_LANGUAGES;
  }

  getTranslation(key: string, language: string = 'en'): string {
    const translations = this.translations[language] || this.translations.en;
    const keys = key.split('.');
    
    let value: any = translations;
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }
    
    return typeof value === 'string' ? value : key;
  }

  formatCurrency(amount: number, countryCode: string): string {
    const locale = this.getLocaleForCountry(countryCode);
    const currency = this.getCurrencyForCountry(countryCode);
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency
    }).format(amount);
  }

  private getLocaleForCountry(countryCode: string): string {
    const localeMap: Record<string, string> = {
      'US': 'en-US', 'GB': 'en-GB', 'CA': 'en-CA',
      'ES': 'es-ES', 'MX': 'es-MX', 'AR': 'es-AR',
      'FR': 'fr-FR', 'BE': 'fr-BE', 'CH': 'fr-CH',
      'DE': 'de-DE', 'AT': 'de-AT',
      'IT': 'it-IT',
      'BR': 'pt-BR', 'PT': 'pt-PT',
      'JP': 'ja-JP',
      'KR': 'ko-KR',
      'CN': 'zh-CN', 'TW': 'zh-TW'
    };
    return localeMap[countryCode] || 'en-US';
  }

  private getCurrencyForCountry(countryCode: string): string {
    const currencyMap: Record<string, string> = {
      'US': 'USD', 'CA': 'CAD',
      'GB': 'GBP',
      'DE': 'EUR', 'FR': 'EUR', 'ES': 'EUR', 'IT': 'EUR', 'AT': 'EUR', 'BE': 'EUR',
      'BR': 'BRL', 'PT': 'EUR',
      'JP': 'JPY',
      'KR': 'KRW',
      'CN': 'CNY', 'TW': 'TWD',
      'MX': 'MXN', 'AR': 'ARS'
    };
    return currencyMap[countryCode] || 'USD';
  }
}

export const i18nService = new I18nService();