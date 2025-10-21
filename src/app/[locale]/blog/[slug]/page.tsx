import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { MDXRemote } from "next-mdx-remote-client/rsc";
import { Link, routing } from "@/i18n/routing";
import { SITE_NAME, SITE_URL } from "@/lib/config";
import { formatDate } from "@/lib/utils";

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
async function findPrevAndNext(
  locale: string,
  currentSlug: string
): Promise<{ prev: { slug: string; title: string } | null; next: { slug: string; title: string } | null }> {
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
  // 设置请求语言
  setRequestLocale(locale);

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

  // 获取页面 slug（与 generateMetadata 中的逻辑保持一致）
  const pageSlug = typeof data?.slug === "string" && data.slug.trim().length > 0 ? String(data.slug) : slug;

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
        : `${SITE_URL}/og/${locale}-${pageSlug}.png`,
    url: `${SITE_URL}/blog/${pageSlug}`,
    author: {
      "@type": "Person",
      name: data?.author ?? SITE_NAME,
    },
  };

  return (
    <section className="mx-auto my-16 max-w-4xl px-6 font-roboto-mono">
      <h1 className="mb-6 font-bold text-4xl">{data.title}</h1>
      <p className="mb-6 text-gray-500 text-sm">{data.date ? formatDate(locale, data.date) : ""}</p>

      {/* 当前文章的内容 */}
      <div className="typography">
        <MDXRemote source={content} />
      </div>

      {/* 上一篇和下一篇导航 */}
      <nav className="mt-12 grid grid-cols-2 gap-4 border-gray-200 border-t pt-8 dark:border-gray-700">
        {prev ? (
          <Link
            className="group flex h-20 items-center gap-3 rounded-lg border border-gray-200 px-4 py-4 transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 dark:border-gray-700 dark:hover:border-blue-600 dark:hover:bg-blue-950/30"
            href={`/blog/${prev.slug}`}
          >
            <ArrowLeft className="size-5 flex-shrink-0 text-gray-400 transition-colors group-hover:text-blue-500" />
            <div className="min-w-0 flex-1 text-left">
              <div className="mb-1 text-gray-500 text-xs dark:text-gray-400">上一篇</div>
              <div className="line-clamp-2 font-medium text-gray-900 text-sm leading-tight group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                {prev.title}
              </div>
            </div>
          </Link>
        ) : (
          <div className="h-20" />
        )}

        {next ? (
          <Link
            className="group flex h-20 items-center gap-3 rounded-lg border border-gray-200 px-4 py-4 transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 dark:border-gray-700 dark:hover:border-blue-600 dark:hover:bg-blue-950/30"
            href={`/blog/${next.slug}`}
          >
            <div className="min-w-0 flex-1 text-right">
              <div className="mb-1 text-gray-500 text-xs dark:text-gray-400">下一篇</div>
              <div className="line-clamp-2 font-medium text-gray-900 text-sm leading-tight group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                {next.title}
              </div>
            </div>
            <ArrowRight className="size-5 flex-shrink-0 text-gray-400 transition-colors group-hover:text-blue-500" />
          </Link>
        ) : (
          <div className="h-20" />
        )}
      </nav>

      {/* 结构化数据 */}
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
  // 优先使用自定义图片，否则使用静态生成的 OG 图片
  const customImage = data?.image ? String(data.image) : undefined;
  const staticOGImage = `/og/${locale}-${pageSlug}.png`;
  const imageUrl = customImage
    ? customImage.startsWith("http")
      ? customImage
      : `${SITE_URL}${customImage}`
    : `${SITE_URL}${staticOGImage}`;

  const images = [{ url: imageUrl }];

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
