import React, { createContext, useContext } from 'react';
import { useI18n } from '../hooks/useI18n';
import type { I18nState } from '../types';

interface I18nContextType extends I18nState {
  changeLanguage: (languageCode: string) => void;
  t: (key: string) => string;
  formatCurrency: (amount: number) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function useI18nContext() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18nContext must be used within I18nProvider');
  }
  return context;
}

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const i18nState = useI18n();
  
  return (
    <I18nContext.Provider value={i18nState}>
      {children}
    </I18nContext.Provider>
  );
}