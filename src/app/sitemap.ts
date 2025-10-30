import type { MetadataRoute } from "next";
import { DEFAULT_LOCALE, LOCALES } from "@/i18n/routing";
import { collectAllSlugs, getPostBySlug } from "@/lib/blog";
import { SITE_URL } from "@/lib/config";

// 使用统一 blog API

// 生成语言前缀路径
function getLocalePath(locale: string, pagePath: string): string {
  if (locale === DEFAULT_LOCALE) {
    return pagePath;
  }
  return `/${locale}${pagePath}`;
}

// 生成多语言 alternates
function generateAlternates(pagePath: string): Record<string, string> {
  const alternates: Record<string, string> = {};

  for (const locale of LOCALES) {
    alternates[locale] = new URL(getLocalePath(locale, pagePath), SITE_URL).toString();
  }

  // 添加 x-default 指向默认语言
  alternates["x-default"] = new URL(getLocalePath(DEFAULT_LOCALE, pagePath), SITE_URL).toString();

  return alternates;
}

// 通过统一 API 判断文章是否存在并取修改时间
async function checkBlogExists(locale: string, slug: string): Promise<{ exists: boolean; lastModified?: Date }> {
  const post = await getPostBySlug(locale, slug);
  if (!post) {
    return { exists: false };
  }
  const lastModified = post.data?.date ? new Date(post.data.date) : undefined;
  return { exists: true, lastModified };
}

// 生成静态页面的 sitemap 条目
function generateStaticPageEntries(): MetadataRoute.Sitemap {
  const staticPages = [
    { path: "/", priority: 1.0 },
    { path: "/blog", priority: 0.8 },
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const page of staticPages) {
    for (const locale of LOCALES) {
      const localePath = getLocalePath(locale, page.path);
      entries.push({
        url: new URL(localePath, SITE_URL).toString(),
        lastModified: new Date(),
        alternates: {
          languages: generateAlternates(page.path),
        },
        priority: page.priority,
      });
    }
  }

  return entries;
}

// 生成博客文章的 sitemap 条目
async function generateBlogEntries(allBlogSlugs: Set<string>): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const slug of allBlogSlugs) {
    const blogPath = `/blog/${slug}`;

    for (const locale of LOCALES) {
      const { exists, lastModified } = await checkBlogExists(locale, slug);

      if (exists) {
        const localePath = getLocalePath(locale, blogPath);
        entries.push({
          url: new URL(localePath, SITE_URL).toString(),
          lastModified: lastModified ?? new Date(),
          alternates: {
            languages: generateAlternates(blogPath),
          },
          priority: 0.6,
        });
      }
    }
  }

  return entries;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const allBlogSlugs = await collectAllSlugs();
  const staticEntries = generateStaticPageEntries();
  const blogEntries = await generateBlogEntries(allBlogSlugs);

  return [...staticEntries, ...blogEntries];
}
