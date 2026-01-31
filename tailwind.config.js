/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#050505",
        panel: "#0b0f16",
        navyBtn: "#0b2a55",
        gold: "#f5c542",
        orange1: "#ff7a18",
        orange2: "#ffb11a"
      }
    }
  },
  plugins: []
};
