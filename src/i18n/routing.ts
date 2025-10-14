import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

// 支持的语言
export const LOCALES = ["en", "zh"];
// 默认语言
export const DEFAULT_LOCALE = "en";
// 语言名称
export const LOCALE_NAMES: Record<string, string> = {
  en: "English",
  zh: "中文",
};

// 本地化文本
export interface LocalizedText {
  zh: string;
  en: string;
}

// 类型安全的获取本地化文本的函数
export const getLocalizedText = (
  text: LocalizedText,
  locale: Locale
): string => {
  return text[locale as keyof typeof text];
};

export const routing = defineRouting({
  // 支持的所有语言的列表
  locales: LOCALES,

  // 当没有匹配到语言时，使用默认语言
  defaultLocale: DEFAULT_LOCALE,

  // 是否检测语言
  localeDetection: process.env.NEXT_PUBLIC_LOCALE_DETECTION === "on",

  // 语言前缀
  localePrefix: "as-needed",
});

// 围绕 Next.js 导航API的轻量级包装器，考虑路由配置
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
export type Locale = (typeof routing.locales)[number];
