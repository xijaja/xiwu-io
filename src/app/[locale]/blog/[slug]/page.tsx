import { readdir, readFile } from "fs/promises";
import matter from "gray-matter";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote-client/rsc";
import path from "path";
import { SITE_NAME, SITE_URL } from "@/lib/config";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { setRequestLocale } from "next-intl/server";

// 强制静态化：若页面内使用了动态 API（cookies、headers 等）则直接报错
export const dynamic = "error";
// 完全静态：不使用增量静态渲染（ISR）
export const revalidate = false;

// 生成静态路由参数：遍历所有支持语言
export async function generateStaticParams(): Promise<Array<{ locale: string; slug: string }>> {
  const locales = routing.locales;
  const result: Array<{ locale: string; slug: string }> = [];
  for (const locale of locales) {
    const dir = path.join(process.cwd(), "src", "content", "blogs", locale);
    const files = await readdir(dir);
    for (const f of files.filter((f) => f.endsWith(".mdx"))) {
      const source = await readFile(path.join(dir, f), "utf8");
      const { data } = matter(source);
      if (data?.draft === true) continue;
      const fmSlug = typeof data?.slug === "string" && data.slug.trim().length > 0 ? data.slug : undefined;
      const slug = fmSlug ?? f.replace(/\.mdx$/, "");
      result.push({ locale, slug });
    }
  }
  return result;
}

// 根据 slug 或文件名获取文件路经：优先匹配 frontmatter.slug，其次回退到文件名
async function resolveFilePathBySlug(locale: string, slug: string): Promise<string | null> {
  const dir = path.join(process.cwd(), "src", "content", "blogs", locale);
  const files = await readdir(dir);
  // 遍历文件，按 frontmatter 匹配 slug，若存在 frontmatter.slug，则优先使用它；否则使用文件名
  for (const f of files.filter((f) => f.endsWith(".mdx"))) {
    const source = await readFile(path.join(dir, f), "utf8");
    const { data } = matter(source);
    if (data?.draft === true) continue; // 草稿不对外暴露, 跳出循环
    const fmSlug = typeof data?.slug === "string" && data.slug.trim().length > 0 ? data.slug : undefined;
    if (fmSlug === slug) return path.join(dir, f); // 匹配到则返回文件路径, 结束循环
  }
  // 回退到文件名匹配, 如果文件存在则返回文件路经, 否则返回 null
  const direct = path.join(dir, `${slug}.mdx`);
  try {
    await readFile(direct, "utf8");
    return direct;
  } catch {
    return null;
  }
}

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function BlogPage({ params }: Props) {
  const { locale, slug } = await params;
  // 验证语言支持
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  // 设置请求语言
  setRequestLocale(locale);

  // 根据 slug 或文件名获取文件路经
  const filePath = await resolveFilePathBySlug(locale, slug);
  // 内容不存在或者没有对应语言的版本
  if (!filePath) {
    return null;
  }

  // 读取文件内容
  const source = await readFile(filePath, "utf8");
  // 分离 frontmatter 和 content
  const { content, data } = matter(source);
  // 草稿不对外暴露
  if (data?.draft === true) {
    return null;
  }

  // 自定义组件
  const components = {
    h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h1 className="mb-4 font-bold text-2xl" {...props} />,
    h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h2 className="mb-3 font-semibold text-xl" {...props} />,
    p: (props: React.HTMLAttributes<HTMLParagraphElement>) => <p className="mb-4" {...props} />,
  };

  // 结构化数据（JSON-LD）：BlogPosting，用于搜索引擎理解页面
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: data?.title ?? slug,
    datePublished: data?.date ?? undefined,
    dateModified: data?.updated ?? data?.date ?? undefined,
    description: data?.description ?? undefined,
    image:
      (data?.cover ?? data?.image)
        ? String(data?.cover ?? data?.image).startsWith("http")
          ? String(data?.cover ?? data?.image)
          : `${SITE_URL}${String(data?.cover ?? data?.image)}`
        : `${SITE_URL}/og?title=${encodeURIComponent(data?.title ?? slug)}`,
    url: `${SITE_URL}/blog/${slug}`,
    author: {
      "@type": "Person",
      name: data?.author ?? SITE_NAME,
    },
  };

  return (
    <section className="mx-auto my-6 max-w-2xl">
      <h1 className="font-bold text-2xl">{data.title}</h1>
      <div className="prose">
        <MDXRemote components={components} source={content} />
      </div>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        suppressHydrationWarning
        type="application/ld+json"
      />
    </section>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const filePath = await resolveFilePathBySlug(locale, slug);
  // 内容不存在或者没有对应语言的版本
  if (!filePath) {
    return { title: `${slug} | ${SITE_NAME}` };
  }
  // 读取文件内容
  const source = await readFile(filePath, "utf8");
  const { data } = matter(source);

  const title = data?.title ?? slug;
  const description = data?.description ?? undefined;
  const published = data?.date ? new Date(data.date) : undefined;
  const pageSlug = typeof data?.slug === "string" && data.slug.trim().length > 0 ? String(data.slug) : slug;
  const url = `${SITE_URL}/blog/${pageSlug}`;
  const updated = data?.updated ? new Date(data.updated) : undefined;
  const tags: string[] | undefined = Array.isArray(data?.tags) ? data?.tags : undefined;
  const authors = data?.author ? [{ name: String(data.author) }] : undefined;
  const images = data?.image ? [{ url: String(data.image) }] : undefined;

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      publishedTime: published?.toISOString(),
      modifiedTime: updated?.toISOString(),
      authors: authors?.map((a) => a.name!),
      tags,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images?.map((i) => i.url),
    },
  };
}
