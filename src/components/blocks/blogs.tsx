import { Link } from "@/i18n/routing";
import { formatDate } from "@/lib/utils";
import { readdir, readFile } from "fs/promises";
import matter from "gray-matter";
import { getLocale } from "next-intl/server";
import path from "path";

// 获取博客列表
async function getBlogs(locale: string) {
  // 获取文件目录
  const dir = path.join(process.cwd(), "src", "content", "blogs", locale);
  const files = await readdir(dir);
  // 读取文件
  const blogs = [];
  for (const file of files) {
    const source = await readFile(path.join(dir, file), "utf8");
    const { data } = matter(source); // 分离出 frontmatter
    if (data?.draft === true) continue; // 过滤草稿
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
      <h2 className="text-2xl font-roboto-mono font-bold mb-8">Blogs_</h2>
      <ul className="space-y-6">
        {blogs.map((blog) => (
          <li key={blog.slug}>
            <Link href={`/blog/${blog.slug}`}>
              <h3 className="text-lg font-medium mb-1">{blog.title}</h3>
              <p className="text-sm text-muted-foreground">
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
