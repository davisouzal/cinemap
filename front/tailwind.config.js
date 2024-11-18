/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.js", "./index.html"],
  theme: {
    extend: {
      colors: {
        primary: {
          700: "#1A202C",
          500: "#2E3747",
          300: "#696F77",
        },
        secondary: {
          700: "#60759F",
        },
      },
    },
  },
  plugins: [],
};
