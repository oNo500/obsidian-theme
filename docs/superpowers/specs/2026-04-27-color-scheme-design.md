# Color Scheme Design

**Date**: 2026-04-27
**Status**: approved, partially superseded（见文末「后续变更」）
**Scope**: 配色 token 系统首版实现，对应「上手路径」第 4-6 步

> [!NOTE]
> 这是首版决策记录，部分条目已被后续变更覆盖。当前实际行为以 [`docs/customizing.md`](../../customizing.md) 为准。变更轨迹见文末「后续变更」段落。

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

### 5. 强调色：覆盖 `--accent-h/s/l` + ctp 13 色作语义资源

两条独立链路：

**链路 A — 主交互色（覆盖 Obsidian HSL 派生入口）**

Obsidian Settings → Appearance 的 Accent picker 把用户选色拆成 `--accent-h` / `--accent-s` / `--accent-l` 写到 body 上，所有衍生强调色（`--interactive-accent` / `--interactive-accent-hover` 等）都通过 `hsl(var(--accent-h), ...)` 派生。

直接写 `--interactive-accent: var(--ctp-mauve)` 不能覆盖——Obsidian 内部规则同 specificity 但更后写入。**正确做法是覆盖 HSL 三分量**，让 Obsidian 自带的派生公式产出我们要的色。

build.ts 在 tokens 生成时给 13 个强调色额外输出 `-h/-s/-l` 分量：

```css
.theme-dark {
  --ctp-mauve: #cba6f7;
  --ctp-mauve-h: 267.4;
  --ctp-mauve-s: 83.5%;
  --ctp-mauve-l: 81.0%;
  /* ... 其它 12 色同样 */
}
```

`accent.css` 切色时同步改 4 个变量（同名）：

```css
/* src/tokens/accent.css */
body {
  --user-accent:   var(--ctp-mauve);
  --user-accent-h: var(--ctp-mauve-h);
  --user-accent-s: var(--ctp-mauve-s);
  --user-accent-l: var(--ctp-mauve-l);
}
```

`obsidian-vars.css` 把 `--accent-h/s/l` 绑到 user-accent：

```css
body {
  --accent-h: var(--user-accent-h);
  --accent-s: var(--user-accent-s);
  --accent-l: var(--user-accent-l);
}
```

切色流程：编辑 `src/tokens/accent.css` 改 4 行（`mauve` → 别的色名）→ `bun run build` → `obsidian reload`。

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
@layer reset, tokens, components, features, layouts, overrides;

@import "./tokens/generated.css"   layer(tokens);
@import "./tokens/accent.css"      layer(tokens);

