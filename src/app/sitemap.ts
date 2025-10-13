import { readdir, readFile } from "fs/promises";
import matter from "gray-matter";
import type { MetadataRoute } from "next";
import path from "path";
import { SITE_URL } from "@/lib/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;

  // 静态路由：保持精简，避免过期条目
  const staticRoutes = ["/", "/about", "/blog"];

  const blogDir = path.join(process.cwd(), "src", "content", "blogs");
  let blogRoutes: string[] = [];
  try {
    const files = await readdir(blogDir);
    blogRoutes = [];
    for (const f of files.filter((f) => f.endsWith(".mdx"))) {
      const source = await readFile(path.join(blogDir, f), "utf8");
      const { data } = matter(source);
      if (data?.draft === true) continue;
      const fmSlug =
        typeof data?.slug === "string" && data.slug.trim().length > 0
          ? data.slug
          : undefined;
      const slug = fmSlug ?? f.replace(/\.mdx$/, "");
      blogRoutes.push("/blog/" + slug);
    }
  } catch {
    blogRoutes = [];
  }

  const entries: MetadataRoute.Sitemap = [];

  // 静态路由
  for (const route of staticRoutes) {
    entries.push({
      url: new URL(route, baseUrl).toString(),
      lastModified: new Date(),
    });
  }

  // 博客路由，若 frontmatter 有 date 则使用
  for (const route of blogRoutes) {
    let lastModified: Date | undefined;
    try {
      const slug = route.split("/").pop()!;
      const filePath = path.join(blogDir, `${slug}.mdx`);
      const source = await readFile(filePath, "utf8");
      const { data } = matter(source);
      if (data?.date) lastModified = new Date(data.date);
    } catch {}
    entries.push({
      url: new URL(route, baseUrl).toString(),
      lastModified: lastModified ?? new Date(),
    });
  }

  return entries;
}
