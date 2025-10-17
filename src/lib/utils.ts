import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 格式化日期
export function formatDate(locale: string, date: string) {
  // 如果 locale 是 zh，则返回中文日期，例如：2025年1月1日
  // 如果 locale 是 en，则返回英文日期，例如：January 1, 2025
  // if (locale === "zh") {
  //   return new Date(date).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
  // } else {
  //   return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  // }
  // 如果 locale 是 zh，则返回中文日期，例如：2025年1月
  // 如果 locale 是 en，则返回英文日期，例如：January 2025
  if (locale === "zh") {
    return new Date(date).toLocaleDateString("zh-CN", { year: "numeric", month: "long" });
  }
    return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long" });
}
