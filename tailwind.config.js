/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/App.jsx",
    "./src/main.jsx",
    "./src/components/Dashboard.jsx",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
};
