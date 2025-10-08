import path from 'path';
import { readFile } from 'fs/promises';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';
import MDXContent from './page.client';

export default async function BlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const filePath = path.join(process.cwd(), 'src', 'content', 'blogs', `${slug}.mdx`);
  const source = await readFile(filePath, 'utf8');
  // data 是 frontmatter, content 是正文
  const { content, data } = matter(source);
  // 用 next-mdx-remote/serialize 方案
  const mdxSource = await serialize(content, { scope: data });
  // console.log("mdxSource", mdxSource);

  // 用 @mdx-js/mdx 动态编译，或用 next-mdx-remote/hydrate 方案
  // 最新 next/mdx 推荐用动态 import 直接 import 文章为模块
  // const Post = (await import(`@/content/blogs/${slug}.mdx`)).default;

  return (
    <section className='max-w-2xl mx-auto my-6'>
      <h1 className="text-2xl font-bold">{data.title}</h1>
      <MDXContent source={mdxSource} />
    </section>
  );
}