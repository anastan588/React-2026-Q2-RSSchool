/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}', // ДОБАВЛЕНО: для папки app в корне
    './src/app/**/*.{js,ts,jsx,tsx}', // ДОБАВЛЕНО: для папки app внутри src
    './src/**/*.{js,ts,jsx,tsx}', // Ваши старые компоненты и страницы
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
