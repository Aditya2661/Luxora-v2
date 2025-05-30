/** @type {import('next').NextConfig} */
const nextConfig = {

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'rukminim2.flixcart.com',
      },
      {
        protocol: 'https',
        hostname: 'em-content.zobj.net', // For your crying emoji
      },
      {
        protocol: 'https',
        hostname: 'media.giphy.com', // For your loading GIF
      }
      // Add any other domains you use here
    ],
},

};

export default nextConfig;
