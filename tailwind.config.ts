import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ranch: {
          brown: "#8B6F47",
          cream: "#F5E6D3",
          dark: "#2C2416",
        },
      },
    },
  },
  plugins: [],
};

export default config;
