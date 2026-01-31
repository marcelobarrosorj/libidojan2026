/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
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
