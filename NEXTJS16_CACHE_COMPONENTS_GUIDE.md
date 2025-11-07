# Next.js 16 缓存组件特性迁移指南

本文档总结了从 Next.js 15 升级到 Next.js 16 并启用 `cacheComponents` 特性时遇到的问题和解决方案。

## 配置

在 `next.config.ts` 中启用缓存组件：

```typescript
const nextConfig: NextConfig = {
  cacheComponents: true,
  // ... 其他配置
};
```

## 关键问题和解决方案

### 1. 时间相关操作（`new Date()`）

**问题**：在访问 uncached data（如 `cookies()`、`headers()`、`getLocale()` 等）之前使用 `new Date()` 会导致错误。

**错误信息**：
```
Route used `new Date()` before accessing either uncached data or Request data.
```

**解决方案**：
- **方案 A**：先访问 Request data，再使用 `new Date()`
  ```typescript
  export default async function Footer() {
    await getLocale(); // 先访问 Request data
    const currentYear = new Date().getFullYear(); // 然后使用 new Date()
    return <footer>{currentYear}</footer>;
  }
  ```

- **方案 B**：对于静态生成的内容，直接硬编码年份（如果不需要动态更新）
  ```typescript
  export default function Footer() {
    return <footer>2025 xiwu.io</footer>;
  }
  ```

### 2. next-intl 与缓存组件

**问题**：`getLocale()` 等 next-intl 函数访问 uncached data，需要在 Suspense 中或使用缓存指令。

**解决方案**：

#### 静态生成场景（推荐）
在静态生成时，通过 `params` 传递 `locale`，而不是使用 `getLocale()`：

```typescript
// page.tsx
type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  return <Hero locale={locale} />;
}

// Hero.tsx
export default function Hero({ locale }: {locale: string}) {
  // 直接使用 locale prop，不需要 getLocale()
  return <h1>{getLocalizedText(text, locale)}</h1>;
}
```

**优势**：
- ✅ 保持静态预渲染
- ✅ 不需要 Suspense 边界
- ✅ 不需要缓存指令
- ✅ 性能更好

#### 动态渲染场景
如果必须使用 `getLocale()`，需要使用 `"use cache: private"` 指令：

```typescript
"use cache: private";

export default async function Component() {
  const locale = await getLocale();
  // ...
}
```

**注意**：`"use cache: private"` 会阻止静态预渲染，只在必要时使用。

### 3. 文件系统操作

**问题**：文件系统操作（`readdir`、`readFile`）被视为 uncached data。

**解决方案**：在数据获取函数中添加 `"use cache"` 指令：

```typescript
async function getBlogs(locale: string) {
  "use cache";
  const dir = path.join(process.cwd(), "src", "content", "blogs", locale);
  const files = await readdir(dir);
  // ...
}
```

**关键点**：
- `"use cache"` 指令必须放在函数内部的第一行
- 适用于静态数据读取（文件系统、数据库查询等）
- 保持静态预渲染能力

### 4. 路由段配置不兼容

**问题**：以下配置与 `cacheComponents` 不兼容：
- `export const dynamic = "error"`
- `export const revalidate = false`

**错误信息**：
```
Route segment config "dynamic" is not compatible with `nextConfig.cacheComponents`.
Route segment config "revalidate" is not compatible with `nextConfig.cacheComponents`.
```

**解决方案**：移除这些配置。`cacheComponents` 会自动处理缓存策略。

```typescript
// ❌ 移除这些
export const dynamic = "error";
export const revalidate = false;

// ✅ 保留 generateStaticParams 用于静态生成
export async function generateStaticParams() {
  return [...];
}
```

### 5. Suspense 边界

**问题**：访问 uncached data 的组件必须在 `<Suspense>` 边界内。

**解决方案**：
- **静态生成场景**：通过 props 传递数据，不需要 Suspense
- **动态渲染场景**：用 Suspense 包裹访问 uncached data 的组件

```typescript
// 动态渲染场景
<Suspense fallback={<div>Loading...</div>}>
  <ComponentThatUsesGetLocale />
</Suspense>
```

