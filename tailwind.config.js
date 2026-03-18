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
        dormstash: {
          background: "#14161B",
          foreground: "#FFFFFF",
          accent: "#46BFFF",
          blue: "#57C8FF",
          navy: "#33415C",
          muted: "#A9B1C1",
        },
      },
    },
  },
  plugins: [],
};
