import type { Language, Country } from '../types';

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸', rtl: false },
  { code: 'es', name: 'Español', flag: '🇪🇸', rtl: false },
  { code: 'fr', name: 'Français', flag: '🇫🇷', rtl: false },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', rtl: false },
  { code: 'it', name: 'Italiano', flag: '🇮🇹', rtl: false },
  { code: 'pt', name: 'Português', flag: '🇧🇷', rtl: false },
  { code: 'ja', name: '日本語', flag: '🇯🇵', rtl: false },
  { code: 'ko', name: '한국어', flag: '🇰🇷', rtl: false },
  { code: 'zh', name: '中文', flag: '🇨🇳', rtl: false }
];

export const COUNTRY_LANGUAGE_MAP: Record<string, string> = {
  'US': 'en', 'GB': 'en', 'CA': 'en', 'AU': 'en',
  'ES': 'es', 'MX': 'es', 'AR': 'es', 'CO': 'es',
  'FR': 'fr', 'BE': 'fr', 'CH': 'fr',
  'DE': 'de', 'AT': 'de',
  'IT': 'it',
  'BR': 'pt', 'PT': 'pt',
  'JP': 'ja',
  'KR': 'ko',
  'CN': 'zh', 'TW': 'zh'
};