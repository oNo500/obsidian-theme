import { bundle } from "lightningcss";
import { watch } from "chokidar";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const ENTRY = "src/theme.css";
const OUT = "theme.css";
const TOKENS_OUT = "src/tokens/generated.css";

function tokens() {
  const css = `/* generated — do not edit, run \`bun run tokens\` */\n:root {\n  --tokens-marker: "generated";\n}\n`;
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
