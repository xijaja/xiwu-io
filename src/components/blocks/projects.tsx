import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { formatDate } from "@/lib/utils";

// 正则表达式常量
const MDX_EXTENSION_REGEX = /\.mdx$/;

// 获取项目列表
async function getProjects(locale: string) {
  // 获取文件目录
  const dir = path.join(process.cwd(), "src", "content", "projects", locale);
  const files = await readdir(dir);
  // 读取文件
  const projects: any[] = [];
  for (const file of files) {
    const source = await readFile(path.join(dir, file), "utf8");
    const { data } = matter(source); // 分离出 frontmatter
    // 如果没有发布日期，说明没有发布
    if (!data.publisDate) {
      continue;
    }
    // 如果 id 不存在，则使用文件名
    if (!data?.id) {
      data.id = file.replace(MDX_EXTENSION_REGEX, "");
    }
    projects.push(data);
  }
  // 按日期排序
  projects.sort((a, b) => new Date(b.publisDate ?? 0).getTime() - new Date(a.publisDate ?? 0).getTime());
  return projects;
}

export default async function Projects() {
  const locale = await getLocale();
  const projects = await getProjects(locale);

  if (projects.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="mb-8 font-bold font-roboto-mono text-2xl">Projects_</h2>
      <ul className="space-y-6">
        {projects.map((project) => (
          <li key={project.id}>
            <Link
              className="[&:hover_h3]:text-foreground/80 [&:hover_h3]:underline"
              href={project.url}
              rel="noopener"
              target="_blank"
            >
              <h3 className="mb-1 font-medium text-lg decoration-1 decoration-double underline-offset-4">
                {project.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {project.publisDate ? ` ${formatDate(locale, project.publisDate)} / ` : ""}
                {project.description}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
