import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto my-4 flex gap-4">
      <Link className="text-blue-500" href="/blog">
        Blog
      </Link>
    </div>
  );
}
