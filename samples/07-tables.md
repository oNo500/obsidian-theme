---
tags:
  - test
  - tables
---

# 表格测试

## 基础三列

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| name | string | 主题名 |
| version | string | 当前版本 |
| author | string | 作者 |

## 含对齐控制

| 左对齐 | 居中 | 右对齐 |
| :--- | :---: | ---: |
| Inter | PingFang | 12 |
| JetBrains Mono | 思源 | 100 |
| 等宽 fallback | 默认 | 9999 |

## 含行内格式

| 命令 | 触发 | 备注 |
| --- | --- | --- |
| `bun run build` | 改动 src 后 | 必须 reload |
| `obsidian reload` | build 之后 | **theme.css 才生效** |
| `obsidian eval` | 调试时 | 见 [README](../README.md) |

## 长内容（验证换行 / 截断行为）

| 项 | 描述 |
| --- | --- |
| 短行 | OK |
| 长行 | 这是一个相当长的中文描述，用于测试在表格单元格里中文是否会按字符拆行而不是按词，以及行高、padding 是否仍然舒适 |
| URL | https://github.com/obsidianmd/obsidian-releases/blob/master/community-css-themes.json |

## 多行多列（视觉密度）

| # | 类别 | 状态 | 优先级 | 备注 |
| ---: | --- | --- | --- | --- |
| 1 | typography | done | high | 中英混排校准完成 |
| 2 | code | done | high | 12 语言验证 |
| 3 | callouts | done | medium | 12 类型 + Lucide 图标 |
| 4 | search | done | high | 命中 accent 高亮 |
| 5 | prompt | done | high | 命令面板 + 切换器 |
| 6 | print | partial | low | 仅静态规则，未真机验证 |
| 7 | images | done | medium | 圆角 + subtle shadow |
