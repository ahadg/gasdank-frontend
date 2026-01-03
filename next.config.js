/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: true,

  images: {
    domains: ['pnlsystem.ca'],
  },
};

module.exports = nextConfig;
