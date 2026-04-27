# 修改主题指南

写给"半年后回来想改一处的你自己"。按"想做什么 → 改哪个文件 → 怎么改"组织。

## 一张速查图

```text
我想改 ___                              文件
─────────────────────────────────────────────────────
强调色（13 ctp 色任选）                  src/tokens/accent.css
明暗模式行为                              不用改 —— 跟 Obsidian 设置走

笔记里看到的（写笔记看到的元素）            src/content/<对应名>.css
  标题 / hover 图标                       content/headings.css
  代码块 / 行内 code                       content/code.css
  callout（12 类型 + lucide 图标）          content/callouts.css
  表格                                    content/table.css
  图片（圆角 + shadow）                    content/images.css
  wikilink hover 预览                      content/popovers.css
  tags / blockquote / lists / 等           content/<对应名>.css

操作 Obsidian 看到的（UI chrome）         src/ui/<对应名>.css
  文件树 / tab / TOC                       ui/navigation.css
  文件类型图标（.canvas / .pdf 等）         ui/file-icons.css
  搜索面板（命中高亮）                      ui/search.css
  命令面板 / Quick Switcher                ui/prompt.css
  侧栏 / 状态栏 / 面包屑 / resize handle    ui/<对应名>.css

全局规则（不针对具体组件）                  src/base/<对应名>.css
  字体栈 / CJK                             base/typography.css
  最大宽度 / 行高 / scrollbar / focus 环    base/reset.css
  Obsidian 标准变量映射 / accent 喂入       base/obsidian-vars.css
  mobile / tablet                          base/responsive.css
  打印 / 导出 PDF                          base/print.css
```

## 标准开发流

```bash
# 1. 改 src/ 下的某个 .css
# 2. rebuild
bun run build

# 3. reload Obsidian（必须！改 theme.css 不会自动 reload）
obsidian reload

# 或者一次性
bun run build && obsidian reload
```

也可以开 watch 模式，省掉 build 步骤但仍要 reload：

```bash
bun run dev
```

## 常见任务清单

### 1. 换强调色

唯一切色入口，改 `src/tokens/accent.css` 4 行：

```css
body {
  --user-accent:   var(--ctp-blue);     /* mauve → blue */
  --user-accent-h: var(--ctp-blue-h);
  --user-accent-s: var(--ctp-blue-s);
  --user-accent-l: var(--ctp-blue-l);
}
```

13 选 1：`rosewater` `flamingo` `pink` `mauve` `red` `maroon` `peach` `yellow` `green` `teal` `sky` `sapphire` `blue` `lavender`。

> [!IMPORTANT]
> 不要直接在源码里覆盖 `--interactive-accent`、`--text-accent` 这类 Obsidian 派生变量。它们是从 `--accent-h/s/l` 派生出来的，必须从 H/S/L 入口切才能让派生色全套跟着走。

> [!NOTE]
> Obsidian 设置里的 accent picker **对当前主题无效**——我们用 `!important` 把 `--accent-h/s/l` 锁死到 ctp 调色板。这是有意为之，避免任意 picker 色跟 ctp 整体配色不和谐。

### 2. 调标题样式

`src/content/headings.css`。常见想改的：

```css
body {
  --h1-size: 1.8em;        /* 改这里调 H1 字号 */
  --h2-size: 1.5em;
  --h1-weight: 700;        /* 改这里调字重 */
  --h1-color: var(--ctp-text);   /* 改这里换标题字色 */
}

.markdown-rendered h1 {
  margin-top: 2.5em;       /* 改这里调标题上方间距 */
}
```

### 3. 调代码块视觉

`src/content/code.css`。圆角、内边距、字号：

```css
.markdown-rendered pre {
  border-radius: 6px;      /* 改这里 */
  padding: 0.75em 1em;
  font-size: 0.9em;
}
```

### 4. 加 / 改 callout 类型

`src/content/callouts.css`。给某 callout 类型换颜色或图标：

```css
/* 颜色：在 body { --callout-XXX: ... } 段落里 */
--callout-tip: var(--ctp-teal-rgb);   /* tip 用 teal 色 */

/* 图标：底部 data-callout 段落 */
.callout[data-callout="tip"] {
  --callout-icon: lucide-flame;       /* 换成别的 lucide 图标 */
}
```

