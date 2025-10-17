import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  // 获取请求语言
  let locale = await requestLocale;
  // 如果请求语言以 zh 开头，则设置为 zh，否则设置为 en
  if (locale?.startsWith("zh")) {
    locale = "zh";
  } else {
    locale = "en";
  }

  // 如果请求语言不支持，则设置为默认语言
  if (!(locale && routing.locales.includes(locale as any))) {
    return {
      locale: routing.defaultLocale,
      messages: (await import(`./messages/${routing.defaultLocale}.json`)).default,
    };
  }
  // 返回请求语言和消息
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
