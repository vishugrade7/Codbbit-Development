
import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
       backdropBlur: {
        xl: '20px',
      },
      fontFamily: {
        sans: ['"Helvetica Neue"', 'sans-serif'],
        body: ['"Helvetica Neue"', 'sans-serif'],
        headline: ['"Helvetica Neue"', 'sans-serif'],
        code: ['"Helvetica Neue"', 'monospace'],
        handwritten: ['var(--font-caveat)', 'cursive'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        'category-green-bg': 'hsl(var(--category-green-bg))',
        'category-green-fg': 'hsl(var(--category-green-fg))',
        'category-green-border': 'hsl(var(--category-green-border))',
        'category-yellow-bg': 'hsl(var(--category-yellow-bg))',
        'category-yellow-fg': 'hsl(var(--category-yellow-fg))',
        'category-yellow-border': 'hsl(var(--category-yellow-border))',
        'category-purple-bg': 'hsl(var(--category-purple-bg))',
        'category-purple-fg': 'hsl(var(--category-purple-fg))',
        'category-purple-border': 'hsl(var(--category-purple-border))',
        'category-blue-bg': 'hsl(var(--category-blue-bg))',
        'category-blue-fg': 'hsl(var(--category-blue-fg))',
        'category-blue-border': 'hsl(var(--category-blue-border))',
        'category-red-bg': 'hsl(var(--category-red-bg))',
        'category-red-fg': 'hsl(var(--category-red-fg))',
        'category-red-border': 'hsl(var(--category-red-border))',
        'category-teal-bg': 'hsl(var(--category-teal-bg))',
        'category-teal-fg': 'hsl(var(--category-teal-fg))',
        'category-teal-border': 'hsl(var(--category-teal-border))',
        'category-orange-bg': 'hsl(var(--category-orange-bg))',
        'category-orange-fg': 'hsl(var(--category-orange-fg))',
        'category-orange-border': 'hsl(var(--category-orange-border))',
      },
      borderRadius: {
        lg: `1rem`,
        md: `0.75rem`,
        sm: `0.5rem`,
      },
       transitionTimingFunction: {
        'bouncy-1': 'cubic-bezier(.5,.85,.25,1.1)',
        'bouncy-2': 'cubic-bezier(.5,.85,.25,1.8)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'fade-in': {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        'fade-in-up': {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'genie-in': {
          'from': {
            'transform': 'scale(0) translateY(100%)',
            'opacity': '0',
            'transform-origin': 'bottom right',
          },
          'to': {
            'transform': 'scale(1) translateY(0)',
            'opacity': '1',
            'transform-origin': 'bottom right',
          }
        },
        pulse: {
          '0%, 100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
          '50%': {
            opacity: '.75',
            transform: 'scale(1.1)',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'genie-in': 'genie-in 0.3s ease-out',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
