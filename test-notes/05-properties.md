---
title: Frontmatter Properties 测试
tags: [test, properties]
status: in-progress
priority: high
created: 2026-04-27
updated: 2026-04-27
estimated-hours: 2.5
done: false
related:
  - "[[01-typography-cjk]]"
  - "[[02-code-blocks]]"
url: https://obsidian.md
authors:
  - oNo500
  - xiu
---

# Properties 测试

这个文件主要看 frontmatter properties UI 的视觉，正文不重要。

## Properties 类型覆盖

frontmatter 里有：

- `title`：文本类型
- `tags`：列表类型（标签）
- `status`：文本（可作 select 用）
- `priority`：文本（可作 select 用）
- `created` / `updated`：日期类型
- `estimated-hours`：数字类型
- `done`：布尔类型
- `related`：列表类型（内含 wikilink）
- `url`：URL 类型
- `authors`：列表类型（多值）

切到 properties 视图（在编辑器顶部）后应能看到每种类型的 input 渲染。

## 视觉验证点

- properties 区块整体背景跟正文是否区分
- key 与 value 的对齐
- list 类型每项之间的间距
- date 类型的图标
- boolean 类型的 toggle / checkbox
- wikilink 在 properties value 里是否还能识别为链接

## 正文段落（用作 properties 上方对照）

frontmatter 是 Obsidian 的元数据系统。一篇笔记的 properties 决定了它在 Dataview 查询、Bases 视图、graph view 里如何被检索。设计 PKM 工作流时，properties 命名需要跨笔记一致——比如所有 task 笔记都用 `status` 而不是混用 `state` / `progress`。
