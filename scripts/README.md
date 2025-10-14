# 静态 OG 图片生成

## 概述

这个脚本在构建时为所有博客文章生成静态 OG (Open Graph) 图片，替代了之前的动态生成方案。

## 优势

- **性能提升**: 避免了每次访问时的动态生成，减少服务器负载
- **构建时生成**: 所有 OG 图片在构建时预生成，部署后直接提供静态文件
- **一致性**: 确保所有文章都有对应的 OG 图片
- **SEO 友好**: 静态图片加载更快，有利于社交媒体分享

## 工作原理

1. 脚本遍历 `src/content/blogs/` 下所有语言目录
2. 读取每个 `.mdx` 文件的 frontmatter
3. 跳过标记为 `draft: true` 的文章
4. 为每篇文章生成格式为 `{locale}-{slug}.png` 的 OG 图片
5. 生成一个默认的 `default.png` 用于首页等页面

## 生成的文件

- `public/og/{locale}-{slug}.png` - 每篇文章的 OG 图片
- `public/og/default.png` - 默认 OG 图片

## 使用方法

### 手动生成

```bash
pnpm generate:og
```

### 构建时自动生成

```bash
pnpm build  # 会自动先生成 OG 图片，然后构建项目
```

### 仅构建 Next.js（跳过 OG 图片生成）

```bash
pnpm build:next
```

## 文件结构

```
scripts/
├── generate-og-images.mjs  # OG 图片生成脚本
└── README.md              # 本说明文档

public/og/                 # 生成的 OG 图片目录（已添加到 .gitignore）
├── default.png
├── en-article-slug.png
└── zh-article-slug.png
```

## 注意事项

1. `public/og/` 目录已添加到 `.gitignore`，不会提交到版本控制
2. 每次构建都会重新生成所有 OG 图片
3. 图片尺寸固定为 1200x630 像素，符合 Open Graph 标准
4. 文章标题过长时会自动调整字体大小以适应画布

## 自定义

如需修改 OG 图片样式，请编辑 `scripts/generate-og-images.mjs` 中的 `generateOGImage` 函数。
