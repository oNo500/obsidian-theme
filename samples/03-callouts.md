---
title: Callout 全类型测试
tags: [test, callouts]
---

# Callout 全类型

> [!note]
> note 类型——中性信息提示。Catppuccin 一般用 blue 作 note 色。

> [!info]
> info 类型——信息说明。可以跟 note 用同色或近色（sky）。

> [!tip]
> tip 类型——技巧 / 推荐。Catppuccin 推荐 teal 或 green。

> [!success]
> success 类型——成功状态。Catppuccin 用 green。
> 
> 包含多行内容的情况。

> [!question]
> question 类型——问题 / 疑问。Catppuccin 用 yellow。

> [!warning]
> warning 类型——警告。Catppuccin 用 peach 或 yellow。
> 
> 有时候 warning 也用于「需要注意但不阻塞」。

> [!important]
> important 类型——重要事项，比 warning 更高优先级。Catppuccin 用 mauve。

> [!caution]
> caution 类型——谨慎，操作可能不可逆。Catppuccin 用 maroon。

> [!danger]
> danger 类型——危险，不可逆 / 严重后果。Catppuccin 用 red。

> [!failure]
> failure 类型——失败 / 错误结果。Catppuccin 用 red。

> [!bug]
> bug 类型——已知 bug。Catppuccin 用 red 或 maroon。

> [!example]
> example 类型——示例。Catppuccin 用 lavender 或 pink。

> [!quote]
> quote 类型——引用。Catppuccin 用 subtext0（弱化色）。

> [!abstract]
> abstract / summary 类型——摘要。Catppuccin 用 sapphire 或 sky。

> [!todo]
> todo 类型——待办。Catppuccin 用 blue。

## 嵌套 callout

> [!note]
> 外层 note
> 
> > [!warning]
> > 嵌套的 warning——视觉应有层次

## 含代码的 callout

> [!tip]
> 用 obsidian-cli 验证主题加载：
> 
> ```bash
> obsidian eval code="getComputedStyle(document.body).getPropertyValue('--ctp-base')"
> ```
> 
> 应输出 `#1e1e2e`（mocha base）或 `#eff1f5`（latte base）。
