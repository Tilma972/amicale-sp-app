/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**', // Autorise toutes les images venant de ce domaine
      },
      {
        protocol: 'https',
        hostname: 'photo.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'unsplash.com',
        port: '',
        pathname: '/**',
      },
      // Si vous utilisez des images d'autres domaines, ajoutez-les ici
      // Par exemple, pour les avatars de Supabase :
      // {
      //   protocol: 'https',
      //   hostname: 'votre-id-projet.supabase.co',
      // },
    ],
  },
};

module.exports = nextConfig;
