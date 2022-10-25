/** @type {import('tailwindcss').Config} */

const colors = require('tailwindcss/colors')

module.exports = {
    darkMode: 'class',
    content: ["./src/renderer/**/*.{vue,js,ts,jsx,tsx}"],
    theme: {
        extend: {
            blur: {
                'xs': '1px',
            }
        },
        colors: {
            transparent: 'transparent',
            current: 'currentColor',
            black: colors.black,
            white: colors.white,
            gray: colors.gray,
            red: colors.red,
            yellow: colors.amber,
            green: colors.green,
            blue: colors.blue,
            pink: colors.pink,
            indigo: colors.indigo,
            purple: colors.purple,
            teal: colors.teal,
            cyan: colors.cyan,
            orange: colors.orange,
            lime: colors.lime,
            emerald: colors.emerald,
            rose: colors.rose,
            fuchsia: colors.fuchsia,
            violet: colors.violet,
            slate: {
                ...colors.slate,
                850: '#152033',
                950: '#091023',
            }

        },
        fontFamily: {
            sans: ["Roboto", "ui-sans-serif", "system-ui", "sans-serif"],
            mono: [
                "Roboto Mono",
                "ui-monospace",
                "SFMono-Regular",
                "monospace",
            ],
        },
    },
    plugins: [
        require('tailwind-scrollbar'),
        require('@tailwindcss/forms'),
    ],
}
