/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Often helpful to disable for Leaflet in dev mode to prevent double mounting issues
  images: {
    domains: ['picsum.photos'],
  },
};

export default nextConfig;