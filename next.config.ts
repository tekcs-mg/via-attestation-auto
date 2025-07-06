import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Désactive la vérification ESLint uniquement pendant la commande `build`.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Désactive la vérification des types TypeScript pendant la commande `build`.
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // Celui-ci est pour l'image de secours
      },
      // --- AJOUTEZ CETTE SECTION ---
      {
        protocol: 'https',
        hostname: 'www.via-assurance.mg',
      },
      // -----------------------------
    ],
  },
};

export default nextConfig;
