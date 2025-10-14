#!/usr/bin/env node
/**
 * 构建时生成静态 OG 图片
 * 遍历所有博客文章，为每篇文章生成对应的 OG 图片
 */

import { readdir, readFile, mkdir, writeFile } from "fs/promises";
import matter from "gray-matter";
import path from "path";
import { ImageResponse } from "@vercel/og";

// 配置
const SITE_NAME = "xiwu.io";
const LOCALES = ["en", "zh"];

// 获取所有博客文章
async function getAllBlogPosts() {
  const posts = [];
  
  for (const locale of LOCALES) {
    const blogDir = path.join(process.cwd(), "src", "content", "blogs", locale);
    
    try {
      const files = await readdir(blogDir);
      
      for (const file of files.filter(f => f.endsWith(".mdx"))) {
        const source = await readFile(path.join(blogDir, file), "utf8");
        const { data } = matter(source);
        
        // 跳过草稿
        if (data?.draft === true) continue;
        
        // 获取 slug：优先使用 frontmatter.slug，否则使用文件名
        const fmSlug = typeof data?.slug === "string" && data.slug.trim().length > 0 ? data.slug : undefined;
        const slug = fmSlug ?? file.replace(/\.mdx$/, "");
        
        posts.push({
          locale,
          slug,
          title: data?.title ?? slug,
          description: data?.description,
          date: data?.date,
        });
      }
    } catch (error) {
      console.warn(`无法读取 ${locale} 语言的博客目录:`, error);
    }
  }
  
  return posts;
}

// 生成 OG 图片
async function generateOGImage(title) {
  return new ImageResponse(
    {
      type: "div",
      props: {
        style: {
          // 🎨 容器样式 - 可自定义背景、布局等
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
          color: "#fff",
          padding: 64,
        },
        children: [
          {
            type: "div",
            props: {
              style: {
                 // 🎨 标题样式 - 可自定义字体、大小、颜色等
                fontSize: Math.min(64, Math.max(32, 800 / title.length)),
                fontWeight: 800,
                lineHeight: 1.2,
                maxWidth: "100%",
                wordWrap: "break-word"
              },
              children: title
            }
          },
          {
            type: "div",
            props: {
              style: {
                // 🎨 副标题样式 - 可自定义字体、大小、颜色等
                fontSize: 28,
                opacity: 0.9,
                marginTop: 16
              },
              children: SITE_NAME
            }
          }
        ]
      }
    },
    {
      // 🎨 图片尺寸 - 可自定义宽度、高度等
      width: 1200,
      height: 630,
    }
  );
}

// 主函数
async function main() {
  console.log("🎨 开始生成静态 OG 图片...");
  
  // 确保输出目录存在
  const outputDir = path.join(process.cwd(), "public", "og");
  await mkdir(outputDir, { recursive: true });
  
  // 获取所有博客文章
  const posts = await getAllBlogPosts();
  console.log(`📝 找到 ${posts.length} 篇文章`);
  
  // 生成每篇文章的 OG 图片
  let generated = 0;
  const errors = [];
  
  for (const post of posts) {
    try {
      console.log(`📸 正在生成: ${post.locale}/${post.slug}`);
      
      // 生成图片
      const imageResponse = await generateOGImage(post.title);
      const imageBuffer = await imageResponse.arrayBuffer();
      
      // 保存图片文件
      const filename = `${post.locale}-${post.slug}.png`;
      const filepath = path.join(outputDir, filename);
      await writeFile(filepath, Buffer.from(imageBuffer));
      
      generated++;
      console.log(`✅ 已生成: ${filename}`);
    } catch (error) {
      const errorMsg = `❌ 生成失败 ${post.locale}/${post.slug}: ${error}`;
      console.error(errorMsg);
      errors.push(errorMsg);
    }
  }
  
  // 生成默认的 OG 图片（用于首页等）
  try {
    console.log("📸 正在生成默认 OG 图片...");
    const defaultImageResponse = await generateOGImage(SITE_NAME);
    const defaultImageBuffer = await defaultImageResponse.arrayBuffer();
    const defaultFilepath = path.join(outputDir, "default.png");
    await writeFile(defaultFilepath, Buffer.from(defaultImageBuffer));
    generated++;
    console.log("✅ 已生成: default.png");
  } catch (error) {
    const errorMsg = `❌ 生成默认图片失败: ${error}`;
    console.error(errorMsg);
    errors.push(errorMsg);
  }
  
  // 输出结果
  console.log(`\n🎉 OG 图片生成完成!`);
  console.log(`✅ 成功生成: ${generated} 个图片`);
  
  if (errors.length > 0) {
    console.log(`❌ 失败: ${errors.length} 个`);
    for (const error of errors) {
      console.log(`   ${error}`);
    }
    process.exit(1);
  }
}

// 运行脚本
main().catch((error) => {
  console.error("❌ 脚本执行失败:", error);
  process.exit(1);
});
