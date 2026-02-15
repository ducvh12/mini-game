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
        tet: {
          red: "#dc2626",
          gold: "#fbbf24",
          dark: "#7f1d1d",
        },
      },
      animation: {
        'spin-slow': 'spin 3s linear',
        'bounce-slow': 'bounce 2s infinite',
        'scale-in': 'scale-in 0.2s ease-out',
      },
      keyframes: {
        'scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
