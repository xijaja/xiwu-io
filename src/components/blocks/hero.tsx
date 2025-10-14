import { getLocalizedText, LocalizedText } from "@/i18n/routing";
import { getLocale } from "next-intl/server";

const localeText: Record<string, LocalizedText> = {
  title: {
    en: "xiwu",
    zh: "xiwu",
  },
  tag: {
    en: "PM / Founder / Full-stack_",
    zh: "产品经理 / 创始人 / 全栈开发者_",
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
    zh: "假天工以开物，引智械为同袍，铸以独立之器，此吾道之所向也。",
  },
};

export default async function Hero() {
  const locale = await getLocale();

  return (
    <section>
      <h1 className="text-4xl font-mono font-bold mb-6 flex items-center gap-3 flex-wrap">
        {getLocalizedText(localeText.title, locale)}
        <span className="bg-foreground text-background text-base px-2 py-0.5">{getLocalizedText(localeText.tag, locale)}</span>
      </h1>
      <div className="space-y-4 text-foreground/90 leading-relaxed max-w-2xl">
        <p>{getLocalizedText(localeText.description_1, locale)}</p>
        <p>{getLocalizedText(localeText.description_2, locale)}</p>
        <p>{getLocalizedText(localeText.description_3, locale)}</p>
      </div>
    </section>
  );
}
