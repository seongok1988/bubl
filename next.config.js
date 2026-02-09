/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      if (Array.isArray(config.externals)) {
        config.externals.push('undici')
      } else if (config.externals) {
        config.externals = [config.externals, 'undici']
      } else {
        config.externals = ['undici']
      }
    } else {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        undici: false,
      }
    }
    return config
  },
}

module.exports = nextConfig
