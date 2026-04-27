# Color Scheme Design

**Date**: 2026-04-27
**Status**: approved (pending user review)
**Scope**: 配色 token 系统首版实现，对应「上手路径」第 4-6 步

## 目标

为单用户自用主题搭建配色 token 系统，要求：

- 利用 Catppuccin 成熟色板，不自行调色
- 暗模式（深夜写作）和亮模式（白天阅读）各有一套
- token 层次清晰：palette → semantic（复用 ctp 命名）→ Obsidian 官方变量
- 强调色尊重 Obsidian 用户选择，但提供单文件切色出口

非目标：

- 不做色盲验证流程（自用单场景，信任 Catppuccin 上游 a11y 工作）
- 不做 4 flavor 切换（只用 mocha + latte 两套）
- 不做 Style Settings 图形化配置

## 关键决策

### 1. Palette 来源：`@catppuccin/palette` npm 包

- build 时通过 JS API 引入：`import { flavors } from "@catppuccin/palette"`
- 仅 build-time 依赖，不进 bundle 运行时
- 上游协议有变直接 fork 或锁版本，自用场景维护成本低

### 2. Flavor 数量：mocha（暗）+ latte（亮）

- mocha 给 `.theme-dark`，latte 给 `.theme-light`
- 不引入 frappe / macchiato——非真实使用场景的死代码
- 切换由 Obsidian 用户在 Settings → Appearance 触发

### 3. 亮暗策略：双选择器各写一份

不使用 `light-dark()` CSS 函数。理由：

- 直接对应 Obsidian 的 body class 状态，源代码即类型签名
- 排查问题时一层定位，不需要追 `color-scheme` 桥接
- 选择器内部即声明，看见 `.theme-dark { --ctp-base: ... }` 一目了然

```css
.theme-dark {
  --ctp-base: <mocha base>;
  --ctp-text: <mocha text>;
  /* 全部 26 色 */
}

.theme-light {
  --ctp-base: <latte base>;
  --ctp-text: <latte text>;
  /* 全部 26 色 */
}
```

### 4. Token 层次：三层（复用 ctp 命名）

```text
@catppuccin/palette  →  --ctp-* 变量  →  Obsidian 官方变量
   (npm package)         (tokens layer)      (base layer)
```

- **不自起 semantic 名字**——直接用 ctp 体系（base / mantle / surface0-2 / overlay0-2 / subtext0-1 / text + 13 强调色）
- 微调单个色阶 → 改对应 `.theme-dark` / `.theme-light` 块里那一行
- 跨色阶系统改动 → 重新生成 generated.css

### 5. 强调色：单文件切色 + ctp 13 色作语义资源

两条独立链路：

**链路 A — 主交互色（单文件切色）**

放弃 Obsidian Settings → Appearance 的 Accent picker（HSL color picker，没法塞预设）。改为在 `src/tokens/accent.css` 里改一行变量切色。

```css
/* src/tokens/accent.css */
:root {
  --user-accent: var(--ctp-mauve);  /* 改这一行切色 */
}
```

`base` 层把它绑到 Obsidian 的 `--interactive-accent`，hover 用 oklch 派生：

```css
:root {
  --interactive-accent: var(--user-accent);
  --interactive-accent-hover: oklch(from var(--user-accent) calc(l + 0.08) c h);
}
```

切色流程：编辑 `src/tokens/accent.css` → `bun run build` → Obsidian `Cmd+R` reload。

**链路 B — 语义着色资源**

13 个 ctp 强调色（red / mauve / pink / flamingo / rosewater / peach / yellow / green / teal / sky / sapphire / blue / lavender）进 tokens 层，供未来 callout / tag / diff 高亮等场景按语义取用。

## 文件结构

```text
src/
├── theme.css                       # 入口：@layer 声明 + @import
├── tokens/
│   ├── generated.css               # build.ts tokens 产出：26 色 × {dark,light}
│   └── accent.css                  # 手写：--user-accent 切色出口
└── base/
    └── obsidian-vars.css           # 手写：Obsidian 官方变量绑到 ctp 名
```

入口 `src/theme.css`：

```css
@layer reset, tokens, base, components, features, layouts, overrides;

@import "./tokens/generated.css"    layer(tokens);
@import "./tokens/accent.css"       layer(tokens);
@import "./base/obsidian-vars.css"  layer(base);
```

被替换/删除：

- `src/tokens.css`（占位，被 `tokens/accent.css` 取代）
- `src/base.css`（占位，被 `base/obsidian-vars.css` 取代）

