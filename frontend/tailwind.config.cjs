/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",   // ← covers App.tsx and all components
    // If you later add folders, include them too:
    // "./app/**/*.{ts,tsx,js,jsx}",
    // "./widgets/**/*.{ts,tsx}",
  ],
  theme: { extend: {} },
  plugins: [],
  // Optional: safelist dynamic classes if you build them at runtime
  // safelist: ["bg-red-500", "text-center", { pattern: /(bg|text|border)-(red|green|blue)-(100|500)/ }],
};
