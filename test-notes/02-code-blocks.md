---
title: 代码块测试
tags: [test, code]
---

# 代码块语法高亮

## TypeScript

```ts
import { bundle } from "lightningcss";
import { flavors } from "@catppuccin/palette";

interface Color {
  hex: string;
  hsl: { h: number; s: number; l: number };
  accent: boolean;
}

function renderFlavor(name: "mocha" | "latte"): string {
  return flavors[name].colorEntries
    .flatMap(([key, color]) => {
      const lines = [`  --ctp-${key}: ${color.hex};`];
      if (color.accent) {
        lines.push(`  --ctp-${key}-h: ${color.hsl.h.toFixed(1)};`);
      }
      return lines;
    })
    .join("\n");
}

// 行内注释：检查 comment token 是否走 ctp-overlay0
const result = renderFlavor("mocha");
console.log(`Generated ${result.length} characters`);
```

## JavaScript（含模板字符串）

```js
const greet = (name) => `Hello, ${name}!`;
const numbers = [1, 2, 3, 4, 5].map((n) => n * 2);
const obj = { foo: "bar", count: 42, active: true };

// async/await 关键字
async function fetchData(url) {
  const res = await fetch(url);
  return res.json();
}
```

## Python

```python
from dataclasses import dataclass
from typing import Optional

@dataclass
class User:
    name: str
    age: int
    email: Optional[str] = None

    def greet(self) -> str:
        return f"Hello, {self.name}!"

# 列表推导式
squares = [x ** 2 for x in range(10)]
filtered = [u for u in users if u.age >= 18]
```

## CSS（验证选择器、属性、值）

```css
@layer reset, tokens, overrides;

body {
  --background-primary: var(--ctp-base);
  font-family: "Inter", "PingFang SC", sans-serif;
}

.markdown-rendered h1 {
  border-left: 3px solid var(--interactive-accent);
  padding-left: 0.6em;
  font-weight: 700;
}

@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
}
```

## Bash

```bash
#!/usr/bin/env bash
set -euo pipefail

# 装依赖并 build
bun install
bun run build

# 验证 theme.css 体积
file_size=$(wc -c < theme.css)
if [[ $file_size -gt 50000 ]]; then
  echo "theme.css too large: $file_size bytes"
  exit 1
fi
```

## Diff（验证 diff 高亮）

```diff
- const old = require("lightningcss");
+ import { bundle } from "lightningcss";

  function build() {
-   const result = old.transform({ code: source });
+   const { code } = bundle({ filename: "src/theme.css" });
    writeFileSync("theme.css", code);
  }
```

## 长代码（验证横向滚动）

```ts
const veryLongVariableName = someFunctionCall(argument1, argument2, argument3, { configKey1: "long string value", configKey2: 42, configKey3: true, configKey4: ["a", "b", "c"] });
```

## 行内 code

正文里穿插 `process.argv[2]`、`getComputedStyle()`、`document.body.classList.contains('theme-dark')`、`@catppuccin/palette` 等行内代码，应该有浅背景 + 内边距，不贴着正文文字。

文件路径形如 `src/components/code.css` 或 `~/.obsidian/themes/obsidian-theme/manifest.json` 也走行内 code。

## JSON

```json
{
  "name": "obsidian-theme",
  "version": "0.0.1",
  "minAppVersion": "1.9.0",
  "scripts": {
    "build": "bun build.ts build",
    "dev": "bun build.ts watch"
  },
  "devDependencies": {
    "@catppuccin/palette": "^1.8.0",
    "lightningcss": "^1.32.0"
  }
}
```
