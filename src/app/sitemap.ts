import { readdir, readFile } from "fs/promises";
import matter from "gray-matter";
import type { MetadataRoute } from "next";
import path from "path";
import { SITE_URL } from "@/lib/config";
import { LOCALES, DEFAULT_LOCALE } from "@/i18n/routing";

// 生成语言前缀路径
function getLocalePath(locale: string, path: string): string {
  if (locale === DEFAULT_LOCALE) {
    return path;
  }
  return `/${locale}${path}`;
}

// 生成多语言 alternates
function generateAlternates(path: string): Record<string, string> {
  const alternates: Record<string, string> = {};
  
  for (const locale of LOCALES) {
    alternates[locale] = new URL(getLocalePath(locale, path), SITE_URL).toString();
  }
  
  // 添加 x-default 指向默认语言
  alternates["x-default"] = new URL(getLocalePath(DEFAULT_LOCALE, path), SITE_URL).toString();
  
  return alternates;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // 收集所有博客文章的 slug
  const allBlogSlugs = new Set<string>();
  
  for (const locale of LOCALES) {
    const blogDir = path.join(process.cwd(), "src", "content", "blogs", locale);
    try {
      const files = await readdir(blogDir);
      for (const f of files.filter((f) => f.endsWith(".mdx"))) {
        const source = await readFile(path.join(blogDir, f), "utf8");
        const { data } = matter(source);
        if (data?.draft === true) continue;
        const fmSlug = typeof data?.slug === "string" && data.slug.trim().length > 0 ? data.slug : undefined;
        const slug = fmSlug ?? f.replace(/\.mdx$/, "");
        allBlogSlugs.add(slug);
      }
    } catch {
      // 忽略不存在的目录
    }
  }

  // 静态页面
  const staticPages = [
    { path: "/", priority: 1.0 },
    { path: "/blog", priority: 0.8 },
  ];

  // 为每个静态页面生成多语言条目
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

  // 为每个博客文章生成多语言条目
  for (const slug of allBlogSlugs) {
    const blogPath = `/blog/${slug}`;
    
    for (const locale of LOCALES) {
      // 检查该语言版本是否存在
      const blogDir = path.join(process.cwd(), "src", "content", "blogs", locale);
      let lastModified: Date | undefined;
      let exists = false;
      
      try {
        const filePath = path.join(blogDir, `${slug}.mdx`);
        const source = await readFile(filePath, "utf8");
        const { data } = matter(source);
        if (data?.draft !== true) {
          exists = true;
          if (data?.date) lastModified = new Date(data.date);
        }
      } catch {
        // 该语言版本不存在
      }
      
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
