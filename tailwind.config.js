// let predefindedPaddingSize = [...Array(61).keys()].map(x => {
//   let val = x * .5;
//   return `[${val}rem]`;
// }); 

let safelist = [
  // ... predefindedPaddingSize.map(size => 'pl-' + size),
  // ... predefindedPaddingSize.map(size => 'pt-' + size),
  // ... predefindedPaddingSize.map(size => 'pb-' + size),
  // ... predefindedPaddingSize.map(size => 'mt-' + size),
  // ... predefindedPaddingSize.map(size => 'mb-' + size),
  // ... predefindedPaddingSize.map(size => 'md:pt-' + size),
  // ... predefindedPaddingSize.map(size => 'md:pb-' + size),
  // ... predefindedPaddingSize.map(size => 'md:mt-' + size),
  // ... predefindedPaddingSize.map(size => 'md:mb-' + size),
  {
    pattern: /bg-(primary|secondary|tertiary|salmon|yellow|blue|orange|success|warning|error|neutral|transparent)-(0|100|200|300|400|500|600|700|800|900)/,
    variants: ['lg', 'hover', 'focus', 'lg:hover'],
  },
  {
    pattern: /text-(primary|secondary|tertiary|salmon|yellow|blue|orange|success|warning|error|neutral|transparent)-(0|100|200|300|400|500|600|700|800|900)/,
    variants: ['lg', 'hover', 'focus', 'lg:hover'],
  },
  {
    pattern: /border-(primary|secondary|tertiary|salmon|yellow|blue|orange|success|warning|error|neutral|transparent)-(0|100|200|300|400|500|600|700|800|900)/,
    variants: ['lg', 'hover', 'focus', 'lg:hover'],
  },
  {
    pattern: /fill-(primary|secondary|tertiary|salmon|yellow|blue|orange|success|warning|error|neutral|transparent)-(0|100|200|300|400|500|600|700|800|900)/,
    variants: ['lg', 'hover', 'focus', 'lg:hover'],
  },
  {
    pattern: /shadow-(primary|secondary|tertiary|salmon|yellow|blue|orange|success|warning|error|neutral|transparent)-(0|100|200|300|400|500|600|700|800|900)/,
    variants: ['lg', 'hover', 'focus', 'lg:hover'],
  },
  {
    pattern: /stroke-(primary|secondary|tertiary|salmon|yellow|blue|orange|success|warning|error|neutral|transparent)-(0|100|200|300|400|500|600|700|800|900)/,
    variants: ['lg', 'hover', 'focus', 'lg:hover'],
  },
  'display',
  'headline-1',
  'headline-2',
  'headline-3',
  'headline-4',
  'headline-5',
  'headline-6',
  'body-large',
  'body-medium',
  'body-small',
  'display-lg',
  'headline-1-lg',
  'headline-2-lg',
  'headline-3-lg',
  'headline-4-lg',
  'headline-5-lg',
  'headline-6-lg',
  'body-large-lg',
  'body-medium-lg',
  'body-small-lg',
  'font-black',
  'font-extrabold',
  'font-bold',
  'font-semibold',
  'font-normal',
  'font-headline',
  'font-body',
  'w-1/2',
  'w-1/3',
  'w-1/4',
  'w-1/5',
  'w-1/6',
  'lg:w-1/2',
  'lg:w-1/3',
  'lg:w-1/4',
  'lg:w-1/5',
  'lg:w-1/6'
];

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./sections/*.liquid",
    "./snippets/*.liquid",
    "./templates/**/*.liquid",
    "./layout/*.liquid",
    "./src/vue/components/*.vue"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          0: '#ECF5F2',
          100: '#ECF5F2',
          200: '#E3F4EF',
          300: '#E3F4EF',
          400: '#D9F4EB',
          500: '#D9F4EB',
          600: '#D0F3E8',
          700: '#D0F3E8',
          800: '#C7F3E5',
          900: '#C7F3E5'
        },
        secondary: {
          0: '#CECCC9',
          100: '#CECCC9',
          200: '#CECCC9',
          300: '#CECCC9',
          400: '#A6A29D',
          500: '#A6A29D',
          600: '#7F7972',
          700: '#7F7972',
          800: '#574F46',
          900: '#30261A'
        },
        tertiary: {
          100: '#F6F1E7',
          200: '#F6F1E7',
          300: '#F6F1E7',
          400: '#F6F1E7',
          500: '#F6F1E7',
          600: '#F6F1E7',
          700: '#F6F1E7',
          800: '#F6F1E7',
          900: '#F6F1E7'
        },
        quaternary: {
          100: '#3A8DAD',
          200: '#3A8DAD',
          300: '#3A8DAD',
          400: '#3A8DAD',
          500: '#3A8DAD',
          600: '#3A8DAD',
          700: '#3A8DAD',
          800: '#3A8DAD',
          900: '#3A8DAD'        
        },
        blue: {
          0: '#C4E0F7',
          100: '#C4E0F7',
          200: '#93CAF9',
          300: '#93CAF9',
          400: '#62B5FB',
          500: '#62B5FB',
          600: '#319FFD',
          700: '#319FFD',
          800: '#008AFF',
          900: '#008AFF'
        },
        yellow: {
          0: '#F7ECC4',
          100: '#F7ECC4',
          200: '#F9E493',
          300: '#F9E493',
          400: '#FBDB62',
          500: '#FBDB62',
          600: '#FDD331',
          700: '#FDD331',
          800: '#FFCA00',
          900: '#FFCA00'
        },
        salmon: {
          0: '#F7E5E4',
          100: '#F7E5E4',
          200: '#F9D5D3',
          300: '#F9D5D3',
          400: '#FBC6C3',
          500: '#FBC6C3',
          600: '#FDB6B2',
          700: '#FDB6B2',
          800: '#FFA6A1',
          900: '#FFA6A1'
        },
        orange: {
          0: '#F7D8CB',
          100: '#F7D8CB',
          200: '#F9BAA0',
          300: '#F9BAA0',
          400: '#FB9D76',
          500: '#FB9D76',
          600: '#FD7F4B',
          700: '#FD7F4B',
          800: '#FF6221',
          900: '#FF6221'
        },
        success: {
          0: '#AEF1C6',
          100: '#9CEEBA',
          200: '#79E8A2',
          300: '#57E28A',
          400: '#34DC72',
          500: '#22C55E',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B'
        },
        warning: {
          0: '#FCE4BB',
          100: '#FBDCA8',
          200: '#FACD81',
          300: '#F8BD59',
          400: '#F7AE32',
          500: '#F59E0B',
          600: '#CF8508',
          700: '#A86C07',
          800: '#805305',
          900: '#593904'
        },
        error: {
          0: '#DA0000',
          100: '#DA0000',
          200: '#DA0000',
          300: '#DA0000',
          400: '#DA0000',
          500: '#DA0000',
          600: '#DA0000',
          700: '#DA0000',
          800: '#DA0000',
          900: '#DA0000'
        },
        neutral: {
          0: '#FFFFFF',
          100: '#FFFFFF',
          200: '#FFFFFF',
          300: '#FFFFFF',
          400: '#FFFFFF',
          500: '#FFFFFF',
          600: '#FFFFFF',
          700: '#FFFFFF',
          800: '#FFFFFF',
          900: '#FFFFFF'
        },
        transparent: {
          0: 'transparent',
          100: 'transparent',
          200: 'transparent',
          300: 'transparent',
          400: 'transparent',
          500: 'transparent',
          600: 'transparent',
          700: 'transparent',
          800: 'transparent',
          900: 'transparent'
        },
        'header-text-color': 'rgb(255 255 255 / <alpha-value>)',
        'footer-text-color': 'rgb(255 255 255 / <alpha-value>)',
      },
      fontSize: {
        'display': ['56px', '100%'],
        'headline-1': ['40px', '1.25em'],
        'headline-2': ['36px', '1.25em'],
        'headline-3': ['32px', '1.25em'],
        'headline-4': ['28px', '1.25em'],
        'headline-5': ['24px', '1.25em'],
        'headline-6': ['20px', '1.25em'],
        'body-large': ['18px', '1.25em'],
        'body-medium': ['16px', '1.25em'],
        'body-small': ['14px', '1.25em'],
        'button': ['18px', '1.25em'],

        'display-lg': ['64px', '100%'],
        'headline-1-lg': ['48px', '1.25em'],
        'headline-2-lg': ['40px', '1.25em'],
        'headline-3-lg': ['36px', '1.25em'],
        'headline-4-lg': ['32px', '1.25em'],
        'headline-5-lg': ['24px', '1.25em'],
        'headline-6-lg': ['20px', '1.25em'],
        'body-large-lg': ['18px', '1.25em'],
        'body-medium-lg': ['16px', '1.25em'],
        'body-small-lg': ['14px', '1.25em'],
        'button-lg': ['18px', '1.25em'],
      },
      fontFamily: {
        'headline': ['"RP"', 'Arial', 'sans-serif'],
        'body': ['"BatonTurbo"', 'Arial', 'sans-serif'],
      },
      maxWidth: {
        'narrow-container': '23.875rem',
        'container': '41.625rem',
        'container-lg': '81rem',
        'container-xl': '111rem',
        'container-2xl': '120rem',
        'container-3xl': '120rem',
        'form-container': '30rem',
      },
      spacing: {
        'container-gutter-lg': '4.5rem',
        'container-gutter': '1rem',
        'gutter-lg': '0.75rem',
        'gutter': '0.5rem',

        'header-padding-y': '.625rem',
        'site-header-height-lg': '6.5rem',
        'site-header-height-announcement-lg': '6.75rem',
        'site-header-height': '4.5rem',
        'site-header-height-announcement': '6.70rem',

        'button-y': '.75rem',
        'button-x': '1rem',
        'field-y': '0.6875rem',
        'field-x': '1rem',

        'full': '100%'
      },
      transitionDuration: {
        'animation-speed': '300ms'
      },
    },
  },
  safelist: safelist,
  plugins: [
    require('tw-elements/dist/plugin')
  ]
}
