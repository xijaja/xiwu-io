import "@/app/globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Tomorrow, Roboto, Roboto_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { SITE_DESC, SITE_NAME, SITE_URL } from "@/lib/config";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"], // 加载 Latin 子集
  variable: "--font-roboto-mono", // 可选：设置 CSS 变量
});

// export const metadata: Metadata = {
//   title: {
//     default: SITE_NAME,
//     template: SITE_NAME,
//   },
//   description: SITE_DESC,
//   metadataBase: new URL(SITE_URL),
//   openGraph: {
//     title: SITE_NAME,
//     description: SITE_DESC,
//     url: SITE_URL,
//     siteName: SITE_NAME,
//     type: "website",
//   },
//   twitter: {
//     card: "summary_large_image",
//     title: SITE_NAME,
//     description: SITE_DESC,
//   },
//   alternates: {
//     types: {
//       "application/rss+xml": "/rss.xml",
//       "application/atom+xml": "/feed.xml",
//     },
//   },
// };

type MetadataProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HomePage" });

  return {
    title: {
      default: SITE_NAME,
      template: SITE_NAME,
    },
    description: t("description"),
    openGraph: {
      title: SITE_NAME,
      description: t("description"),
      url: SITE_URL,
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_NAME,
      description: t("description"),
    },
    alternates: {
      types: {
        "application/rss+xml": "/rss.xml",
        "application/atom+xml": "/feed.xml",
      },
    },
  };
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function RootLayout({ children, params }: Readonly<Props>) {
  // 获取语言
  const { locale } = await params;
  // 如果语言不支持，返回 404
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  // 设置请求语言
  setRequestLocale(locale);

  return (
    <html lang={locale || "en"} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${robotoMono.variable} antialiased`}>
        {/* 固定网格背景层 */}
        <div
          aria-hidden="true"
          className="fixed inset-0 z-[-1] pointer-events-none dark:hidden"
          style={{
            backgroundImage: "linear-gradient(to right, #e7e5e4 1px, transparent 1px), linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            backgroundPosition: "0 0, 0 0",
            WebkitMaskImage:
              "repeating-linear-gradient(to right, black 0px, black 3px, transparent 3px, transparent 8px), repeating-linear-gradient(to bottom, black 0px, black 3px, transparent 3px, transparent 8px), radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)",
            maskImage:
              "repeating-linear-gradient(to right, black 0px, black 3px, transparent 3px, transparent 8px), repeating-linear-gradient(to bottom, black 0px, black 3px, transparent 3px, transparent 8px), radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)",
            maskComposite: "intersect",
            WebkitMaskComposite: "source-in",
          }}
        />
        <div
          aria-hidden="true"
          className="fixed inset-0 z-[-1] pointer-events-none hidden dark:block"
          style={{
            backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            backgroundPosition: "0 0, 0 0",
            WebkitMaskImage:
              "repeating-linear-gradient(to right, black 0px, black 3px, transparent 3px, transparent 8px), repeating-linear-gradient(to bottom, black 0px, black 3px, transparent 3px, transparent 8px), radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)",
            maskImage:
              "repeating-linear-gradient(to right, black 0px, black 3px, transparent 3px, transparent 8px), repeating-linear-gradient(to bottom, black 0px, black 3px, transparent 3px, transparent 8px), radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)",
            maskComposite: "intersect",
            WebkitMaskComposite: "source-in",
          }}
        />

        <NextIntlClientProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
