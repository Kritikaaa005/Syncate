import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import enCommon from './locales/en/common.json';
import enOnboarding from './locales/en/onboarding.json';
import enGuest from './locales/en/guest.json';          // ADDED
import neCommon from './locales/ne/common.json';
import neOnboarding from './locales/ne/onboarding.json';
import neGuest from './locales/ne/guest.json';           // ADDED

const resources = {
  en: { common: enCommon, onboarding: enOnboarding, guest: enGuest },   // ADDED guest
  ne: { common: neCommon, onboarding: neOnboarding, guest: neGuest },   // ADDED guest
};

const LANGUAGE_KEY = 'app_language';

export async function initI18n() {
  const stored = await AsyncStorage.getItem(LANGUAGE_KEY);
  const deviceLang = Localization.getLocales()[0]?.languageCode ?? 'en';
  const lng = stored ?? (deviceLang === 'ne' ? 'ne' : 'en');

  await i18n.use(initReactI18next).init({
    resources,
    lng,
    fallbackLng: 'en',
    ns: ['common', 'onboarding', 'guest'],   // ADDED guest
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    compatibilityJSON: 'v4',
  });
}

export async function changeLanguage(lang: 'en' | 'ne') {
  await i18n.changeLanguage(lang);
  await AsyncStorage.setItem(LANGUAGE_KEY, lang);
}

export default i18n;