## 文件契约

### `src/tokens/generated.css`（自动生成）

build.ts 的 `tokens()` 函数产出：

```css
/* generated — do not edit, run `bun run tokens` */
.theme-dark {
  /* mocha：26 个变量（6 暗色背景 + 3 overlay + 2 subtext + 1 text + 14 accent，含 maroon） */
  --ctp-base: #1e1e2e;
  --ctp-mantle: #181825;
  --ctp-crust: #11111b;
  --ctp-surface0: #313244;
  --ctp-surface1: #45475a;
  --ctp-surface2: #585b70;
  --ctp-overlay0: #6c7086;
  --ctp-overlay1: #7f849c;
  --ctp-overlay2: #9399b2;
  --ctp-subtext0: #a6adc8;
  --ctp-subtext1: #bac2de;
  --ctp-text: #cdd6f4;
  --ctp-rosewater: #f5e0dc;
  --ctp-flamingo: #f2cdcd;
  --ctp-pink: #f5c2e7;
  --ctp-mauve: #cba6f7;
  --ctp-red: #f38ba8;
  --ctp-maroon: #eba0ac;
  --ctp-peach: #fab387;
  --ctp-yellow: #f9e2af;
  --ctp-green: #a6e3a1;
  --ctp-teal: #94e2d5;
  --ctp-sky: #89dceb;
  --ctp-sapphire: #74c7ec;
  --ctp-blue: #89b4fa;
  --ctp-lavender: #b4befe;
}

.theme-light {
  /* latte：同样 25 个变量，色值取 latte flavor */
  /* ... */
}
```

具体以 `@catppuccin/palette` 包的 `flavor.colors` 实际枚举为准——不手写色值，遍历 `colorEntries` 输出。

### `src/tokens/accent.css`（手写）

```css
:root {
  /* 切色入口：从 ctp 13 强调色里选一个 */
  --user-accent: var(--ctp-mauve);
}
```

### `src/base/obsidian-vars.css`（手写）

把 Obsidian 官方核心变量绑到 ctp 名。第一版只覆盖最关键的 10 个（决策文档「必背 10 个变量」）：

```css
:root {
  /* 三档背景 */
  --background-primary: var(--ctp-base);
  --background-secondary: var(--ctp-mantle);
  --background-modifier-border: var(--ctp-surface1);

  /* 三档文字 */
  --text-normal: var(--ctp-text);
  --text-muted: var(--ctp-subtext0);
  --text-faint: var(--ctp-overlay0);

  /* 强调色（链路 A） */
  --interactive-accent: var(--user-accent);
  --interactive-accent-hover: oklch(from var(--user-accent) calc(l + 0.08) c h);
  --text-on-accent: var(--ctp-base);
}
```

后续 feature / component 阶段按需扩展更多 Obsidian 官方变量。

## build.ts 改造

`tokens()` 函数从占位升级为真实派生逻辑：

```ts
import { flavors } from "@catppuccin/palette";

function tokens() {
  const dark = flavors.mocha.colorEntries
    .map(([name, { hex }]) => `  --ctp-${name}: ${hex};`)
    .join("\n");
  const light = flavors.latte.colorEntries
    .map(([name, { hex }]) => `  --ctp-${name}: ${hex};`)
    .join("\n");

  const css = `/* generated — do not edit, run \`bun run tokens\` */
.theme-dark {
${dark}
}

.theme-light {
${light}
}
`;
  mkdirSync(dirname(TOKENS_OUT), { recursive: true });
  writeFileSync(TOKENS_OUT, css);
  log(`tokens → ${TOKENS_OUT}`);
}
```

依赖：`bun add -d @catppuccin/palette`

## 验证

完成后通过两步验证：

1. **build 验证**：`bun run build` 无报错，`theme.css` 体积约 < 5KB（26 色 × 2 套 + 10 个 var binding 都很小）
2. **DevTools 验证**：在 Obsidian 加载主题，Console 跑：

```js
getComputedStyle(document.body).getPropertyValue('--ctp-base')
getComputedStyle(document.body).getPropertyValue('--interactive-accent')
```

切到 Light 模式重跑，色值应跟着变。

## 不做的事

- 不实现 callout / tag / code block 等具体组件着色（components 层后续工作）
- 不做色盲验证脚本
- 不做 Style Settings YAML 注释块
- 不动 `--interactive-accent` 默认尊重用户的设计——只通过 `--user-accent` 给一个切色出口
- 不做 OLED 极暗模式 / 高对比度模式等子模式