## 缓存指令对比

| 指令 | 用途 | 静态预渲染 | 访问动态数据 |
|------|------|-----------|-------------|
| `"use cache"` | 缓存静态数据读取 | ✅ 支持 | ❌ 不支持 |
| `"use cache: private"` | 缓存用户特定数据 | ❌ 不支持 | ✅ 支持 |
| 无指令 | 默认行为 | ✅ 支持 | ✅ 支持（需 Suspense） |

## 最佳实践

### 1. 静态生成优先
- 使用 `generateStaticParams` 进行静态生成
- 通过 `params` 传递数据，而不是使用 `getLocale()` 等函数
- 避免使用 `"use cache: private"`（除非必要）

### 2. 数据获取函数
- 文件系统操作：添加 `"use cache"` 指令
- 数据库查询：添加 `"use cache"` 指令
- API 调用：根据是否需要缓存决定

### 3. 组件设计
- 将数据获取逻辑分离到独立的函数中
- 在函数级别添加缓存指令，而不是组件级别
- 保持组件的可复用性

### 4. 迁移步骤

1. **启用缓存组件**
   ```typescript
   // next.config.ts
   cacheComponents: true
   ```

2. **移除不兼容配置**
   - 移除 `dynamic = "error"`
   - 移除 `revalidate = false`

3. **修复时间相关操作**
   - 先访问 Request data，再使用 `new Date()`
   - 或硬编码静态值

4. **优化 next-intl 使用**
   - 静态生成：通过 `params` 传递 `locale`
   - 动态渲染：使用 `"use cache: private"` 或 Suspense

5. **添加缓存指令**
   - 文件系统操作：添加 `"use cache"`
   - 数据库查询：添加 `"use cache"`

6. **测试验证**
   - 检查构建是否成功
   - 验证静态预渲染是否正常
   - 确认运行时无错误

## 常见错误和解决方案

### 错误 1：Uncached data accessed outside Suspense
```
Route: Uncached data was accessed outside of <Suspense>.
```
**解决**：用 Suspense 包裹组件，或使用 `"use cache"` 指令。

### 错误 2：new Date() before accessing Request data
```
Route used `new Date()` before accessing either uncached data or Request data.
```
**解决**：先访问 Request data（如 `getLocale()`），再使用 `new Date()`。

### 错误 3：Route segment config incompatible
```
Route segment config "dynamic" is not compatible with `nextConfig.cacheComponents`.
```
**解决**：移除 `dynamic` 和 `revalidate` 配置。

### 错误 4：headers() inside "use cache"
```
Route used `headers()` inside "use cache".
```
**解决**：不要在 `"use cache"` 函数中访问动态数据源，使用 `"use cache: private"` 或移除缓存指令。

## 检查清单

迁移到 Next.js 16 缓存组件时，检查以下项目：

- [ ] 移除所有 `dynamic = "error"` 配置
- [ ] 移除所有 `revalidate = false` 配置
- [ ] 修复所有 `new Date()` 使用（先访问 Request data）
- [ ] 静态生成页面：通过 `params` 传递 `locale`，不使用 `getLocale()`
- [ ] 文件系统操作：添加 `"use cache"` 指令
- [ ] 数据库查询：添加 `"use cache"` 指令（如适用）
- [ ] 动态数据访问：使用 `"use cache: private"` 或 Suspense
- [ ] 测试构建和运行时行为

## 参考资源

- [Next.js 16 缓存组件文档](https://nextjs.org/docs/app/building-your-application/caching)
- [next-intl 文档](https://next-intl-docs.vercel.app/)
- [Next.js 16 升级指南](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)

## 总结

Next.js 16 的缓存组件特性提供了更好的性能和缓存控制，但需要：

1. **理解缓存指令**：`"use cache"` vs `"use cache: private"`
2. **优化数据传递**：静态生成时通过 props 传递数据
3. **移除不兼容配置**：`dynamic` 和 `revalidate`
4. **正确处理时间**：先访问 Request data 再使用 `new Date()`

遵循这些最佳实践，可以充分利用缓存组件特性，同时保持代码的清晰和可维护性。
