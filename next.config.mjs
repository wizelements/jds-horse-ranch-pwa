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
};

export default config;
