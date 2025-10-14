import { Link } from "@/i18n/routing";
import { Rss } from "lucide-react";
import { SiBilibili, SiX, SiGithub } from "@icons-pack/react-simple-icons";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer>
      <div className="text-sm flex items-center gap-4">
        <Link href="/rss" className="flex items-center gap-2">
          <Rss className="w-4 h-4" />
          <span>RSS</span>
        </Link>
        <Link href="https://github.com/xijaja" target="_blank" className="flex items-center gap-2">
          <SiGithub className="w-4 h-4" />
          <span>@xijaja</span>
        </Link>
        <Link href="https://x.com/xijaja" target="_blank" className="flex items-center gap-2">
          <SiX className="w-4 h-4" />
          <span>@xijaja</span>
        </Link>
        <Link href="https://space.bilibili.com/266752107" target="_blank" className="flex items-center gap-2">
          <SiBilibili className="w-4 h-4" />
          <span>@希嘉嘉</span>
        </Link>
      </div>
      <div className="text-sm mt-4">
        <span className="text-lg">&copy;</span> {currentYear} xiwu.io
      </div>
    </footer>
  );
}
