import { SiBilibili, SiGithub, SiX } from "@icons-pack/react-simple-icons";
import { Rss } from "lucide-react";
import { Link } from "@/i18n/routing";

export default function Footer() {
  return (
    <footer>
      <div className="flex items-center gap-4 text-sm">
        <Link className="flex items-center gap-2" href="/rss">
          <Rss className="size-4" />
          <span>RSS</span>
        </Link>
        <Link className="flex items-center gap-2" href="https://github.com/xijaja" target="_blank">
          <SiGithub className="size-4" />
          <span>@xijaja</span>
        </Link>
        <Link className="flex items-center gap-2" href="https://x.com/xijaja" target="_blank">
          <SiX className="size-4" />
          <span>@xijaja</span>
        </Link>
        <Link className="flex items-center gap-2" href="https://space.bilibili.com/266752107" target="_blank">
          <SiBilibili className="size-4" />
          <span>@希嘉嘉</span>
        </Link>
      </div>
      <div className="mt-4 text-sm">
        <span className="text-lg">&copy;</span> 2025 xiwu.io
      </div>
    </footer>
  );
}
