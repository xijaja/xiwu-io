import { Link } from "@/i18n/routing";

// 这个函数会在构建时运行，为每个 locale 生成一个静态页面
export async function generateStaticParams() {
  return [{ locale: "en" }, { locale: "zh" }];
}

export default function HomePage() {
  return (
    <div className="container mx-auto my-4 flex gap-4">
      <Link className="text-blue-500" href="/blog">
        Blog
      </Link>
    </div>
  );
}
