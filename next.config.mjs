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
            value: "ALLOW-FROM https://galmoussan.vercel.app",
          },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://galmoussan.vercel.app",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
