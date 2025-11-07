import Blogs from "@/components/blocks/blogs";
import Footer from "@/components/blocks/footer";
import Hero from "@/components/blocks/hero";
import Projects from "@/components/blocks/projects";
import Stack from "@/components/blocks/stack";
import { LOCALES } from "@/i18n/routing";

// 这个函数会在构建时运行，为每个 locale 生成一个静态页面
export function generateStaticParams(): { locale: string }[] {
  return LOCALES.map((locale: string) => ({ locale }));
}

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-16 px-6 pt-16 font-roboto-mono">
      <Hero locale={locale} />
      <Projects locale={locale} />
      <Blogs locale={locale} />
      <Stack />
      <Footer />
    </main>
  );
}
