import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { cacheLife } from "next/cache";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { formatDate } from "@/lib/utils";

// 获取博客列表
async function getBlogs(locale: string) {
  "use cache";
  cacheLife("max"); // 缓存 30 天

  // 获取文件目录
  const dir = path.join(process.cwd(), "src", "content", "blogs", locale);
  const files = await readdir(dir);
  // 读取文件
  const blogs: any[] = [];
  for (const file of files) {
    const source = await readFile(path.join(dir, file), "utf8");
    const { data } = matter(source); // 分离出 frontmatter
    if (data?.draft === true) {
      continue; // 过滤草稿
    }
    blogs.push(data);
  }
  // 按日期排序
  blogs.sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime());
  return blogs;
}

export default async function Blogs() {
  const locale = await getLocale();
  const blogs = await getBlogs(locale);

  return (
    <section>
      <h2 className="mb-8 font-bold font-roboto-mono text-2xl">Blogs_</h2>
      <ul className="space-y-6">
        {blogs.map((blog) => (
          <li key={blog.slug}>
            <Link className="[&:hover_h3]:text-foreground/80 [&:hover_h3]:underline" href={`/blog/${blog.slug}`}>
              <h3 className="mb-1 font-medium text-lg decoration-1 decoration-wavy underline-offset-4">{blog.title}</h3>
              <p className="text-muted-foreground text-sm">
                {blog.date ? ` ${formatDate(locale, blog.date)} / ` : ""}
                {blog.description}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
