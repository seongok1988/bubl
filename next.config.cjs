/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // 이미지 최적화 도메인 설정 (필요 시 추가)
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  // 보안 헤더
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },

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
