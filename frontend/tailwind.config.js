const { fontFamily } = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter var", ...fontFamily.sans],
        serif: ["Playfair Display", "Georgia", "serif"],
        luxury: ["Playfair Display", "Georgia", "serif"],
      },
      borderRadius: {
        DEFAULT: "8px",
        secondary: "4px",
        container: "12px",
      },
      boxShadow: {
        DEFAULT: "0 1px 4px rgba(0, 0, 0, 0.1)",
        hover: "0 2px 8px rgba(0, 0, 0, 0.12)",
      },
      colors: {
        primary: {
          DEFAULT: "#000000", // Black
          hover: "#1a1a1a",
          light: "#333333",
        },
        secondary: {
          DEFAULT: "#22c55e", // Green
          hover: "#16a34a",
          light: "#4ade80",
        },
        accent: {
          DEFAULT: "#ffffff", // White
          hover: "#f8fafc",
          light: "#ffffff",
        },
        black: "#000000",
        green: "#22c55e", 
        white: "#ffffff",
      },
      spacing: {
        "form-field": "16px",
        section: "32px",
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(45, 80, 22, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(45, 80, 22, 0.6)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  variants: {
    extend: {
      boxShadow: ["hover", "active"],
    },
  },
};