export interface Language {
  code: string;
  name: string;
  flag: string;
  rtl: boolean;
}

export interface Country {
  code: string;
  name: string;
  flag: string;
  languages: string[];
}

export interface Translation {
  [key: string]: string | Translation;
}

export interface I18nState {
  currentLanguage: string;
  country: string;
  availableLanguages: Language[];
  translations: Record<string, Translation>;
  isLoading: boolean;
}