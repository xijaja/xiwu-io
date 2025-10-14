import { readdir, readFile } from "fs/promises";
import matter from "gray-matter";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote-client/rsc";
import path from "path";
import { SITE_NAME, SITE_URL } from "@/lib/config";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { Link, routing } from "@/i18n/routing";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, ArrowRight } from "lucide-react";

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

// 找到文章的上一篇和下一篇
async function findPrevAndNext(locale: string, currentSlug: string): Promise<{ prev: { slug: string; title: string } | null; next: { slug: string; title: string } | null }> {
  const dir = path.join(process.cwd(), "src", "content", "blogs", locale);
  const files = await readdir(dir);

  // 收集所有文章信息
  const posts: Array<{ slug: string; title: string; date: string }> = [];

  for (const f of files.filter((f) => f.endsWith(".mdx"))) {
    const source = await readFile(path.join(dir, f), "utf8");
    const { data } = matter(source);
    if (data?.draft === true) continue; // 跳过草稿

    // 获取 slug：优先使用 frontmatter.slug，否则使用文件名
    const fmSlug = typeof data?.slug === "string" && data.slug.trim().length > 0 ? data.slug : undefined;
    const postSlug = fmSlug ?? f.replace(/\.mdx$/, "");

    posts.push({
      slug: postSlug,
      title: data?.title ?? postSlug,
      date: data?.date ?? "1970-01-01", // 默认日期，确保排序正常
    });
  }

  // 按日期排序（最新的在前）
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // 找到当前文章的索引
  const currentIndex = posts.findIndex((post) => post.slug === currentSlug);

  if (currentIndex === -1) {
    return { prev: null, next: null };
  }

  // 上一篇（更新的文章）
  const prev =
    currentIndex > 0
      ? {
          slug: posts[currentIndex - 1].slug,
          title: posts[currentIndex - 1].title,
        }
      : null;

  // 下一篇（更旧的文章）
  const next =
    currentIndex < posts.length - 1
      ? {
          slug: posts[currentIndex + 1].slug,
          title: posts[currentIndex + 1].title,
        }
      : null;

  return { prev, next };
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

  // 根据 slug 或文件名获取文件路经
  const filePath = await resolveFilePathBySlug(locale, slug);
  const { prev, next } = await findPrevAndNext(locale, slug);
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
  // const components = {
  //   h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h1 className="mb-4 font-bold text-2xl" {...props} />,
  //   h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h2 className="mb-3 font-semibold text-xl" {...props} />,
  //   p: (props: React.HTMLAttributes<HTMLParagraphElement>) => <p className="mb-4" {...props} />,
  // };

  // 结构化数据（JSON-LD）：BlogPosting，用于搜索引擎理解页面
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: data?.title ?? slug,
    datePublished: data?.date ?? undefined,
    dateModified: data?.updated ?? data?.date ?? undefined,
    description: data?.description ?? undefined,
    image:
      data?.cover ?? data?.image
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
    <section className="max-w-4xl mx-auto px-6 my-16 font-roboto-mono">
      <h1 className="font-bold text-4xl mb-6">{data.title}</h1>
      <p className="text-sm text-gray-500 mb-6">{data.date ? formatDate(locale, data.date) : ""}</p>

      {/* 当前文章的内容 */}
      <div className="typography">
        <MDXRemote source={content} />
      </div>

      {/* 上一篇和下一篇导航 */}
      <nav className="grid grid-cols-2 gap-4 mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        {prev ? (
          <Link
            href={`/blog/${prev.slug}`}
            className="group flex items-center gap-3 px-4 py-4 h-20 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-200">
            <ArrowLeft className="size-5 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
            <div className="text-left min-w-0 flex-1">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">上一篇</div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2 leading-tight">
                {prev.title}
              </div>
            </div>
          </Link>
        ) : (
          <div className="h-20"></div>
        )}

        {next ? (
          <Link
            href={`/blog/${next.slug}`}
            className="group flex items-center gap-3 px-4 py-4 h-20 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-200">
            <div className="text-right min-w-0 flex-1">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">下一篇</div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2 leading-tight">
                {next.title}
              </div>
            </div>
            <ArrowRight className="size-5 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
          </Link>
        ) : (
          <div className="h-20"></div>
        )}
      </nav>

      {/* 结构化数据 */}
      <script dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} suppressHydrationWarning type="application/ld+json" />
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
