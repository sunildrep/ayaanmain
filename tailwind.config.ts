import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          700: '#1a365d',
          800: '#0f2447',
          900: '#0b1d3a',
          950: '#070f1f',
        },
        ink: '#0f172a',
        muted: '#64748b',
        accent: '#0ea5e9',
        amber: '#f59e0b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 8px 30px rgba(15, 36, 71, 0.08)',
        card: '0 4px 24px rgba(15, 36, 71, 0.06)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      }
    },
  },
  plugins: [],
};
export default config;
