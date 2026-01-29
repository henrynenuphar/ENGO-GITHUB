/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class', // Enable manual dark mode toggle
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    blue: '#008BFF', // Primary Brand Color
                    lightBlue: '#E6F4FF', // Backgrounds
                    darkBlue: '#0056A3', // Hover states
                    yellow: '#FFD700', // Accents/Stars
                    orange: '#FF8C00', // Buttons/Gamification
                },
            },
            fontFamily: {
                sans: ['"Nunito"', 'sans-serif'], // Friendly, rounded font for kids
            },
            animation: {
                'bounce-slow': 'bounce 3s infinite',
                'wiggle': 'wiggle 1s ease-in-out infinite',
            },
            keyframes: {
                wiggle: {
                    '0%, 100%': { transform: 'rotate(-3deg)' },
                    '50%': { transform: 'rotate(3deg)' },
                }
            }
        },
    },
    plugins: [],
}
