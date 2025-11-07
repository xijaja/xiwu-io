import { getLocale } from "next-intl/server";
import { getLocalizedText, type LocalizedText } from "@/i18n/routing";

const localeText: Record<string, LocalizedText> = {
  title: {
    en: "xiwu",
    zh: "習武",
  },
  tag: {
    en: "PM / Solopreneur / Fullstack_",
    zh: "产品经理 / 独立创客 / 全栈开发_",
  },
  description_1: {
    en: "Eight years in product management have only deepened my commitment to independent thought.",
    zh: "八载产品生涯，犹笃独立思考；",
  },
  description_2: {
    en: "Along the way, I taught myself to code. This has provided a supplemental revenue stream that I'm grateful for.",
    zh: "业余自学编程，凭此拙技，稍获身外之资，不足挂齿；",
  },
  description_3: {
    en: "Harnessing AI to innovate, allied with machine intelligence to build. This is my path to creating independent products.",
    zh: "假天工以开物，引智械为同袍，铸就独立产品，此吾道之所向也。",
  },
};

export default async function Hero() {
  const locale = await getLocale();

  return (
    <section>
      <h1 className="mb-6 flex flex-wrap items-center gap-3 font-bold font-mono text-4xl">
        <span className="font-rubik-microbe">{getLocalizedText(localeText.title, locale)}</span>
        <span className="bg-foreground px-2 py-0.5 text-background text-base">
          {getLocalizedText(localeText.tag, locale)}
        </span>
      </h1>
      <div className="max-w-2xl space-y-4 text-foreground/90 leading-relaxed">
        <p>{getLocalizedText(localeText.description_1, locale)}</p>
        <p>{getLocalizedText(localeText.description_2, locale)}</p>
        <p>{getLocalizedText(localeText.description_3, locale)}</p>
      </div>
    </section>
  );
}
