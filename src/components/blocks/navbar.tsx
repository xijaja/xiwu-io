import LocaleToggle from "../locale-toggle";
import { Link } from "@/i18n/routing";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { buttonVariants } from "../ui/button";

export default function Navbar() {
  return (
    <nav className="sticky bg-background/20 backdrop-blur-sm top-0 z-50">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* <Image src="/xiwu-logo-light.png" alt="xiwu" className="block dark:hidden h-8 w-auto" width={100} height={100} />
          <Image src="/xiwu-logo-dark.png" alt="xiwu" className="hidden dark:block h-8 w-auto" width={100} height={100} /> */}
        <Link href="/" className="flex items-end gap-2">
          <div className="bg-foreground text-background items-center px-2 py-1 font-rubik-microbe text-xl font-bold">X</div>
          <h1 className="font-borel text-xl font-bold">xiwu.io</h1>
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <LocaleToggle />
          <AnimatedThemeToggler className={buttonVariants({ variant: "ghost", size: "icon", className: "size-8 border-none" })} />
        </div>
      </div>
    </nav>
  );
}
