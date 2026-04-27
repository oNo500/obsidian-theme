# CLAUDE.md — quietpaper

## Things That Will Bite You

### 主题对外暴露的色板 API

`src/tokens/generated.css` 里 `body { --ctp-*-dark / --ctp-*-light }` 看似在仓库内无人引用，
但**主题文件本身就是给用户 snippets / 第三方插件消费的色板**。grep 不到不代表 dead code。

> [!WARNING]
> 不要因 `src/` 内无引用就删 `--ctp-*` token。哪怕 `print.css` 只用了 `-light` 6 个，
> 其余的也要保留——主题输出 = public API。

### 覆盖 Obsidian 默认变量的 specificity 陷阱

Obsidian 在 `.theme-dark { ... }` 里硬编码了一堆变量（`--interactive-normal`、
`--setting-items-background` 等）。**`.theme-dark` selector specificity (0,1,0) 高于
`body` (0,0,1)**——光写 `body { --interactive-normal: ... }` 会被 default 赢。

```diff
- body { --interactive-normal: var(--ctp-surface0); }
+ .theme-dark, .theme-light { --interactive-normal: var(--ctp-surface0); }
```

同 specificity，因加载顺序在后赢——无需 `!important`。

### Settings Accent Picker 是唯一需要 `!important` 的场景

Obsidian 的 Appearance → Accent picker 把 `--accent-h/s/l` 写成 **inline style on `<body>`**。
inline style 永远赢普通 selector，唯一反制是 `!important`。

```css
body {
  --accent-h: var(--user-accent-h) !important;
  --accent-s: var(--user-accent-s) !important;
  --accent-l: var(--user-accent-l) !important;
}
```

> [!IMPORTANT]
> `!important` 只用在这一处。其它变量覆盖一律靠 specificity（见上一条），不要扩散。

### Active / Selected 状态切勿改 `font-weight`

加粗会改字符 advance width → 整行宽度跳变 → 推挤后续 sibling、截断省略号、整行 layout shift。
**激活态视觉差异只走 color 和 background，不改 weight**。

适用：file tree active item、TOC current heading、Settings 左 nav active tab、
command palette selected item 等。
反例（已修）：`--nav-item-weight-active: 600`、TOC `.is-active { font-weight: 600 }`。

永久态（标题、breadcrumb 文件名、命中字符高亮等不切换的元素）weight 任意——不抖。

### `.modal-bg` 是 `.modal-container` 的 child，不是 sibling

```js
// 验证过：
container.contains(bg) === true
bg.parentElement === container.parentElement // false
```

`.modal-bg + .modal-container .modal` 这种 sibling combinator 永远不匹配。
改类似 selector 前用 `obsidian eval` 验 DOM 关系。

### lightningcss 不会静态化 `oklch(from var())` 和 `color-mix()`

带 `var()` 的 relative color / color-mix 在 build time 不可解析，bundle 后保留为运行时表达式。
对偶发的 `:hover` / `:active` 是 OK 的；**不要在每帧渲染的元素上滥用**（如 `*` selector、
高频列表项的非 hover 态）。验证：

```bash
grep "oklch(from" theme.css        # 仍存在 = 运行时计算
grep "color-mix" theme.css         # 仍存在 = 运行时计算
```

### `obsidian` CLI 异步——`app.setting.open()` 后需要等 DOM

```bash
# 错：第二条命令时 settings 还没渲染
obsidian eval code="app.setting.open()"
obsidian dev:dom selector=".modal.mod-settings"

# 对：分两次或 sleep
obsidian eval code="app.setting.open(); 'opened'"
sleep 1
obsidian eval code="getComputedStyle(document.querySelector('.modal.mod-settings')).backgroundColor"
```

类似情况：`switcher:open`、`command-palette:open` 等触发 modal 的命令，DOM 节点不会在
命令返回前就绪。**始终单条命令打开 + 单条命令查询，中间 `sleep 1`**。

### iCloud Vault 用 cp 不用 symlink

`/Users/xiu/Library/Mobile Documents/iCloud~md~obsidian/...` 路径下的 vault：
iCloud File Coordinator 不识别 symlink，目标会被静默丢弃或反复 reset。
**`build.ts` 的 sync 命令用 `copyFileSync` 是有意的**——不要"优化"成 symlink。

### 改完 theme.css 必须 reload Obsidian

主题 CSS 不走 `<link>` 而是被注入 `<style>`，硬盘 mtime 变化不会触发 Obsidian 重读。
即便 `theme:set` 切走再切回来也不会重读（in-memory cache）。

```bash
bun run deploy && obsidian command id=app:reload
```

### Reading View 是 lazy render 的

