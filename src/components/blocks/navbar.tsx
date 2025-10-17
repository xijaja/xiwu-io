import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { Link } from "@/i18n/routing";
import LocaleToggle from "../locale-toggle";
import { buttonVariants } from "../ui/button";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-background/20 backdrop-blur-sm">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        {/* <Image src="/xiwu-logo-light.png" alt="xiwu" className="block dark:hidden h-8 w-auto" width={100} height={100} />
          <Image src="/xiwu-logo-dark.png" alt="xiwu" className="hidden dark:block h-8 w-auto" width={100} height={100} /> */}
        <Link className="flex items-end gap-2" href="/">
          <div className="items-center bg-foreground px-2 py-1 font-bold font-rubik-microbe text-background text-xl">
            X
          </div>
          <h1 className="font-bold font-borel text-xl">xiwu.io</h1>
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <LocaleToggle />
          <AnimatedThemeToggler
            className={buttonVariants({ variant: "ghost", size: "icon", className: "size-8 border-none" })}
          />
        </div>
      </div>
    </nav>
  );
}
