/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#4F46E5", // blu indaco
          light: "#6366F1",
          dark: "#4338CA"
        }
      }
    }
  },
  plugins: [],
};
