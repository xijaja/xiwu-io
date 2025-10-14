import Blogs from "@/components/blocks/blogs";
import Footer from "@/components/blocks/footer";
import Hero from "@/components/blocks/hero";
import Navbar from "@/components/blocks/navbar";
import Projects from "@/components/blocks/projects";
import Stack from "@/components/blocks/stack";

// 这个函数会在构建时运行，为每个 locale 生成一个静态页面
export async function generateStaticParams() {
  return [{ locale: "en" }, { locale: "zh" }];
}

export default function HomePage() {
  return (
    <div className="font-roboto-mono">
      <div className="min-h-screen w-full relative">
        {/* Global grid background is now handled by body::before in globals.css */}
        <Navbar />
        <main className="max-w-4xl mx-auto px-6 py-16 flex flex-col gap-20">
          <Hero />
          <Projects />
          <Blogs />
          <Stack />
          <Footer />
        </main>
      </div>
    </div>
  );
}
