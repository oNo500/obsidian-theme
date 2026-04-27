# obsidian-theme

为自己定制的 Obsidian 主题。基于 Catppuccin 配色，原生 CSS + `@layer` 分层，bun 驱动的单脚本 build pipeline。

## 设计与决策

- 完整决策记录：vault 笔记 `00-inbox/obsidian-theme.md`
- 配色架构 spec：[`docs/superpowers/specs/2026-04-27-color-scheme-design.md`](docs/superpowers/specs/2026-04-27-color-scheme-design.md)

## 项目结构

```text
.
├── manifest.json                # Obsidian 主题元数据
├── theme.css                    # build 产物，Obsidian 加载入口
├── build.ts                     # 唯一基础设施：tokens / build / watch 三个子命令
├── src/
│   ├── theme.css                # CSS 入口：@layer 声明 + @import
│   ├── tokens/
│   │   ├── generated.css        # 自动生成：Catppuccin mocha + latte 色板
│   │   └── accent.css           # 切色入口：改这里 4 行
│   └── base/
│       └── obsidian-vars.css    # 覆盖 Obsidian 官方变量（必须 unlayered）
├── test-notes/                  # 仓库本身是 dev vault，测试笔记放这里
└── .obsidian/themes/obsidian-theme  # symlink → 仓库根（让 Obsidian 把仓库当主题）
```

## 开发命令

```bash
bun install              # 装依赖
bun run tokens           # 重新生成 src/tokens/generated.css
bun run build            # 生产构建：minified theme.css
bun run dev              # watch 模式：改 src/ 自动 rebuild
```

仓库本身是 Obsidian dev vault：用 Obsidian 「Open folder as vault」选这个目录即可。

## 切色

编辑 `src/tokens/accent.css`，把 `mauve` 替换成 13 个 ctp 强调色任一（rosewater / flamingo / pink / mauve / red / maroon / peach / yellow / green / teal / sky / sapphire / blue / lavender）：

```css
body {
  --user-accent:   var(--ctp-blue);
  --user-accent-h: var(--ctp-blue-h);
  --user-accent-s: var(--ctp-blue-s);
  --user-accent-l: var(--ctp-blue-l);
}
```

然后：

```bash
bun run build
obsidian reload
```

## 调试与验证

主题 CSS 不通过 `<link>` 加载——Obsidian 把 `theme.css` 内容塞进 `<style>` 标签。所以普通的 reload-on-disk-change 没用，必须显式 reload。

### `obsidian` CLI 是核心调试工具

[obsidian-cli](https://github.com/Yakitrak/obsidian-cli)（`brew install obsidian-cli`）能在运行中的 Obsidian 实例里 eval JS、查 CSS、reload vault。

> [!IMPORTANT]
> 修改 `theme.css` 后**必须 reload 整个 vault**。仅切换主题（`theme:set`）不会重读硬盘——Obsidian 会从内存返回旧版本 CSS。
>
> ```bash
> bun run build && obsidian reload
> ```

### 读 CSS 变量

```bash
obsidian eval code="getComputedStyle(document.body).getPropertyValue('--ctp-base')"
# => #1e1e2e
```

一次读多个：

```bash
obsidian eval code="JSON.stringify({
  ctpBase:   getComputedStyle(document.body).getPropertyValue('--ctp-base'),
  bgPrimary: getComputedStyle(document.body).getPropertyValue('--background-primary'),
  accent:    getComputedStyle(document.body).getPropertyValue('--interactive-accent'),
  mode:      document.body.classList.contains('theme-dark') ? 'dark' : 'light'
})"
```

### 切换亮暗模式

```bash
obsidian command id="theme:toggle-light-dark"
```

### 确认 CSS 真的加载到 DOM

```bash
obsidian eval code="[...document.querySelectorAll('style')]
  .map(s=>(s.textContent||'').slice(0,80))
  .filter(t=>t.includes('--ctp-'))"
```

返回非空数组 = `theme.css` 已进 DOM。空数组 = 主题没加载（多半是没 reload）。

### 排查变量被覆盖

如果 `getComputedStyle` 返回 Obsidian 默认色而不是你设的色：

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

会列出所有定义该变量的选择器。如果 Obsidian 自带规则在我们之后，需要：

- 调整选择器特异性（`body` → `body.theme-dark` 等）
- 或覆盖 Obsidian 的派生入口（如 `--accent-h/s/l` 而非 `--interactive-accent`）

### 常用 obsidian-cli 命令

```bash
obsidian themes                          # 列已安装主题
obsidian theme                           # 当前激活主题
obsidian theme:set name="obsidian-theme"
obsidian reload                          # reload vault（应用主题改动必须做）
obsidian commands                        # 列所有可执行命令 ID
obsidian dev:errors                      # 查 console errors
obsidian dev:screenshot path=x.png       # 截图（验视觉效果）
obsidian dev:dom selector="..."          # DOM inspect
```

## CSS 架构要点

`@layer` 优先级低于 unlayered 规则——这是 CSS Cascade Layers 规范。Obsidian 内置 CSS 全部 unlayered，所以：

- **覆盖 Obsidian 官方变量的规则**必须 unlayered（`base/obsidian-vars.css` 直接 `@import` 不带 layer）
- **主题内部资源的 token / 派生**才放 `@layer tokens`（不跟 Obsidian 冲突，layer 用来管理主题内部规则的顺序）

`--interactive-accent` 等强调色不能直接写值覆盖——Obsidian 通过 `hsl(var(--accent-h), var(--accent-s), var(--accent-l))` 派生衍生强调色（hover / active / disabled）。覆盖派生入口（`--accent-h/s/l`）才能让整套衍生色一起生效。

CSS 变量要写在 `body` 选择器上而非 `:root`——Obsidian 的 `theme-dark` / `theme-light` class 在 `<body>` 上，写 `:root` 可能拿不到从 `.theme-dark` 继承的子变量。

## 依赖

- [bun](https://bun.com) ≥ 1.3
- [@catppuccin/palette](https://github.com/catppuccin/palette) — 配色源数据
- [lightningcss](https://lightningcss.dev) — CSS bundler
- [chokidar](https://github.com/paulmillr/chokidar) — watch 模式
- [obsidian-cli](https://github.com/Yakitrak/obsidian-cli) — 开发调试（`brew install obsidian-cli`）
