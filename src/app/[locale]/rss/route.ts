import { readdir, readFile } from "fs/promises";
import matter from "gray-matter";
import { NextResponse } from "next/server";
import path from "path";
import { SITE_DESC, SITE_NAME, SITE_URL } from "@/lib/config";

export async function GET() {
  const site = SITE_URL;
  const title = SITE_NAME;
  const description = SITE_DESC;

  const blogDir = path.join(process.cwd(), "src", "content", "blogs");
  const files = await readdir(blogDir);
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

  const feedItems = items
    .sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime())
    .map(
      (i) => `
      <item>
        <title><![CDATA[${i.title ?? i.slug}]]></title>
        <link>${site}/blog/${i.slug}</link>
        <guid>${site}/blog/${i.slug}</guid>
        ${i.date ? `<pubDate>${new Date(i.date).toUTCString()}</pubDate>` : ""}
        ${i.description ? `<description><![CDATA[${i.description}]]></description>` : ""}
      </item>`
    )
    .join("");

  const xml = `<rss version="2.0">
    <channel>
      <title><![CDATA[${title}]]></title>
      <link>${site}</link>
      <description><![CDATA[${description}]]></description>
      ${feedItems}
    </channel>
  </rss>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
