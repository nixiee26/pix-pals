/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cozy: {
          bg: '#fbf8f2',
          card: '#ffffff',
          panel: '#f5eee3',
          border: '#e0d2c3',
          borderDark: '#2c221e',
          text: '#2d221e',
          muted: '#847367',
          green: '#488053',
          greenLight: '#e5f0e6',
          greenDark: '#2f5937',
          orange: '#df793b',
          orangeLight: '#faeedf',
          peach: '#f7d6c8',
          yellow: '#f3c444',
          yellowLight: '#fcf3d9',
          blue: '#4a6fa5',
          blueLight: '#e7eef7',
          purple: '#845ec2',
          purpleLight: '#f2ecfb',
          darkBg: '#1a1816',
          darkPanel: '#25211e',
          darkBorder: '#3d3630',
          darkText: '#ede4db',
        }
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        retro: ['"VT323"', 'monospace'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'pixel': '3px 3px 0px 0px rgba(44, 34, 30, 0.9)',
        'pixel-sm': '2px 2px 0px 0px rgba(44, 34, 30, 0.9)',
        'pixel-lg': '4px 4px 0px 0px rgba(44, 34, 30, 0.9)',
        'pixel-hover': '1px 1px 0px 0px rgba(44, 34, 30, 0.9)',
        'pixel-sun': '0 0 15px rgba(243, 196, 68, 0.4)',
      },
      borderRadius: {
        'pixel': '4px',
      }
    },
  },
  plugins: [],
}
