import { readdir, readFile } from "fs/promises";
import matter from "gray-matter";
import { NextResponse } from "next/server";
import path from "path";
import { SITE_DESC, SITE_NAME, SITE_URL } from "@/lib/config";
import { routing, DEFAULT_LOCALE } from "@/i18n/routing";

export const dynamic = "error"; // 禁止动态路由
export const revalidate = false; // 禁止缓存

type Params = { params: Promise<{ locale: string }> } | { params: { locale: string } };

export async function GET(_req: Request, ctx?: Params) {
  const site = SITE_URL;
  const title = SITE_NAME;
  const description = SITE_DESC;

  // 解析 locale 参数（兼容 Promise 包裹）
  const rawParams = ctx?.params as any;
  const resolvedParams = typeof rawParams?.then === "function" ? await rawParams : rawParams;
  const locale: string | undefined = resolvedParams?.locale;
  // 如果 locale 不存在或不支持，则返回 404
  if (!(locale && routing.locales.includes(locale as (typeof routing.locales)[number]))) {
    return new NextResponse("Invalid locale", { status: 404 });
  }
  // 获取博客目录
  const blogDir = path.join(process.cwd(), "src", "content", "blogs", locale);
  // 获取博客文件列表
  let files: string[] = [];
  try {
    files = await readdir(blogDir);
  } catch {
    return new NextResponse("Locale not found", { status: 404 });
  }

  // 获取博客 frontmatter 数据列表
  const items: Array<{
    slug: string;
    title?: string;
    date?: string;
    description?: string;
  }> = [];

  for (const f of files.filter((f) => f.endsWith(".mdx"))) {
    const source = await readFile(path.join(blogDir, f), "utf8");
    const { data } = matter(source);
    if (data?.draft === true) continue;
    const fmSlug = typeof data?.slug === "string" && data.slug.trim().length > 0 ? data.slug : undefined;
    const slug = fmSlug ?? f.replace(/\.mdx$/, "");
    items.push({
      slug,
      title: data?.title,
      date: data?.date,
      description: data?.description,
    });
  }

  // 如果是默认语言，则不加语言前缀，否则加语言前缀
  const localePrefix = locale === DEFAULT_LOCALE ? "" : `/${locale}`;

  // 生成 RSS 项
  const feedItems = items
    .sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime())
    .map(
      (i) => `
      <item>
        <title><![CDATA[${i.title ?? i.slug}]]></title>
        <link>${site}${localePrefix}/blog/${i.slug}</link>
        <guid>${site}${localePrefix}/blog/${i.slug}</guid>
        ${i.date ? `<pubDate>${new Date(i.date).toUTCString()}</pubDate>` : ""}
        ${i.description ? `<description><![CDATA[${i.description}]]></description>` : ""}
      </item>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
      <title><![CDATA[${title} (${locale})]]></title>
      <link>${site}${localePrefix}</link>
      <description><![CDATA[${description}]]></description>
      ${feedItems}
    </channel>
  </rss>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
