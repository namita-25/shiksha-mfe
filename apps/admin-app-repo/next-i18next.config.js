module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'mr', 'hi', 'or', 'odi', 'tel', 'kan', 'tam', 'gu', 'ur'],
    localeDetection: false,
  },
  fallbackLng: 'en',
  ns: ['common'],
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};
