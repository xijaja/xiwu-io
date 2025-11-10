import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  // 严格模式
  reactStrictMode: true,

  // 缓存组件
  cacheComponents: true,

  // 缓存生命周期配置
  cacheLife: {
    blog: {
      // 开发环境使用 1 秒，生产环境使用 1 小时
      stale: process.env.NODE_ENV === "development" ? 1 : 3600,
      revalidate: process.env.NODE_ENV === "development" ? 1 : 3600,
      expire: process.env.NODE_ENV === "development" ? 1 : 86400,
    },
  },

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

  // 实验特性配置
  experimental: {
    // 在终端中显示浏览器调试信息
    browserDebugInfoInTerminal: true,
    // 文件系统缓存
    turbopackFileSystemCacheForDev: true,
  },
};

// 使用 next-intl 插件
const withNextIntl = createNextIntlPlugin();

// export default nextConfig;
export default withNextIntl(nextConfig);
