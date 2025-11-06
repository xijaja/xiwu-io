import {
  SiCloudflare,
  SiDocker,
  SiDrizzle,
  SiFigma,
  SiGithub,
  SiNextdotjs,
  SiNotion,
  SiReact,
  SiReplicate,
  SiShadcnui,
  SiStripe,
  SiTypescript,
  SiVercel,
} from "@icons-pack/react-simple-icons";
import Image from "next/image";
import type React from "react";

type stack = {
  name: string;
  icon: React.ReactNode;
};

const stackList: stack[] = [
  { name: "Axure", icon: "RP" },
  { name: "Figma", icon: <SiFigma /> },
  { name: "Xmind", icon: <Xmind /> },
  { name: "Next.js", icon: <SiNextdotjs /> },
  { name: "ShadcnUI", icon: <SiShadcnui /> },
  { name: "Notion", icon: <SiNotion /> },
  { name: "Cursor", icon: <Cursor /> },
  { name: "Github", icon: <SiGithub /> },
  { name: "React", icon: <SiReact /> },
  { name: "TypeScript", icon: <SiTypescript /> },
  { name: "Drizzle", icon: <SiDrizzle /> },
  { name: "Stripe", icon: <SiStripe /> },
  { name: "Docker", icon: <SiDocker /> },
  { name: "Cloudflare", icon: <SiCloudflare /> },
  { name: "Vercel", icon: <SiVercel /> },
  { name: "Replicate", icon: <SiReplicate /> },
].sort((a, b) => a.name.localeCompare(b.name));

export default function Stack() {
  return (
    <section>
      <h2 className="mb-8 font-bold font-roboto-mono text-2xl">Stack_</h2>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stackList.map((item) => (
          <li key={item.name}>
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 text-[#000000] dark:text-white">{item.icon}</div>
              <span>{item.name}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Cursor() {
  return (
    <>
      <Image alt="Cursor" className="dark:hidden" height={20} src="/cursor.svg" width={20} />
      <Image alt="Cursor" className="hidden dark:block" height={20} src="/cursor-dark.png" width={20} />
    </>
  );
}

function Xmind() {
  return (
    <>
      <Image alt="Xmind" className="dark:hidden" height={24} src="/xmind.png" width={24} />
      <Image alt="Xmind" className="hidden dark:block" height={24} src="/xmind-dark.png" width={24} />
    </>
  );
}
