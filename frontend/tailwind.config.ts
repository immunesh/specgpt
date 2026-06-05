import type { Config } from 'tailwindcss'
import { fontFamily } from 'tailwindcss/defaultTheme'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        /* Capgemini brand palette */
        capgemini: {
          blue: '#00AEEF',
          red: '#E0003C',
          dark: '#070B18',
        },
        /* Extended brand */
        brand: {
          50:  '#e6f8ff',
          100: '#b3eaff',
          200: '#66d4ff',
          300: '#29c0ff',
          400: '#00AEEF',
          500: '#0095cc',
          600: '#0070F3',
          700: '#0050b3',
          800: '#00348a',
          900: '#001f6b',
        },
        neon: {
          blue:   '#00AEEF',
          cyan:   '#06B6D4',
          purple: '#7C3AED',
          pink:   '#EC4899',
          green:  '#10B981',
        },
        /* 5G heritage */
        '5g': {
          50:  '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7dcafb',
          400: '#38aef7',
          500: '#0e93e8',
          600: '#0174c6',
          700: '#015ca1',
          800: '#064f85',
          900: '#0b426e',
          950: '#072a49',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      fontFamily: {
        sans:    ['var(--font-inter)', ...fontFamily.sans],
        display: ['var(--font-space-grotesk)', 'var(--font-inter)', ...fontFamily.sans],
        mono:    ['var(--font-jetbrains-mono)', ...fontFamily.mono],
      },
      backgroundImage: {
        'gradient-brand':   'linear-gradient(135deg, #00AEEF 0%, #0070F3 60%, #7C3AED 100%)',
        'gradient-blue':    'linear-gradient(135deg, #00AEEF 0%, #0070F3 100%)',
        'gradient-purple':  'linear-gradient(135deg, #0070F3 0%, #7C3AED 100%)',
        'gradient-cyan':    'linear-gradient(135deg, #06B6D4 0%, #00AEEF 100%)',
        'gradient-aurora':  'linear-gradient(135deg, #00AEEF 0%, #7C3AED 50%, #06B6D4 100%)',
        'gradient-dark':    'linear-gradient(135deg, #070B18 0%, #0D1529 100%)',
        'gradient-card':    'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        'gradient-radial':  'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':   'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mesh-primary':     'radial-gradient(ellipse 80% 60% at 20% 30%, rgba(0,174,239,0.15) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 70%, rgba(124,58,237,0.12) 0%, transparent 60%)',
      },
      boxShadow: {
        'glow-sm':      '0 0 10px rgba(0, 174, 239, 0.25)',
        'glow':         '0 0 20px rgba(0, 174, 239, 0.35), 0 0 60px rgba(0, 174, 239, 0.15)',
        'glow-lg':      '0 0 40px rgba(0, 174, 239, 0.4), 0 0 100px rgba(0, 174, 239, 0.2)',
        'glow-purple':  '0 0 20px rgba(124, 58, 237, 0.35), 0 0 60px rgba(124, 58, 237, 0.15)',
        'glow-cyan':    '0 0 20px rgba(6, 182, 212, 0.35), 0 0 60px rgba(6, 182, 212, 0.15)',
        'card-premium': '0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.06)',
        'card-hover':   '0 20px 40px rgba(0,0,0,0.2), 0 0 20px rgba(0,174,239,0.1)',
        'inner-glow':   'inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.1)',
        'glass':        '0 8px 32px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-scale': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%':      { transform: 'translateY(-8px) rotate(1deg)' },
          '66%':      { transform: 'translateY(-4px) rotate(-1deg)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-20px)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0,174,239,0.3), 0 0 30px rgba(0,174,239,0.1)' },
          '50%':      { boxShadow: '0 0 30px rgba(0,174,239,0.5), 0 0 80px rgba(0,174,239,0.25)' },
        },
        'gradient-shift': {
          '0%':   { backgroundPosition: '0% 50%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        aurora: {
          '0%':   { transform: 'translateX(-10%) translateY(-10%) scale(1)', opacity: '0.6' },
          '33%':  { transform: 'translateX(5%) translateY(5%) scale(1.05)', opacity: '0.8' },
          '66%':  { transform: 'translateX(-5%) translateY(10%) scale(0.98)', opacity: '0.7' },
          '100%': { transform: 'translateX(-10%) translateY(-10%) scale(1)', opacity: '0.6' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        'ping-slow': {
          '0%':   { transform: 'scale(1)', opacity: '0.8' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-4px)' },
        },
        'typing-dot': {
          '0%, 60%, 100%': { transform: 'translateY(0)' },
          '30%':           { transform: 'translateY(-6px)' },
        },
        'counter-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'border-glow': {
          '0%, 100%': { opacity: '0.4' },
          '50%':      { opacity: '0.9' },
        },
      },
      animation: {
        'accordion-down':  'accordion-down 0.2s ease-out',
        'accordion-up':    'accordion-up 0.2s ease-out',
        'fade-in':         'fade-in 0.4s ease-out',
        'fade-in-up':      'fade-in-up 0.5s ease-out',
        'fade-in-scale':   'fade-in-scale 0.3s ease-out',
        float:             'float 6s ease-in-out infinite',
        'float-slow':      'float-slow 8s ease-in-out infinite',
        'glow-pulse':      'glow-pulse 3s ease-in-out infinite',
        'gradient-shift':  'gradient-shift 8s ease infinite',
        aurora:            'aurora 15s ease-in-out infinite',
        'spin-slow':       'spin-slow 20s linear infinite',
        shimmer:           'shimmer 1.8s infinite',
        'slide-in-right':  'slide-in-right 0.3s ease-out',
        'ping-slow':       'ping-slow 2s cubic-bezier(0,0,0.2,1) infinite',
        'bounce-subtle':   'bounce-subtle 2s ease-in-out infinite',
        'typing-dot':      'typing-dot 1.2s ease-in-out infinite',
        'counter-up':      'counter-up 0.6s ease-out',
        'border-glow':     'border-glow 3s ease-in-out infinite',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
