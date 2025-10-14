import ThemeToggle from "../theme-toggle";
import LocaleToggle from "../locale-toggle";
import { Link } from "@/i18n/routing";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* <div className="bg-foreground text-background px-2 py-1 font-mono text-sm font-bold">xiwu</div> */}
        <Link href="/">
          <Image src="/xiwu-logo-light.png" alt="xiwu" className="block dark:hidden h-8 w-auto" width={100} height={100} />
          <Image src="/xiwu-logo-dark.png" alt="xiwu" className="hidden dark:block h-8 w-auto" width={100} height={100} />
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <ThemeToggle />
          <LocaleToggle />
        </div>
      </div>
    </nav>
  );
}