/* base：覆盖 Obsidian 官方变量必须 unlayered（layer 内规则败给 Obsidian 默认 unlayered 规则） */
@import "./base/obsidian-vars.css";
```

> [!IMPORTANT]
> `base/obsidian-vars.css` 不能放在 `@layer base` 里。Obsidian 内置 CSS 是 unlayered，按 CSS Cascade Layers 规范 unlayered 规则**优先级高于任何 layer**，把覆盖规则关进 layer 等于自废武功。

被替换/删除：

- `src/tokens.css`（占位，被 `tokens/accent.css` 取代）
- `src/base.css`（占位，被 `base/obsidian-vars.css` 取代）

## 文件契约

### `src/tokens/generated.css`（自动生成）

build.ts 的 `tokens()` 函数产出。每个强调色额外多输出 3 个 HSL 分量：

```css
/* generated — do not edit, run `bun run tokens` */
.theme-dark {
  /* mocha：26 个 hex 变量 + 14 强调色 × 3 HSL 分量 */
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
body {
  /* 切色入口：从 ctp 13 强调色里选一个，名称同步改 4 行 */
  --user-accent:   var(--ctp-mauve);
  --user-accent-h: var(--ctp-mauve-h);
  --user-accent-s: var(--ctp-mauve-s);
  --user-accent-l: var(--ctp-mauve-l);
}
```

### `src/base/obsidian-vars.css`（手写）

把 Obsidian 官方核心变量绑到 ctp 名。第一版只覆盖最关键的几个：

```css
body {
  /* 三档背景 */
  --background-primary: var(--ctp-base);
  --background-secondary: var(--ctp-mantle);
  --background-modifier-border: var(--ctp-surface1);

  /* 三档文字 */
  --text-normal: var(--ctp-text);
  --text-muted: var(--ctp-subtext0);
  --text-faint: var(--ctp-overlay0);

  /* 主交互色：覆盖 Obsidian 内部 --accent-h/s/l 派生入口 */
  --accent-h: var(--user-accent-h);
  --accent-s: var(--user-accent-s);
  --accent-l: var(--user-accent-l);

  /* on-accent 背景上的文字色（Obsidian 不会自己派生这个） */
  --text-on-accent: var(--ctp-base);
}
```

后续 feature / component 阶段按需扩展更多 Obsidian 官方变量。

## build.ts 改造

`tokens()` 派生逻辑核心：

```ts
function renderFlavor(flavorName: "mocha" | "latte"): string {
  return flavors[flavorName].colorEntries
    .flatMap(([name, { hex, hsl, accent }]) => {
      const lines = [`  --ctp-${name}: ${hex};`];
      // 强调色额外输出 HSL 分量，供覆盖 Obsidian 的 --accent-h/s/l 用
      if (accent) {
        const h = hsl.h.toFixed(1);
        const s = (hsl.s * 100).toFixed(1) + "%";
        const l = (hsl.l * 100).toFixed(1) + "%";
        lines.push(
          `  --ctp-${name}-h: ${h};`,
          `  --ctp-${name}-s: ${s};`,
          `  --ctp-${name}-l: ${l};`,
        );
      }
      return lines;
    })
    .join("\n");
}
```

要点：

- `@catppuccin/palette` 的 `color.hsl` 是 `{h: number, s: 0..1, l: 0..1}`，s/l 要乘 100 加 `%` 才符合 CSS `hsl()` 语法
- `color.accent: true` 标记 13 个强调色之一（Catppuccin 实际暴露 14 个含 maroon），只对它们输出 HSL 分量

依赖：`bun add -d @catppuccin/palette`

## 验证

完成后通过 `obsidian` CLI 自动化验证（详见 `README.md` 的「调试与验证」段落）。核心检查点：

- 暗模式：`--ctp-base` = `#1e1e2e`，`--background-primary` = `#1e1e2e`，`--accent-h` ≈ 267
- 亮模式：`--ctp-base` = `#eff1f5`，`--background-primary` = `#eff1f5`，`--accent-h` ≈ 266
- `--interactive-accent` 由 Obsidian 内部 `hsl(var(--accent-h), ...)` 自动派生，应等于选中 ctp 强调色的 HSL 表示

> [!IMPORTANT]
> Obsidian 不会自动 reload 主题文件。修改 `theme.css` 后必须 `obsidian reload` 整个 vault（仅 `theme:set` 切换不重读硬盘）。

## 不做的事

- 不实现 callout / tag / code block 等具体组件着色（components 层后续工作）
- 不做色盲验证脚本
- 不做 Style Settings YAML 注释块
- 不动 `--interactive-accent` 默认尊重用户的设计——只通过 `--user-accent` 给一个切色出口（已反转，见后续变更）
- 不做 OLED 极暗模式 / 高对比度模式等子模式

## 后续变更

### 2026-04-27 — accent picker 锁死

**反转决策**：从「尊重 Obsidian picker」改为「锁死 ctp 调色板」。

**触发**：实测发现 picker 选红色后视觉「部分生效」——Obsidian 内置 CSS（按钮、链接）跟着 picker 变红，但我们自己的 CSS（用 `var(--user-accent)`）仍是 mauve。两套强调色并存，比"完全不生效"更糟。

**根因**：picker 把 `--accent-h/s/l` 写成 inline style 在 `body` 上，inline style 优先级比普通选择器规则高，我们 `body { --accent-h: var(--user-accent-h) }` 输了。

**修法**：在 obsidian-vars.css 三处 `--accent-h/s/l` 加 `!important`，重新赢回 inline style。

**当前状态**：picker 完全无效。切色仍走 `src/tokens/accent.css` 4 行 + rebuild 路径。这跟原始决策"单用户 + 不要 Style Settings + ctp 锁色"的方向一致，原 spec 第 14 行表述偏宽容了。

### 2026-04-27 — `-mocha` / `-latte` 永久后缀 token

**新增能力**：build.ts 在 generated.css 里额外输出一份不受 `theme-dark/light` class 影响的 `--ctp-XXX-mocha` / `--ctp-XXX-latte` 永久变量。

**用途**：`@media print` 之类「必须强制单 flavor」的场景之前硬编码 hex，现在改用变量。彻底消除组件 CSS 里的硬编码颜色（除了纯黑透明阴影和 SVG 内联烧死的 stroke）。
