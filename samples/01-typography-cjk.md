---
title: 排版与中英混排测试
tags: [test, typography]
---

# 一级标题：CJK Mixed With Latin

二级、三级在视觉上需要明显层级差。这是正文段落，混入 inline `code` 与 **粗体** 还有 *斜体*，验证字体栈在 ASCII 与中文之间是否过渡自然。Inter 配 PingFang SC 是 macOS 上最稳的组合。

## 二级标题 Section Two

行内引用形如 `process.argv[2]` 或 `getComputedStyle(document.body)`，应用等宽字体显示。中文夹 ASCII 时 *italic* 显示是否正常需要观察——很多中文字体没有 italic 字形，浏览器会模拟（合成斜体），效果通常偏丑但能用。

### 三级标题：列表测试

普通列表：

- 第一项中文
- Second item in English
- 第三项 mixed 中英 内容
- A nested list
  - 嵌套子项
  - Another nested

有序列表：

1. 第一步：克隆仓库
2. Step two: install dependencies
3. 第三步：运行 build 命令

任务列表（验证 checkbox 样式）：

- [ ] 待办：补充测试笔记 task list
- [x] 已完成：CJK 排版校准
- [ ] 进行中：调试搜索面板 ^block-id-1
- [x] 已完成：实现 file icons via SVG data-URI

#### 四级标题 H4

四级标题视觉权重应明显小于 h3——颜色从 `--ctp-text` 退到 `--ctp-subtext1`。

##### 五级标题 H5

继续渐弱。

###### 六级标题 H6

最弱档，只比正文略大。

## 段落与引用

普通段落紧接长文：当主题作者面对 Catppuccin 这样的成熟色板时，关键的不是「能否还原配色」，而是「如何在 Obsidian 的变量约束下让色板说话」。Obsidian 的 `--accent-h/s/l` 派生链路决定了主题作者对强调色的覆盖必须从源头入手——直接覆盖 `--interactive-accent` 是无效的，必须改 HSL 三分量。

> 这是一段引用。引用块通常用更弱的视觉强调，左边一条边线 + 字色降一档。
>
> 引用可以多行。它的视觉应该跟正文有节奏感，不至于完全融进正文。

引用嵌套：

> 外层引用
> > 内层引用
> > > 三层嵌套——很少见但应该能渲染

## 长段落（验证 line-height）

CSS 自定义属性的查找规则：`getComputedStyle(element).getPropertyValue('--x')` 取的是 element 自身或继承到 element 的 `--x`。如果 element 是 `<body>`，而 `--x` 通过 `:root` 选择器定义，那么 body 能取到（继承）。但 Obsidian 的 `theme-dark` / `theme-light` class 在 body 上而不是 html，所以从 `:root` 引用 `body.theme-dark` 上定义的变量时，`:root` 拿不到——因为变量查找走继承链，`:root`（即 `html`）在 `body` 之上。这就是为什么主题里所有自定义变量声明都应该写在 `body` 而不是 `:root`。

接下来一段更长的中文：当我们讨论 PKM 工具的「主题定制化」时，常常陷入一个误区——把主题做成「可分享的配置项集合」。这是社区主题作者面对陌生用户的解决思路，不是单用户自用场景的最优解。Style Settings 这类插件本质上是「主题作者 → 普通用户」的图形化桥梁；自用场景下，把开关写成 CSS class 或 frontmatter 属性，比维护一个 YAML 注释块成本更低。

## 强调与链接

正文里出现 [外链](https://obsidian.md) 与 [[wikilink]] 时，颜色应该一致——都走 `--interactive-accent`，但 wikilink 通常虚线下划线（区别于实线下划线的外链）。
