import React, { createContext, useContext, useMemo, useState } from 'react';
import { en, hi, TranslationKey } from './translations';
import type { Language } from '../types';
import { getSchoolConfiguration } from '../config/schoolConfig';

type I18nValue = { language: Language; setLanguage: (language: Language) => void; t: (key: TranslationKey, vars?: Record<string, string | number>) => string };
const Context = createContext<I18nValue | null>(null);
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() =>
    getSchoolConfiguration().localization.defaultLanguage === 'hi' ? 'hi' : 'en',
  );
  const value = useMemo<I18nValue>(() => ({ language, setLanguage, t: (key, vars) => {
    let text: string = (language === 'hi' ? hi : en)[key] || en[key];
    if (vars) Object.entries(vars).forEach(([name, value]) => { text = text.replaceAll(`{${name}}`, String(value)); });
    return text;
  } }), [language]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useI18n() {
  const value = useContext(Context);
  if (!value) throw new Error('useI18n must be used inside I18nProvider');
  return value;
}
