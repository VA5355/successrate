import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
   safelist: [
    'bg-green-600', 'bg-green-700',
    'bg-red-600', 'bg-red-700',
    'bg-blue-500', 'hover:bg-blue-600'
  ],
  theme: {
    extend: {
    colors: {
      whiteopaque: "rgba(255,255,255,0.5)",
      blackopaque: "rgba(0,0,0,0.5)",
      brandgreen: "#012970",   // your custom colors
      brandblue: "#00f",
      brandgreenlight: "rgba(37, 227, 252, 0.29)",
      greylight: "#e4e4e7",
      greydark: "#18181b",
    },
    backgroundImage: {
      'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
    },
  },
  },
  plugins: [],
}
export default config
