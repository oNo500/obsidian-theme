# Loading Check

打开 DevTools (`Cmd+Opt+I`) → Console，运行：

```js
getComputedStyle(document.body).getPropertyValue('--theme-loaded-marker')
```

应输出 `"obsidian-theme v0.0.1"`。
