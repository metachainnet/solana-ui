/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /**
   *
   * @param {import('next/dist/server/config-shared').NextJsWebpackConfig} config
   */
  webpack(config) {
    config.experiments = {
      asyncWebAssembly: true,
    };
    return config;
  },

  images: {
    domains: ["raw.githubusercontent.com"],
  },
};

module.exports = nextConfig;
