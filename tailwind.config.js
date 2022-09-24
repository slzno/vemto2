/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/renderer/**/*.{vue,js,ts,jsx,tsx}"],
    theme: {
        extend: {},
        fontFamily: {
            'sans': ['Roboto', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            'mono': ['Roboto Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        }
    },
    plugins: [],
}
