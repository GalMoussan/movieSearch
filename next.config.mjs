/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["openai", "@anthropic-ai/sdk"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/embed",
        headers: [
          {
            key: "X-Frame-Options",
            value: "ALLOW-FROM https://www.galmoussan.com",
          },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://www.galmoussan.com https://galmoussan.com",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
