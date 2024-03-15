/** @type {import('tailwindcss').Config} */

const colors = require('tailwindcss/colors')

module.exports = {
    darkMode: 'class',
    content: ["./src/renderer/**/*.{vue,js,ts,jsx,tsx}", "./src/common/models/page/components/**/*.{js,ts}"],
    theme: {
        extend: {
            blur: {
                'xs': '1px',
            },
            transitionDuration: {
                '1500': '1500ms',
                '2000': '2000ms',
                '2500': '2500ms',
                '3000': '3000ms',
            },
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
                50: '#f8fafc',
                350: '#b8c3d1',
                370: '#a7b3c2',
                450: '#7e90a8',
                470: '#778ba3',
                650: '#2E3A48',
                750: '#1F2D3D',
                850: '#152033',
                950: '#091023',
                970: '#070e21',
                980: '#050b1c',
                990: '#03091a',
            },
            red: {
                ...colors.red,
                450: '#F45B5B',
            }

        },
        fontFamily: {
            sans: ["Figtree", "Roboto", "ui-sans-serif", "system-ui", "sans-serif"],
            mono: [
                // "IBM Plex Mono",
                "Roboto Mono",
                "ui-monospace",
                "SFMono-Regular",
                "monospace",
            ],
            serif: [
                "Roboto Serif", 
                "ui-serif", 
                "Georgia", 
                "Cambria", 
                "Times New Roman", 
                "Times", 
                "serif"
            ],
        },
    },
    plugins: [
        require('tailwind-scrollbar'),
        require('@tailwindcss/forms'),
    ],
}
