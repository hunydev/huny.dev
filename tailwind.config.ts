import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './components/**/*.{ts,tsx}',
    './**/*.{ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
