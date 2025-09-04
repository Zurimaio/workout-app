/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./src/**/*.{js,jsx}"],

    theme: {
        extend: {
            colors: {
                brand: {
                    DEFAULT: "#0B1D3A", // Blu Notte principale
                    light: "#142E4D", // Blu Notte chiaro (per card, modali)
                    dark: "#08132A", // Blu Notte scuro (opzionale)
                },
                sage: {
                    DEFAULT: "#A3B18A", // Verde salvia principale (bottoni)
                    dark: "#90A17D", // Verde salvia scuro (hover)
                    light: "#B7C6A2", // Verde salvia chiaro (opzionale)
                },
                offwhite: "#F5F5F0", // Bianco sporco (testo)
            },
        },
    },

    plugins: [],
};