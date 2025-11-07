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
import { findPrevAndNext, generateImageUrl, generateJsonLd, getPostBySlug } from "@/lib/blog";
import { SITE_NAME, SITE_URL } from "@/lib/config";
import { formatDate } from "@/lib/utils";

// 正则表达式常量
const MDX_EXTENSION = "/.mdx$/";

// 生成静态路由参数：遍历所有支持语言
export async function generateStaticParams(): Promise<Array<{ locale: string; slug: string }>> {
  const locales = routing.locales;
  const result: Array<{ locale: string; slug: string }> = [];
  for (const locale of locales) {
    const dir = path.join(process.cwd(), "src", "content", "blogs", locale);
    const files = await readdir(dir);
    for (const file of files.filter((f) => f.endsWith(".mdx"))) {
      const source = await readFile(path.join(dir, file), "utf8");
      const { data } = matter(source);
      if (data?.draft === true) {
        continue;
      }
      const fmSlug = typeof data?.slug === "string" && data.slug.trim().length > 0 ? data.slug : undefined;
      const slug = fmSlug ?? file.replace(MDX_EXTENSION, "");
      result.push({ locale, slug });
    }
  }
  return result;
}

// 使用统一 blog 库 API：已移除本地实现

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

// 使用统一 blog 库 API

// 导航链接组件
function NavLink({
  href,
  title,
  label,
  direction,
}: {
  href: string;
  title: string;
  label: string;
  direction: "prev" | "next";
}) {
  const isPrev = direction === "prev";

  return (
    <Link
      className="group flex h-20 items-center gap-3 rounded-lg border border-gray-200 px-4 py-4 transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 dark:border-gray-700 dark:hover:border-blue-600 dark:hover:bg-blue-950/30"
      href={href}
    >
      {isPrev && <ArrowLeft className="size-5 shrink-0 text-gray-400 transition-colors group-hover:text-blue-500" />}
      <div className={`min-w-0 flex-1 ${isPrev ? "text-left" : "text-right"}`}>
        <div className="mb-1 text-gray-500 text-xs dark:text-gray-400">{label}</div>
        <div className="line-clamp-2 font-medium text-gray-900 text-sm leading-tight group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
          {title}
        </div>
      </div>
      {!isPrev && <ArrowRight className="size-5 shrink-0 text-gray-400 transition-colors group-hover:text-blue-500" />}
    </Link>
  );
}

// 安全的 JSON-LD 组件
function JsonLd({ data }: { data: object }) {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      suppressHydrationWarning
      type="application/ld+json"
    />
  );
}

export default async function BlogPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const postData = await getPostBySlug(locale, slug);
  if (!postData) {
    return null;
  }

  const { content, data } = postData;
  const { prev, next } = await findPrevAndNext(locale, slug);
  const pageSlug = typeof data?.slug === "string" && data.slug.trim().length > 0 ? String(data.slug) : slug;
  const jsonLd = generateJsonLd(data, locale, slug, pageSlug);

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
          <NavLink direction="prev" href={`/blog/${prev.slug}`} label="上一篇" title={prev.title} />
        ) : (
          <div className="h-20" />
        )}
        {next ? (
          <NavLink direction="next" href={`/blog/${next.slug}`} label="下一篇" title={next.title} />
        ) : (
          <div className="h-20" />
        )}
      </nav>

      {/* 结构化数据 */}
      <JsonLd data={jsonLd} />
    </section>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const postData = await getPostBySlug(locale, slug);

  if (!postData) {
    return { title: `${slug} | ${SITE_NAME}` };
  }

  const { data } = postData;
  const title = data?.title ?? slug;
  const description = data?.description ?? undefined;
  const published = data?.date ? new Date(data.date) : undefined;
  const pageSlug = typeof data?.slug === "string" && data.slug.trim().length > 0 ? String(data.slug) : slug;
  const url = `${SITE_URL}/blog/${pageSlug}`;
  const updated = data?.updated ? new Date(data.updated) : undefined;
  const tags: string[] | undefined = Array.isArray(data?.tags) ? data?.tags : undefined;
  const authors = data?.author ? [{ name: String(data.author) }] : undefined;
  const imageUrl = generateImageUrl(data, locale, pageSlug);
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
      authors: authors?.map((a) => a.name),
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
