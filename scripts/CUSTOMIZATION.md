# OG 图片样式自定义指南

## 自定义位置

在 `scripts/generate-og-images.mjs` 文件的第 54-114 行，`generateOGImage` 函数中可以自定义所有样式。

## 当前样式结构

```javascript
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
                wordWrap: "break-word",
              },
              children: title,
            },
          },
          {
            type: "div",
            props: {
              style: {
                // 🎨 副标题样式 - 可自定义网站名显示
                fontSize: 28,
                opacity: 0.9,
                marginTop: 16,
              },
              children: SITE_NAME,
            },
          },
        ],
      },
    },
    {
      width: 1200, // 🎨 可自定义图片尺寸
      height: 630,
    }
  );
}
```

## 常见自定义选项

### 1. 背景样式

```javascript
// 纯色背景
background: "#1a1a1a";

// 渐变背景（当前使用）
background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)";

// 深色主题渐变
background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)";

// GitHub 风格
background: "linear-gradient(135deg, #24292e 0%, #1a1e22 100%)";

// 暖色调
background: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)";
```

### 2. 布局调整

```javascript
// 居中布局
justifyContent: "center",
alignItems: "center",

// 左上角布局
justifyContent: "flex-start",
alignItems: "flex-start",

// 右下角布局（当前使用）
justifyContent: "flex-end",
alignItems: "flex-start",
```

### 3. 标题样式

```javascript
// 固定大小字体
fontSize: 48,

// 响应式字体（当前使用）
fontSize: Math.min(64, Math.max(32, 800 / title.length)),

// 不同字重
fontWeight: 400,  // 正常
fontWeight: 600,  // 半粗
fontWeight: 800,  // 粗体（当前）

// 字体系列
fontFamily: "Inter, sans-serif",
fontFamily: "JetBrains Mono, monospace",
```

### 4. 颜色主题

```javascript
// 深色主题
background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
color: "#f9fafb",

// 浅色主题
background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
color: "#1f2937",

// 品牌色主题
background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
color: "#ffffff",
```

## 完整样式示例

### 示例 1: 简约深色主题

```javascript
async function generateOGImage(title) {
  return new ImageResponse(
    {
      type: "div",
      props: {
        style: {
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f0f23",
          color: "#ffffff",
          padding: 80,
        },
        children: [
          {
            type: "div",
            props: {
              style: {
                fontSize: 56,
                fontWeight: 700,
                lineHeight: 1.1,
                textAlign: "center",
                marginBottom: 24,
              },
              children: title,
            },
          },
          {
            type: "div",
            props: {
              style: {
                fontSize: 24,
                opacity: 0.7,
                textAlign: "center",
              },
              children: SITE_NAME,
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
    }
  );
}
```

### 示例 2: 卡片风格

```javascript
async function generateOGImage(title) {
  return new ImageResponse(
    {
      type: "div",
      props: {
        style: {
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: 60,
        },
        children: [
          {
            type: "div",
            props: {
              style: {
                background: "rgba(255, 255, 255, 0.95)",
                borderRadius: 24,
                padding: 60,
                maxWidth: "80%",
                textAlign: "center",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: 48,
                      fontWeight: 800,
                      color: "#1f2937",
                      lineHeight: 1.2,
                      marginBottom: 16,
                    },
                    children: title,
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: 20,
                      color: "#6b7280",
                    },
                    children: SITE_NAME,
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
    }
  );
}
```

## 测试自定义样式

修改样式后，运行以下命令测试：

```bash
# 重新生成 OG 图片
pnpm generate:og

# 检查生成的图片
ls -la public/og/
```

## 高级自定义

### 添加 Logo

如果您有 base64 编码的 logo，可以这样添加：

```javascript
{
  type: "img",
  props: {
    src: "data:image/svg+xml;base64,YOUR_LOGO_BASE64",
    style: {
      width: 60,
      height: 60,
      marginBottom: 20,
    }
  }
}
```

### 根据文章类型使用不同样式

您可以修改函数接受更多参数：

```javascript
async function generateOGImage(title, category = "default") {
  const backgrounds = {
    tech: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    design: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    default: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
  };

  // 使用 backgrounds[category] 作为背景
}
```

记得修改样式后重新构建项目以查看效果！
