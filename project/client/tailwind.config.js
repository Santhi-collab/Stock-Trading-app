/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0D1117',
        surface: '#141B22',
        surface2: '#1B242D',
        line: '#26313B',
        muted: '#7D8896',
        brand: {
          DEFAULT: '#6C5CE7',
          light: '#8C7FF0',
          dark: '#5443C7',
        },
        gain: '#2FBF71',
        loss: '#F0546A',
        signal: '#F2B33D',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
