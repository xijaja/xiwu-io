import { Link } from "@/i18n/routing";
import ThemeToggle from "../theme-toggle";
import LocaleToggle from "../locale-toggle";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* <div className="bg-foreground text-background px-2 py-1 font-mono text-sm font-bold">xiwu</div> */}
        <Image src="/xiwu-logo-light.png" alt="xiwu" className="block dark:hidden" width={100} height={100} />
        <Image src="/xiwu-logo-dark.png" alt="xiwu" className="hidden dark:block" width={100} height={100} />
        <div className="flex items-center gap-6 text-sm">
          <Link href="https://x.com/xijaja" target="_blank" className="hover:text-muted-foreground transition-colors">
            X（Twitter）
          </Link>
          <Link href="https://github.com/xijaja" target="_blank" className="hover:text-muted-foreground transition-colors">
            GitHub
          </Link>
          <ThemeToggle />
          <LocaleToggle />
        </div>
      </div>
    </nav>
  );
}