[Lucide 图标库](https://lucide.dev) 找 icon 名替换。

### 5. 调文件树外观

`src/ui/navigation.css`。激活态、hover 态、字重：

```css
body {
  --nav-item-background-active: oklch(from var(--user-accent) l c h / 0.12);
  --nav-item-background-hover: var(--ctp-surface0);
  --nav-item-color-active: var(--user-accent);
  --nav-item-weight-active: 600;
  --nav-indentation-guide-color: transparent;   /* 缩进引导线，transparent = 隐藏 */
}
```

### 6. 调最大正文宽度

`src/base/reset.css`：

```css
body {
  --file-line-width: 750px;    /* 改这里 */
}
```

### 7. 改字体栈

`src/base/typography.css`：

```css
body {
  --font-text: "Inter", "PingFang SC", -apple-system, sans-serif;
  --font-monospace: "JetBrains Mono", "SF Mono", monospace;
}
```

### 8. 加新组件 / 视图样式

1. 在 `src/content/`（笔记元素）或 `src/ui/`（UI 元素）建新文件，比如 `src/content/foo.css`
2. 在 `src/theme.css` 加一行 `@import "./content/foo.css";`
3. `bun run build`

## Token 体系（理解后调更得心应手）

```text
Layer 1  ctp-mauve / ctp-base / ctp-text ...      ← 物理色板（generated.css，build 产物）
              ↓ 别名（user 改 accent 入口）
Layer 2  user-accent / user-accent-h/s/l           ← 语义层（accent.css，4 行切色）
              ↓ 喂入 Obsidian
Layer 3  --accent-h, --accent-s, --accent-l        ← Obsidian 标准变量（obsidian-vars.css）
              ↓ Obsidian 内部派生
最终     --interactive-accent / hover / active     ← Obsidian 自动派生整套衍生色
```

要让 Obsidian 内置 CSS 跟着切色——只能从 `--accent-h/s/l` 入口动。
要让我们自己写的规则跟着切色——用 `var(--user-accent)` 引用即可。

## ctp 色板速查

```text
背景 4 档（深 → 浅）
  --ctp-crust    (mocha #11111b)   ← 最深
  --ctp-mantle   (mocha #181825)   ← 侧栏 / titlebar / 表头
  --ctp-base     (mocha #1e1e2e)   ← 主背景
  --ctp-surface0/1/2               ← 浅底（hover、表格 row、code 行）

文字 5 档（强 → 弱）
  --ctp-text       (mocha #cdd6f4) ← 正文
  --ctp-subtext1   (mocha #bac2de) ← 次级文字
  --ctp-subtext0   (mocha #a6adc8) ← 弱化文字
  --ctp-overlay1   (mocha #7f849c) ← 文件图标灰
  --ctp-overlay0   (mocha #6c7086) ← 最弱标识

13 强调色（语义引用建议）
  rosewater  ← 温和 / quote
  flamingo
  pink
  mauve      ← 当前 accent
  red        ← danger / error / 关闭按钮
  maroon
  peach      ← warning
  yellow     ← question / faq
  green      ← success / done
  teal       ← tip / hint
  sky        ← info
  sapphire   ← abstract
  blue       ← note / 链接
  lavender   ← example / summary
```

每个色都额外暴露：

- `--ctp-XXX-h` / `-s` / `-l` —— HSL 三分量（强调色才有）
- `--ctp-XXX-rgb` —— "r, g, b" triplet（callout 等期望此格式的变量用）
- `--ctp-XXX-mocha` / `-latte` —— 永久 dark/light 色（不受主题切换影响，print 用）

## 调试速查

### 验证某个变量

```bash
obsidian eval code="getComputedStyle(document.body).getPropertyValue('--user-accent')"
```

### 验证某元素的样式

```bash
obsidian eval code="(() => { const el = document.querySelector('.markdown-rendered h2'); return getComputedStyle(el).color; })()"
```

### 截图看效果

```bash
obsidian dev:screenshot path=/tmp/check.png
```

### 列出某个变量在哪些选择器里被定义（排查覆盖问题）

```bash
obsidian eval code="(()=>{
  const out=[];
  for(const s of document.styleSheets){
    try{
      for(const r of s.cssRules){
        if(r.cssText && r.cssText.includes('--interactive-accent:')){
          out.push((r.selectorText||'?').slice(0,60))
        }
      }
    }catch{}
  }
  return out
})()"
```

## 反直觉点（踩过的坑）

> [!WARNING]
> **`@layer` 优先级低于 unlayered**——所以"覆盖 Obsidian"的规则不能放 layer 里，必须裸 `@import` 不带 layer。`@layer tokens` 只用来组织主题内部 token 命名空间隔离。

> [!WARNING]
> **变量写在 `body` 而不是 `:root`**——`theme-dark` / `theme-light` class 在 `<body>` 上，写 `:root` 取不到从 body 继承的子变量。

> [!WARNING]
> **改 theme.css 必须 `obsidian reload`**——Obsidian 把 CSS 内容塞进 `<style>` 标签缓存，不读硬盘，普通主题切换不行，得整 vault reload。

> [!WARNING]
> **flex 容器里 `vertical-align` 不生效**——`.nav-file-title` 等是 flex 容器，要垂直居中用 `align-self: center`。

> [!WARNING]
> **mask-image 在 Obsidian Electron 不可靠**——文件图标用 `background-image data-URI` 烧死 stroke 颜色；标题 hover 图标试 mask-image 也跑通了，但不是所有场景都稳。
