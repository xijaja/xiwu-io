import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  // 严格模式
  reactStrictMode: true,

  // 优化输出
  output: "standalone",

  // 允许从这些远程域加载图片，供 <Image> 使用
  // 如果使用的模型返回的图片域不同，需要在此添加相应域名
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.xiwu.me",
      },
      {
        protocol: "https",
        hostname: "th.bing.com",
      },
    ],
  },
};

// 使用 next-intl 插件
const withNextIntl = createNextIntlPlugin();

// export default nextConfig;
export default withNextIntl(nextConfig);
