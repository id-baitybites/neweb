import { cookies } from 'next/headers';

const dictionaries = {
  en: () => import('./dictionaries/en.json').then((module) => module.default),
  id: () => import('./dictionaries/id.json').then((module) => module.default),
};

export type Locale = keyof typeof dictionaries;

export const getLocale = async (): Promise<Locale> => {
  const cookieStore = await cookies();
  const rawValue = cookieStore.get('NEXT_LOCALE')?.value;
  if (rawValue === 'en' || rawValue === 'id') return rawValue as Locale;
  // Fallback to id
  return 'id';
};

export const getDictionary = async () => {
  const locale = await getLocale();
  const dict = await dictionaries[locale]();
  return { ...dict, locale };
};
