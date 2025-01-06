/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.ctfassets.net",
        pathname: "/**",
      },
    ],
    domains: [
      "images.ctfassets.net",
      "downloads.ctfassets.net",
      "assets.ctfassets.net",
    ],
  },
};

export default nextConfig;
