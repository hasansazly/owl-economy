/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        temple: {
          cherry: "#9D2235",
          sand: "#F8DBE0",
          ink: "#221316",
          muted: "#69474E",
          background: "#FFF7F8",
        },
      },
    },
  },
  plugins: [],
};
