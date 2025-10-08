import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto flex gap-4 my-4">
      <Link href="/blog/one" className="text-blue-500">One</Link>
      <Link href="/blog/two" className="text-blue-500">Two</Link>
    </div>
  );
}
