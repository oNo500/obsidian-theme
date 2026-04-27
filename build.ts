import { bundle } from "lightningcss";
import { watch } from "chokidar";
import { flavors } from "@catppuccin/palette";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const ENTRY = "src/theme.css";
const OUT = "theme.css";
const TOKENS_OUT = "src/tokens/generated.css";

// 暗色档 flavor 选择：mocha（默认深紫黑）/ macchiato（次深）/ frappe（中浅）
// 改这里 → bun run tokens 重生成 generated.css
const DARK_FLAVOR = "mocha" as const;
const LIGHT_FLAVOR = "latte" as const;

type FlavorName = "mocha" | "macchiato" | "frappe" | "latte";

function renderFlavor(flavorName: FlavorName, suffix = ""): string {
  return flavors[flavorName].colorEntries
    .flatMap(([name, { hex, hsl, rgb, accent }]) => {
      const lines = [`  --ctp-${name}${suffix}: ${hex};`];
      // 强调色额外输出 HSL 分量（覆盖 Obsidian --accent-h/s/l）和 RGB triplet
      // （供 Obsidian --callout-* 这类期望 "r, g, b" 格式的变量使用）
      if (accent) {
        const h = hsl.h.toFixed(1);
        const s = (hsl.s * 100).toFixed(1) + "%";
        const l = (hsl.l * 100).toFixed(1) + "%";
        lines.push(
          `  --ctp-${name}-h${suffix}: ${h};`,
          `  --ctp-${name}-s${suffix}: ${s};`,
          `  --ctp-${name}-l${suffix}: ${l};`,
          `  --ctp-${name}-rgb${suffix}: ${rgb.r}, ${rgb.g}, ${rgb.b};`,
        );
      }
      return lines;
    })
    .join("\n");
}

function tokens() {
  // body 上无条件输出两组 -dark / -light 后缀变量，
  // 让 print 这种「必须强制单 flavor」的场景也能用变量而非硬编码 hex
  const css = `/* generated — do not edit, run \`bun run tokens\` (dark flavor: ${DARK_FLAVOR}) */
body {
${renderFlavor(DARK_FLAVOR, "-dark")}
${renderFlavor(LIGHT_FLAVOR, "-light")}
}

.theme-dark {
${renderFlavor(DARK_FLAVOR)}
}

.theme-light {
${renderFlavor(LIGHT_FLAVOR)}
}
`;
  mkdirSync(dirname(TOKENS_OUT), { recursive: true });
  writeFileSync(TOKENS_OUT, css);
  log(`tokens → ${TOKENS_OUT} (dark: ${DARK_FLAVOR})`);
}

function bundleCSS(opts: { minify: boolean }) {
  const start = performance.now();
  try {
    const { code } = bundle({
      filename: ENTRY,
      minify: opts.minify,
      sourceMap: !opts.minify,
      errorRecovery: false,
    });
    writeFileSync(OUT, code);
    const ms = (performance.now() - start).toFixed(1);
    log(`bundle → ${OUT} (${code.length}B, ${ms}ms)`);
  } catch (e) {
    error("bundle failed", (e as Error).message);
  }
}

function build() {
  tokens();
  bundleCSS({ minify: true });
}

function dev() {
  tokens();
  bundleCSS({ minify: false });
  log("watching src/ + build.ts ...");
  const watcher = watch(["src", "build.ts"], {
    ignoreInitial: true,
    ignored: (p) => p.endsWith(TOKENS_OUT),
    awaitWriteFinish: { stabilityThreshold: 50, pollInterval: 10 },
  });
  watcher.on("all", (_event, path) => {
    if (path.endsWith(".ts")) tokens();
    bundleCSS({ minify: false });
  });
}

function log(msg: string) {
  console.log(`[${time()}] ${msg}`);
}
function error(label: string, msg: string) {
  console.error(`[${time()}] ✗ ${label}: ${msg}`);
}
function time() {
  return new Date().toLocaleTimeString();
}

const cmd = process.argv[2];
switch (cmd) {
  case "tokens":
    tokens();
    break;
  case "build":
    build();
    break;
  case "watch":
    dev();
    break;
  default:
    console.error(`unknown command: ${cmd}\nusage: bun build.ts <tokens|build|watch>`);
    process.exit(1);
}
