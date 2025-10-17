import {
  SiReact,
  SiGithub,
  SiFigma,
  SiNextdotjs,
  SiNotion,
  SiTypescript,
  SiDrizzle,
  SiStripe,
  SiDocker,
  SiCloudflare,
  SiVercel,
  SiReplicate,
  SiShadcnui,
} from "@icons-pack/react-simple-icons";
import type React from "react";
import Image from "next/image";

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
        {stackList.map((stack) => (
          <li key={stack.name}>
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 text-[#000000] dark:text-white">{stack.icon}</div>
              <span>{stack.name}</span>
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
      <Image src="/cursor.svg" alt="Cursor" width={20} height={20} className="dark:hidden" />
      <Image src="/cursor-dark.png" alt="Cursor" width={20} height={20} className="hidden dark:block" />
    </>
  );
}

function Xmind() {
  return (
    <>
      <Image src="/xmind.png" alt="Xmind" width={24} height={24} className="dark:hidden" />
      <Image src="/xmind-dark.png" alt="Xmind" width={24} height={24} className="hidden dark:block" />
    </>
  );
}
