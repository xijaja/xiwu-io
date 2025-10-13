import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // 匹配所有路径，除了
  // - … 如果它们以 `/api`, `/trpc`, `/_next` 或 `/_vercel` 开头
  // - … 包含点 (e.g. `favicon.ico`)
  // matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'

  matcher: [
    // 重定向到匹配的语言
    '/',

    // 设置 cookie 来记住之前的语言
    // 所有请求都有语言前缀
    '/(en|zh)/:path*',

    // 重定向到添加缺失的语言
    // (e.g. `/pathnames` -> `/en/pathnames`)
    '/((?!api|_next|_vercel|.*\\.|favicon.ico).*)'
  ]
};