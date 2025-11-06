// 动态生成社交分享图（OG Image），供文章/首页等引用
import { ImageResponse } from "next/og";

export const runtime = "edge";

export function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") ?? "Xiwu Blog";

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-end",
        background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
        color: "#fff",
        padding: 64,
      }}
    >
      <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.2 }}>{title}</div>
      <div style={{ fontSize: 28, opacity: 0.9, marginTop: 16 }}>newblog</div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
}
