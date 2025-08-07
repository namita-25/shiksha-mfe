export interface Language {
  title: string;
  value: string;
}

export const languages: Language[] = [
  { title: 'english', value: 'en' },
  { title: 'hindi', value: 'hi' },
    { title: 'marathi', value: 'ma' },
  // { title: 'bengali', value: 'ba' },
  // { title: 'telugu', value: 'te' },
  // { title: 'kannada', value: 'ka' },
  // { title: 'tamil', value: 'ta' },
  // { title: 'gujarati', value: 'gu' },
  // { title: 'urdu', value: 'ur' },
];

export const getTitleFromValue = (value: string): string | null => {
  const language = languages.find((language) => language.value === value);
  return language ? language.title : null;
};
