"use client";

import { useLocaleStore } from "@/stores/locale-store";
import { Languages } from "lucide-react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { useParams } from "next/navigation";
import { startTransition, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function LocaleToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = useLocale();
  const { dismissLanguageAlert } = useLocaleStore();
  const [currentLocale, setCurrentLocale] = useState("locale");

  useEffect(() => {
    setCurrentLocale(locale);
  }, [locale, setCurrentLocale]);

  function onToggle(nextLocale: string) {
    setCurrentLocale(nextLocale);
    dismissLanguageAlert();

    startTransition(() => {
      router.replace(
        // @ts-expect-error -- TypeScript will validate that only known `params`
        // are used in combination with a given `pathname`. Since the two will
        // always match for the current route, we can skip runtime checks.
        // { pathname: "/", params: params || {} }, // if your want to redirect to the home page
        { pathname, params: params || {} }, // if your want to redirect to the current page
        { locale: nextLocale }
      );
    });
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className="size-8 border-none"
      onClick={() => onToggle(currentLocale === "en" ? "zh" : "en")}
    >
      <Languages />
    </Button>
  );
}
