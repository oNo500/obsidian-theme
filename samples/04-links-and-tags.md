---
title: 链接与标签测试
tags: [test, links, navigation]
aliases: [Links Test]
---

# 链接与标签

## Wikilinks（内部链接）

最常见的 wikilink：[[01-typography-cjk]]、[[02-code-blocks]]、[[loading-check]]。

带显示文本的 wikilink：[[01-typography-cjk|排版测试]]、[[02-code-blocks|代码块测试]]。

带 heading 锚点：[[01-typography-cjk#一级标题：CJK Mixed With Latin]]。

带 block 引用：[[01-typography-cjk#^block-id-1]]（指向 typography 笔记里的任务列表项）。

不存在的链接（应该有视觉提示是 unresolved）：[[这个文件不存在]]、[[non-existent-file]]。

## 外链

普通外链：[Obsidian 官方文档](https://docs.obsidian.md)、[Catppuccin Palette](https://github.com/catppuccin/palette)、[Lightning CSS](https://lightningcss.dev)。

裸 URL：<https://obsidian.md>。

## 嵌入

嵌入笔记：

![[02-code-blocks]]

嵌入 heading：

![[01-typography-cjk#二级标题 Section Two]]

## 标签

`#test` `#typography` `#code` `#callouts` `#pkm` `#obsidian-theme` `#工作流` `#中文标签`

嵌套标签：`#projects/obsidian-theme` `#projects/note-system` `#status/active` `#status/done`。

行内标签：这段话里夹一个 `#inline-tag` 看是否区分。

## Footnote

主题加载链路是 manifest → theme.css → DOM[^1]。

[^1]: 实际过程比这复杂——Obsidian 把 theme.css 内容塞进 `<style>` 标签而不是 `<link>`，导致 reload 行为跟普通 web 不同。
