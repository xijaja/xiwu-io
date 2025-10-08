// 站点配置：用于 SEO（OG、订阅源、robots、sitemap）等场景的统一来源
// 生产环境优先通过环境变量配置，本地开发使用下方默认值
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://xiwu.io";
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "xiwu.io";
export const SITE_DESC = process.env.NEXT_PUBLIC_SITE_DESC ?? "A Next.js blog";
