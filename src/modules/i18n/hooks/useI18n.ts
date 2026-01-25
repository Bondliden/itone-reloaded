import { useState, useEffect } from 'react';
import { i18nService } from '../services/i18nService';
import type { I18nState } from '../types';

export function useI18n() {
  const [state, setState] = useState<I18nState>({
    currentLanguage: localStorage.getItem('karaoke-language') || 'en',
    country: localStorage.getItem('karaoke-country') || 'US',
    availableLanguages: [],
    translations: {},
    isLoading: true
  });

  useEffect(() => {
    if (state.currentLanguage === 'en' && state.country === 'US') {
      initializeI18n();
    } else {
      // Use cached values
      setState(prev => ({
        ...prev,
        availableLanguages: i18nService.getAvailableLanguages(),
        isLoading: false
      }));
    }
  }, []);

  const initializeI18n = async () => {
    try {
      // Auto-detect country (with timeout)
      const countryPromise = i18nService.detectCountry();
      const timeoutPromise = new Promise<string>(resolve => 
        setTimeout(() => resolve('US'), 2000)
      );
      
      const country = await Promise.race([countryPromise, timeoutPromise]);
      
      // Get language preference: saved > country-based > browser > English
      const countryLanguage = i18nService.getLanguageForCountry(country);
      const browserLanguage = i18nService.detectBrowserLanguage();
      const savedLanguage = localStorage.getItem('karaoke-language');
      
      const language = savedLanguage || countryLanguage || browserLanguage;
      
      setState({
        currentLanguage: language,
        country,
        availableLanguages: i18nService.getAvailableLanguages(),
        translations: {},
        isLoading: false
      });
      
      localStorage.setItem('karaoke-language', language);
      localStorage.setItem('karaoke-country', country);
      
    } catch (error) {
      console.error('I18n initialization failed:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const changeLanguage = (languageCode: string) => {
    setState(prev => ({ ...prev, currentLanguage: languageCode }));
    localStorage.setItem('karaoke-language', languageCode);
  };

  const t = (key: string): string => {
    return i18nService.getTranslation(key, state.currentLanguage);
  };

  const formatCurrency = (amount: number): string => {
    return i18nService.formatCurrency(amount, state.country);
  };

  return {
    ...state,
    changeLanguage,
    t,
    formatCurrency
  };
}