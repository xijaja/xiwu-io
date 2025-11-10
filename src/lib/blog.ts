import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { cacheLife } from "next/cache";
import { routing } from "@/i18n/routing";
import { SITE_NAME, SITE_URL } from "@/lib/config";

export type Frontmatter = {
  title?: string;
  slug?: string;
  date?: string;
  updated?: string;
  description?: string;
  image?: string;
  cover?: string;
  author?: string;
  tags?: string[];
  draft?: boolean;
};

export type PostMeta = {
  slug: string;
  title: string;
  date?: string;
  description?: string;
};

const MDX_EXTENSION = /\.mdx$/;

function buildBlogDir(locale: string): string {
  return path.join(process.cwd(), "src", "content", "blogs", locale);
}

async function readFrontmatter(filePath: string): Promise<{ data: Frontmatter; content: string } | null> {
  try {
    const source = await readFile(filePath, "utf8");
    const { data, content } = matter(source);
    return { data: data as Frontmatter, content };
  } catch {
    return null;
  }
}

function normalizeSlug(fileName: string, fm: Frontmatter): string {
  const fmSlug = typeof fm?.slug === "string" && fm.slug.trim().length > 0 ? fm.slug : undefined;
  return fmSlug ?? fileName.replace(MDX_EXTENSION, "");
}

// 简单 LRU（基于 Map 顺序）
type CacheKey = string;
const MAX_CACHE = 100;
const cache = new Map<CacheKey, unknown>();

function getCache<T>(key: CacheKey): T | undefined {
  const v = cache.get(key) as T | undefined;
  if (v !== undefined) {
    // 触发最近使用
    cache.delete(key);
    cache.set(key, v);
  }
  return v;
}

function setCache<T>(key: CacheKey, value: T): void {
  if (cache.has(key)) {
    cache.delete(key);
  }
  cache.set(key, value);
  if (cache.size > MAX_CACHE) {
    const firstKey = cache.keys().next().value as string | undefined;
    if (firstKey) {
      cache.delete(firstKey);
    }
  }
}

export async function getAllPosts(locale: string, opts: { includeDraft?: boolean } = {}): Promise<PostMeta[]> {
  "use cache";
  cacheLife("blog");
  const includeDraft = opts.includeDraft === true;
  const key = `all:${locale}:${includeDraft ? "with" : "no"}-draft` as const;
  const cached = getCache<PostMeta[]>(key);
  if (cached) {
    return cached;
  }

  const dir = buildBlogDir(locale);
  let files: string[] = [];
  try {
    files = await readdir(dir);
  } catch {
    return [];
  }

  const posts: PostMeta[] = [];
  for (const file of files.filter((f) => f.endsWith(".mdx"))) {
    const fm = await readFrontmatter(path.join(dir, file));
    if (!fm) {
      continue;
    }
    if (!includeDraft && fm.data?.draft === true) {
      continue;
    }
    const slug = normalizeSlug(file, fm.data);
    posts.push({
      slug,
      title: fm.data?.title ?? slug,
      date: fm.data?.date,
      description: fm.data?.description,
    });
  }

  // 最新优先
  posts.sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime());
  setCache(key, posts);
  return posts;
}

export async function getPostBySlug(
  locale: string,
  slug: string,
): Promise<{ data: Frontmatter; content: string } | null> {
  "use cache";
  cacheLife("blog");

  const filePath = await resolveFilePathBySlug(locale, slug);
  if (!filePath) {
    return null;
  }
  const fm = await readFrontmatter(filePath);
  if (!fm) {
    return null;
  }
  if (fm.data?.draft === true) {
    return null;
  }
  return fm;
}

export async function resolveFilePathBySlug(locale: string, slug: string): Promise<string | null> {
  "use cache";
  cacheLife("blog");
  const dir = buildBlogDir(locale);
  let files: string[] = [];
  try {
    files = await readdir(dir);
  } catch {
    return null;
  }

  for (const file of files.filter((f) => f.endsWith(".mdx"))) {
    const fm = await readFrontmatter(path.join(dir, file));
    if (!fm) {
      continue;
    }
    if (fm.data?.draft === true) {
      continue;
    }
    const fmSlug = typeof fm.data?.slug === "string" && fm.data.slug.trim().length > 0 ? fm.data.slug : undefined;
    if (fmSlug === slug) {
      return path.join(dir, file);
    }
  }

  const fallback = path.join(dir, `${slug}.mdx`);
  const exists = await readFrontmatter(fallback);
  return exists ? fallback : null;
}

export async function findPrevAndNext(
  locale: string,
  currentSlug: string,
): Promise<{
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
}> {
  "use cache";
  cacheLife("blog");
  const posts = await getAllPosts(locale);
  const idx = posts.findIndex((p) => p.slug === currentSlug);
  if (idx === -1) {
    return { prev: null, next: null };
  }

  const prev = idx > 0 ? { slug: posts[idx - 1].slug, title: posts[idx - 1].title } : null;
  const next = idx < posts.length - 1 ? { slug: posts[idx + 1].slug, title: posts[idx + 1].title } : null;
  return { prev, next };
}

export async function collectAllSlugs(): Promise<Set<string>> {
  "use cache";
  cacheLife("blog");
  const slugs = new Set<string>();
  for (const locale of routing.locales) {
    const posts = await getAllPosts(locale);
    for (const p of posts) {
      slugs.add(p.slug);
    }
  }
  return slugs;
}

export function generateImageUrl(data: Frontmatter, locale: string, pageSlug: string): string {
  const value = data?.cover ?? data?.image;
  if (!value) {
    return `${SITE_URL}/og/${locale}-${pageSlug}.png`;
  }
  const s = String(value);
  return s.startsWith("http") ? s : `${SITE_URL}${s}`;
}

export function generateJsonLd(data: Frontmatter, locale: string, slug: string, pageSlug: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: data?.title ?? slug,
    datePublished: data?.date ?? undefined,
    dateModified: data?.updated ?? data?.date ?? undefined,
    description: data?.description ?? undefined,
    image: generateImageUrl(data, locale, pageSlug),
    url: `${SITE_URL}/blog/${pageSlug}`,
    author: {
      "@type": "Person",
      name: data?.author ?? SITE_NAME,
    },
  } as const;
}