`.markdown-rendered pre` / 标题 / callout 不在 viewport 内 = 不 mount。验证渲染前先滚到
目标内容。判定当前是否 reading view，比起检测 `.markdown-source-view` /
`.markdown-preview-view` class，**用渲染产物存在性更可靠**：

```bash
obsidian eval code="document.querySelectorAll('.markdown-rendered pre').length"
# > 0 = reading view 渲染了至少一个 code block
```

### 不要用 `eval` 强切 view mode

```bash
# 抛 TypeError: this.currentMode.getEphemeralState is not a function
obsidian eval code="leaf.setViewState({state:{mode:'preview'}})"

# 走 command 通道
obsidian command id=markdown:toggle-preview
```

`setViewState` 假设 mode instance 满足完整接口；手动构造的 state 不一定。

## CSS 架构约束

### `@layer` 优先级低于 unlayered

Obsidian 内置 CSS 全部 unlayered。本仓库分层：

- **`@layer tokens`**：`tokens/generated.css` + `tokens/accent.css` —— 主题内部色板，给后续规则消费
- **unlayered**：所有 `base/` `content/` `ui/` 文件 —— 必须不带 layer，否则覆盖不了 Obsidian default

> [!IMPORTANT]
> 新增 CSS 文件 `@import` 时**不要加 `layer(...)` 包装**，除非你明确知道这条只跟主题
> 内部规则交互。覆盖 Obsidian default 的规则必须 unlayered。

### CSS 变量写在 `body` 上，不写 `:root`

`theme-dark` / `theme-light` class 在 `<body>` 上。`:root` 拿不到 `.theme-dark` 子选择器
能继承的变量。

### 强调色不能直接覆盖派生值

```diff
- --interactive-accent: var(--ctp-mauve);  /* 只改根，hover/active 派生还是 Obsidian default */
+ --accent-h: var(--user-accent-h) !important;  /* 改 hsl 三元组，派生链全跟着走 */
+ --accent-s: var(--user-accent-s) !important;
+ --accent-l: var(--user-accent-l) !important;
```

Obsidian 用 `hsl(var(--accent-h), var(--accent-s), var(--accent-l))` 派生
`--interactive-accent`、`--interactive-accent-hover` 等。覆盖派生入口（hsl 三元组）才能
让一整套强调色一起生效。

## 调试 Recipe

### 排查变量为什么没生效

```bash
obsidian eval code="(()=>{
  const out=[];
  for(const s of document.styleSheets){
    try{
      for(const r of s.cssRules){
        if(r.cssText && r.cssText.includes('--YOUR-VAR:')){
          out.push((r.selectorText||'?').slice(0,80))
        }
      }
    }catch{}
  }
  return out
})()"
```

列出所有定义该变量的 selector。如果 Obsidian 自带规则在我们之后赢，调整 selector
specificity（见 [Things That Will Bite You](#覆盖-obsidian-默认变量的-specificity-陷阱)）。

### 确认 theme.css 真的进了 DOM

```bash
obsidian eval code="[...document.querySelectorAll('style')]
  .map(s=>(s.textContent||'').slice(0,80))
  .filter(t=>t.includes('--ctp-'))"
```

非空数组 = 已加载。空数组 = 没 reload 或 deploy 没成功。

### 一次读一组关键变量

```bash
obsidian eval code="JSON.stringify({
  ctpBase:    getComputedStyle(document.body).getPropertyValue('--ctp-base'),
  bgPrimary:  getComputedStyle(document.body).getPropertyValue('--background-primary'),
  accent:     getComputedStyle(document.body).getPropertyValue('--interactive-accent'),
  mode:       document.body.classList.contains('theme-dark') ? 'dark' : 'light'
})"
```

## 工作流

修改主题 → 验证回路始终是：

```bash
bun run deploy                                  # build + 同步到所有目标 vault
obsidian command id=app:reload                  # 让 Obsidian 重读 theme.css
sleep 1                                         # 等 DOM 重建
obsidian dev:screenshot path=/tmp/check.png     # 视觉验证
# 或 obsidian eval 验某个具体计算值
```

换主题色：编辑 `src/tokens/accent.css` 4 行 → `bun run deploy` → reload。

加 vault：编辑 `build.ts` 顶部 `TARGET_VAULTS` 数组 → 下次 `bun run deploy` 自动同步。

## 不做的事（YAGNI）

- 不抽语义 token（`--accent-tint-active` 之类）—— 目前散布的 `color-mix(... 14%)` /
  `oklch(... / 0.18)` 各处百分比有意不同（active vs hover vs highlight），归一会丢失差异
- 不 debounce watcher / 不优化 backdrop-filter —— 单用户 dev，性能边际
- 不引 SCSS / PostCSS / Tailwind —— 原生 CSS 够用
- 不暴露 Style Settings 集成 —— 用户即自己，改源码 + rebuild 是首选
