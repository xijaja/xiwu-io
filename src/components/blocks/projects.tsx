import { Link } from "@/i18n/routing";
import { formatDate } from "@/lib/utils";
import { readdir, readFile } from "fs/promises";
import matter from "gray-matter";
import { getLocale } from "next-intl/server";
import path from "path";

// 获取项目列表
async function getProjects(locale: string) {
  // 获取文件目录
  const dir = path.join(process.cwd(), "src", "content", "projects", locale);
  const files = await readdir(dir);
  // 读取文件
  const projects = [];
  for (const file of files) {
    const source = await readFile(path.join(dir, file), "utf8");
    const { data } = matter(source); // 分离出 frontmatter
    // 如果没有发布日期，说明没有发布
    if (!data.publisDate) continue;
    // 如果 id 不存在，则使用文件名
    if (!data?.id) {
      data.id = file.replace(/\.mdx$/, "");
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
      <h2 className="text-2xl font-roboto-mono font-bold mb-8">Projects_</h2>
      <ul className="space-y-6">
        {projects.map((project) => (
          <li key={project.id}>
            <Link target="_blank" rel="noopener" href={project.url} className="[&:hover_h3]:underline [&:hover_h3]:text-foreground/80">
              <h3 className="text-lg font-medium mb-1 underline-offset-4 decoration-1 decoration-double">{project.title}</h3>
              <p className="text-sm text-muted-foreground">
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
