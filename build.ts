import { bundle } from "lightningcss";
import { watch } from "chokidar";
import { flavors } from "@catppuccin/palette";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const ENTRY = "src/theme.css";
const OUT = "theme.css";
const TOKENS_OUT = "src/tokens/generated.css";

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

function tokens() {
  const css = `/* generated — do not edit, run \`bun run tokens\` */
.theme-dark {
${renderFlavor("mocha")}
}

.theme-light {
${renderFlavor("latte")}
}
`;
  mkdirSync(dirname(TOKENS_OUT), { recursive: true });
  writeFileSync(TOKENS_OUT, css);
  log(`tokens → ${TOKENS_OUT}`);
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
