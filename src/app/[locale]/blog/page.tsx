import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getAllPosts } from "@/lib/blog";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function BlogListPage({ params }: Props) {
  const { locale } = await params;
  // 验证语言支持
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  // 设置请求语言
  setRequestLocale(locale);
  // 获取文章列表（已包含 draft 过滤与排序）
  const posts = await getAllPosts(locale);

  return (
    <section className="mx-auto my-16 max-w-4xl px-6 font-roboto-mono">
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
