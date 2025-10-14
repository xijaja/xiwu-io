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
} from "@icons-pack/react-simple-icons";
import React from "react";
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
      <h2 className="text-2xl font-roboto-mono font-bold mb-8">Stack_</h2>
      <ul className="grid grid-cols-5 gap-3">
        {stackList.map((stack) => (
          <li key={stack.name}>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 text-[#000000] dark:text-white">{stack.icon}</div>
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
