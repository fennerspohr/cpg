/** @type {import('tailwindcss').Config} */
export default {
  content: [],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: true,
    darkTheme: "dark",
    base: true,
    styled: true, 
    utils: true, 
    prefix: "",
    logs: true,
    themeRoot: ":root",
  },
}