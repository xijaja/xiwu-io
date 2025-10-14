import Blogs from "@/components/blocks/blogs";
import Footer from "@/components/blocks/footer";
import Hero from "@/components/blocks/hero";
import Projects from "@/components/blocks/projects";
import Stack from "@/components/blocks/stack";

// 这个函数会在构建时运行，为每个 locale 生成一个静态页面
export async function generateStaticParams() {
  return [{ locale: "en" }, { locale: "zh" }];
}

export default function HomePage() {
  return (
    <main className="max-w-4xl mx-auto px-6 pt-16 flex flex-col gap-16 font-roboto-mono">
      <Hero />
      <Projects />
      <Blogs />
      <Stack />
      <Footer />
    </main>
  );
}
