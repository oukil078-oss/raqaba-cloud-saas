import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Tajawal','Cairo','Noto Kufi Arabic','ui-sans-serif','system-ui'] },
      colors: {
        raqaba: { 50:'#eff7ff',100:'#dcedff',200:'#b9ddff',300:'#80c5ff',400:'#3da6ff',500:'#1389f2',600:'#066cd0',700:'#0757a8',800:'#0a4a8b',900:'#0d3f73',950:'#082747' },
        ink: '#071427'
      },
      boxShadow: { glow: '0 0 60px rgba(19, 137, 242, .35)', card: '0 24px 80px rgba(7,20,39,.12)' },
      backgroundImage: { 'cloud-grid': 'radial-gradient(circle at 20% 20%, rgba(19,137,242,.28), transparent 28%), radial-gradient(circle at 80% 0%, rgba(6,182,212,.2), transparent 25%), linear-gradient(135deg, #06162c 0%, #082747 55%, #0b3b70 100%)' }
    }
  },
  plugins: []
};
export default config;
