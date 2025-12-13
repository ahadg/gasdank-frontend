/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: true,

  images: {
    domains: ['manapnl.com'],
  },
};

module.exports = nextConfig;
