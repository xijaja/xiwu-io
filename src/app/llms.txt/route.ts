// 面向大模型/AI 爬虫的抓取策略说明，可按需扩展 Allow/Disallow
import { NextResponse } from "next/server";
import { SITE_NAME, SITE_URL } from "@/lib/config";

export async function GET() {
  const body = `# LLMs crawling policy for ${SITE_NAME}
# This file is for large language models and AI crawlers.
# You may customize rules below.

Site: ${SITE_URL}
Allow: /
# Disallow sensitive paths if any, e.g.:
# Disallow: /admin
`;
  return new NextResponse(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
