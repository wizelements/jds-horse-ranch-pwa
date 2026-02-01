/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.websitepro-cdn.com",
        pathname: "/**",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  redirects: async () => {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "jds-horse-ranch-pwa.vercel.app",
          },
        ],
        destination: "https://jdshorseranch.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default config;
