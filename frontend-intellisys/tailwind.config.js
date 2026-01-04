/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Importante para o botão de trocar tema funcionar manualmente
  theme: {
    extend: {},
  },
  plugins: [],
}