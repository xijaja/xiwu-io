import path from 'path';
import { readFile, readdir } from 'fs/promises';
import matter from 'gray-matter';
import { MDXRemote } from 'next-mdx-remote-client/rsc';

export const dynamic = 'error';
export const revalidate = false;

export async function generateStaticParams() {
  const dir = path.join(process.cwd(), 'src', 'content', 'blogs');
  const files = await readdir(dir);
  return files
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => ({ slug: f.replace(/\.mdx$/, '') }));
}

export default async function BlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const filePath = path.join(process.cwd(), 'src', 'content', 'blogs', `${slug}.mdx`);
  const source = await readFile(filePath, 'utf8');

  // 分离 frontmatter 和 content
  const { content, data } = matter(source);

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

  return (
    <section className='max-w-2xl mx-auto my-6'>
      <h1 className="text-2xl font-bold">{data.title}</h1>
      <div className="prose">
        <MDXRemote source={content} components={components} />
      </div>
    </section>
  );
}