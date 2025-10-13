// Atom 订阅源：作为 RSS 的补充，部分阅读器偏好 Atom 格式
// - 过滤 draft:true
// - 使用 frontmatter.slug 优先构造链接

import { readdir, readFile } from "fs/promises";
import matter from "gray-matter";
import { NextResponse } from "next/server";
import path from "path";
import { SITE_DESC, SITE_NAME, SITE_URL } from "@/lib/config";

export async function GET() {
  const blogDir = path.join(process.cwd(), "src", "content", "blogs");
  const files = await readdir(blogDir);

  const entries: Array<{
    slug: string;
    title?: string;
    date?: string;
    description?: string;
  }> = [];
  for (const f of files.filter((f) => f.endsWith(".mdx"))) {
    const source = await readFile(path.join(blogDir, f), "utf8");
    const { data } = matter(source);
    if (data?.draft === true) continue;
    const fmSlug =
      typeof data?.slug === "string" && data.slug.trim().length > 0
        ? data.slug
        : undefined;
    const slug = fmSlug ?? f.replace(/\.mdx$/, "");
    entries.push({
      slug,
      title: data?.title,
      date: data?.date,
      description: data?.description,
    });
  }

  const updated = entries.reduce<string | undefined>((acc, e) => {
    if (!e.date) return acc;
    const iso = new Date(e.date).toISOString();
    return !acc || iso > acc ? iso : acc;
  }, undefined);

  const items = entries
    .sort(
      (a, b) =>
        new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime()
    )
    .map(
      (e) => `
      <entry>
        <title><![CDATA[${e.title ?? e.slug}]]></title>
        <link href="${SITE_URL}/blog/${e.slug}" />
        <id>${SITE_URL}/blog/${e.slug}</id>
        ${e.date ? `<updated>${new Date(e.date).toISOString()}</updated>` : ""}
        ${e.description ? `<summary type="html"><![CDATA[${e.description}]]></summary>` : ""}
      </entry>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="utf-8"?>
  <feed xmlns="http://www.w3.org/2005/Atom">
    <title><![CDATA[${SITE_NAME}]]></title>
    <link href="${SITE_URL}/feed.xml" rel="self" />
    <link href="${SITE_URL}" />
    <id>${SITE_URL}</id>
    <updated>${updated ?? new Date().toISOString()}</updated>
    <subtitle><![CDATA[${SITE_DESC}]]></subtitle>
    ${items}
  </feed>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/atom+xml; charset=utf-8" },
  });
}
