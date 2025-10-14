import { readdir, readFile } from "fs/promises";
import matter from "gray-matter";
import Link from "next/link";
import path from "path";
import { routing } from "@/i18n/routing";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";

// 静态列表页：若误用了动态 API 则直接报错
export const dynamic = "error";
// 不使用 ISR，保持 sitemap/订阅源 与构建产物一致
export const revalidate = false;

type PostItem = {
  slug: string;
  title: string;
  description?: string;
  date?: string;
};

// 读取 MDX 列表、过滤草稿、应用 frontmatter.slug 覆盖，并按日期倒序
async function getPosts(locale: string): Promise<PostItem[]> {
  const dir = path.join(process.cwd(), "src", "content", "blogs", locale);
  const files = await readdir(dir);
  const posts: PostItem[] = [];
  for (const f of files.filter((f) => f.endsWith(".mdx"))) {
    const source = await readFile(path.join(dir, f), "utf8");
    const { data } = matter(source);
    if (data?.draft === true) continue;
    const fmSlug = typeof data?.slug === "string" && data.slug.trim().length > 0 ? data.slug : undefined;
    const slug = fmSlug ?? f.replace(/\.mdx$/, "");
    posts.push({
      slug,
      title: data?.title ?? slug,
      description: data?.description,
      date: data?.date,
    });
  }
  posts.sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime());
  return posts;
}

type Props = { params: Promise<{ locale: string }> };

export default async function BlogListPage({ params }: Props) {
  const { locale } = await params;
  // 验证语言支持
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  // 获取文章列表
  const posts = await getPosts(locale);

  return (
    <section className="max-w-4xl mx-auto px-6 my-16 font-roboto-mono">
      <h1 className="mb-4 font-bold text-2xl">Blog</h1>
      <ul className="space-y-4">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link className="text-blue-600 hover:underline" href={`/blog/${p.slug}`}>
              {p.title}
            </Link>
            {p.date && <div className="text-gray-500 text-sm">{new Date(p.date).toLocaleDateString()}</div>}
            {p.description && <p className="text-gray-700">{p.description}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
