'use client';

import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';

export default function MDXContent({ source }: { source: MDXRemoteSerializeResult }) {
  const components = {
    h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => {
      return <h1 className="text-2xl font-bold" {...props} />;
    }
  };

  return <MDXRemote {...source} components={components} />;
}
