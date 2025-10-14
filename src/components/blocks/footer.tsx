import { Link } from "@/i18n/routing";
import { Link2, Rss, Twitter, Tv } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer>
      <div className="text-sm flex items-center gap-4">
        <Link
          href="https://xiwu.io/rss.xml"
          className="flex items-center gap-2"
        >
          <Rss className="w-4 h-4" />
          <span>RSS</span>
        </Link>
        <Link
          href="https://github.com/xijaja"
          target="_blank"
          className="flex items-center gap-2"
        >
          <Link2 className="w-4 h-4" />
          <span>GitHub</span>
        </Link>
        <Link
          href="https://x.com/xijaja"
          target="_blank"
          className="flex items-center gap-2"
        >
          <Twitter className="w-4 h-4" />
          <span>X</span>
        </Link>
        <Link
          href="https://space.bilibili.com/266752107"
          target="_blank"
          className="flex items-center gap-2"
        >
          <Tv className="w-4 h-4" />
          <span>Bilibili</span>
        </Link>
      </div>
      <div className="text-sm mt-4">
        <span className="text-lg">&copy;</span> {currentYear} xiwu.io
      </div>
    </footer>
  );
}
