import path from 'path';
import { readFile, readdir } from 'fs/promises';
import matter from 'gray-matter';
import { MDXRemote } from 'next-mdx-remote-client/rsc';
import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME } from '@/lib/config';

// 强制静态化：若页面内使用了动态 API（cookies、headers 等）则直接报错
export const dynamic = 'error';
// 完全静态：不使用增量静态渲染（ISR）
export const revalidate = false;

// 从 MDX frontmatter 生成静态路由参数：
// - 过滤 draft:true 的文章
// - 若存在 frontmatter.slug，则优先使用它；否则使用文件名
export async function generateStaticParams() {
  const dir = path.join(process.cwd(), 'src', 'content', 'blogs');
  const files = await readdir(dir);
  const params: { slug: string }[] = [];
  for (const f of files.filter((f) => f.endsWith('.mdx'))) {
    const source = await readFile(path.join(dir, f), 'utf8');
    const { data } = matter(source);
    if (data?.draft === true) continue;
    const fmSlug = typeof data?.slug === 'string' && data.slug.trim().length > 0 ? data.slug : undefined;
    const slug = fmSlug ?? f.replace(/\.mdx$/, '');
    params.push({ slug });
  }
  return params;
}

// 根据 slug 定位文件路径：优先匹配 frontmatter.slug，其次回退到文件名
async function resolveFilePathBySlug(slug: string): Promise<string | null> {
  const dir = path.join(process.cwd(), 'src', 'content', 'blogs');
  const files = await readdir(dir);
  // 1) Try match by frontmatter slug
  for (const f of files.filter(f => f.endsWith('.mdx'))) {
    const source = await readFile(path.join(dir, f), 'utf8');
    const { data } = matter(source);
    const fmSlug = typeof data?.slug === 'string' && data.slug.trim().length > 0 ? data.slug : undefined;
    if (fmSlug === slug) return path.join(dir, f);
  }
  // 2) Fallback: filename match
  const direct = path.join(dir, `${slug}.mdx`);
  try {
    await readFile(direct, 'utf8');
    return direct;
  } catch {
    return null;
  }
}

export default async function BlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const filePath = await resolveFilePathBySlug(slug);
  if (!filePath) return null;
  const source = await readFile(filePath, 'utf8');

  // 分离 frontmatter 和 content
  const { content, data } = matter(source);
  if (data?.draft === true) {
    // 草稿不对外暴露
    return null;
  }

  // 自定义组件
  const components = {
    h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h1 className="text-2xl font-bold mb-4" {...props} />
    ),
    h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h2 className="text-xl font-semibold mb-3" {...props} />
    ),
    p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
      <p className="mb-4" {...props} />
    ),
  };

  // 结构化数据（JSON-LD）：BlogPosting，用于搜索引擎理解页面
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: data?.title ?? slug,
    datePublished: data?.date ?? undefined,
    dateModified: data?.updated ?? data?.date ?? undefined,
    description: data?.description ?? undefined,
    image: (data?.cover ?? data?.image)
      ? (String((data?.cover ?? data?.image)).startsWith('http') ? String((data?.cover ?? data?.image)) : `${SITE_URL}${String((data?.cover ?? data?.image))}`)
      : `${SITE_URL}/og?title=${encodeURIComponent(data?.title ?? slug)}`,
    url: `${SITE_URL}/blog/${slug}`,
    author: {
      '@type': 'Person',
      name: data?.author ?? SITE_NAME,
    },
  };

  return (
    <section className='max-w-2xl mx-auto my-6'>
      <h1 className="text-2xl font-bold">{data.title}</h1>
      <div className="prose">
        <MDXRemote source={content} components={components} />
      </div>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const filePath = await resolveFilePathBySlug(slug);
  if (!filePath) {
    return { title: `${slug} | ${SITE_NAME}` };
  }
  const source = await readFile(filePath, 'utf8');
  const { data } = matter(source);

  const title = data?.title ?? slug;
  const description = data?.description ?? undefined;
  const published = data?.date ? new Date(data.date) : undefined;
  const pageSlug = (typeof data?.slug === 'string' && data.slug.trim().length > 0) ? String(data.slug) : slug;
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
      type: 'article',
      url,
      title,
      description,
      publishedTime: published?.toISOString(),
      modifiedTime: updated?.toISOString(),
      authors: authors?.map(a => a.name!),
      tags,
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images?.map(i => i.url),
    },
  };
}