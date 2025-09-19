import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    // root-level project files (no node_modules)
    './*.{ts,tsx}',
    // app sources only
    './components/**/*.{ts,tsx}',
    './server/**/*.{ts,tsx}',
    './utils/**/*.{ts,tsx}',
    './extra/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
