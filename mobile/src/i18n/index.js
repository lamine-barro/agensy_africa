import fr from './fr';
import en from './en';

export const dictionaries = { fr, en };

/** Minimal dependency-free i18n layer. Add a locale file without changing screens. */
export function translate(locale, key, variables = {}) {
  const dictionary = dictionaries[locale] || dictionaries.fr;
  const pluralKey = Number(variables.count) !== 1 ? `${key}_plural` : key;
  let value = dictionary[pluralKey] || dictionary[key] || fr[pluralKey] || fr[key] || key;
  return value.replace(/{{(\w+)}}/g, (_, name) => String(variables[name] ?? ''));
}

export function formatMoney(amount, currency, locale) {
  const code = currency || 'XOF';
  const converted = code === 'EUR' ? amount / 655.957 : code === 'USD' ? amount / 600 : amount;
  return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'fr-CI', { style: 'currency', currency: code, maximumFractionDigits: code === 'XOF' ? 0 : 2 }).format(converted);
}
