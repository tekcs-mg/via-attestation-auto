// Fichier: tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // On s'assure que Tailwind analyse tous les fichiers nécessaires
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Vous pouvez ajouter ici les couleurs de votre charte graphique
      // pour les utiliser directement (ex: bg-via-blue)
      colors: {
        'via-blue-confiance': '#1F308C',
        'via-blue-serenite': '#1478FF',
      }
    },
  },
  plugins: [],
};
