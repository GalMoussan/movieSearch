import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: "#c8a832",
        parchment: "#e8e0d0",
        void: "#080808",
      },
      fontFamily: {
        serif: ["'Playfair Display'", "Georgia", "serif"],
        mono: ["'Courier New'", "monospace"],
        typewriter: ["'Special Elite'", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
