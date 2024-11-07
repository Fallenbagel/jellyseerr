/**
 * @type {import('next').NextConfig}
 */
module.exports = {
  env: {
    commitTag: process.env.COMMIT_TAG || 'local',
  },
  images: {
    remotePatterns: [
      { hostname: 'gravatar.com' },
      { hostname: 'image.tmdb.org' },
    ],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.(js|ts)x?$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
  experimental: {
    scrollRestoration: true,
    largePageDataBytes: 256000,
  },
};
