/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/App.jsx",
    "./src/main.jsx",
    "./src/components/Dashboard.jsx",
    "./src/components/DefiAssetCard.jsx",
    "./src/components/OverviewCard.jsx",
    "./src/components/PoolAnalysis.jsx",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
};
