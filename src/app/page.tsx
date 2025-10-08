import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto flex gap-4 my-4">
      <Link href="/blog" className="text-blue-500">Blog</Link>
    </div>
  );
}
