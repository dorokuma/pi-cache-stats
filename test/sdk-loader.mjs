/**
 * Test SDK resolution contract (Node 22 synchronous module hooks).
 *
 * A clean clone of this repository ships no package.json / pnpm-lock.yaml and
 * no node_modules, so bare imports of @earendil-works/pi-coding-agent and
 * @earendil-works/pi-tui cannot resolve. This loader registers a resolve hook
 * that maps them onto an external host SDK:
 *
 *   PI_CACHE_STATS_TEST_SDK — path to @earendil-works/pi-coding-agent, either
 *     the package directory or its dist/ directory (same convention as
 *     resolveSdkDist() in test/helpers.mjs). When set:
 *       - "@earendil-works/pi-coding-agent"        -> <distDir>/index.js
 *       - "@earendil-works/pi-coding-agent/<sub>"  -> <distDir>/<sub>
 *       - "@earendil-works/pi-tui"                 -> PI_CACHE_STATS_TEST_TUI
 *         (package dir or dist dir, same convention) when explicitly set;
 *         otherwise a sibling @earendil-works/pi-tui of the SDK package dir
 *         (e.g. <pkgDir>/../pi-tui/dist/index.js or its package.json
 *         exports/main); otherwise require.resolve() anchored at the real
 *         SDK index.js (createRequire always honors the anchor).
 *
 * When PI_CACHE_STATS_TEST_SDK is unset every specifier is passed straight to
 * nextResolve, so a checkout that already has real node_modules keeps working.
 *
 * Loaded via `node --import ./test/sdk-loader.mjs` (see Makefile NODE_TEST);
 * run a single suite as `node --import ./test/sdk-loader.mjs test/<name>.mjs`.
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire, registerHooks } from "node:module";
import { pathToFileURL } from "node:url";

const SDK_SPEC = "@earendil-works/pi-coding-agent";
const TUI_SPEC = "@earendil-works/pi-tui";

/** Accept a package directory or a dist/ directory; return the dist dir. */
function toDistDir(dir, envName) {
  const abs = path.resolve(dir);
  if (fs.existsSync(path.join(abs, "index.js")) && fs.existsSync(path.join(abs, "core"))) {
    return abs;
  }
  const dist = path.join(abs, "dist");
  if (fs.existsSync(path.join(dist, "index.js"))) return dist;
  throw new Error(`${envName} does not look like a pi-coding-agent package or dist: ${abs}`);
}

/** Find a loadable entry point inside a package directory. */
function packageEntry(pkgDir) {
  const pkgJson = path.join(pkgDir, "package.json");
  if (!fs.existsSync(pkgJson)) return null;
  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(pkgJson, "utf8"));
  } catch {
    return null;
  }
  let entry = pkg.exports?.["."];
  if (entry && typeof entry === "object") entry = entry.import ?? entry.default ?? entry.require;
  if (typeof entry !== "string") entry = pkg.main;
  if (typeof entry !== "string") entry = "dist/index.js";
  const abs = path.join(pkgDir, entry);
  return fs.existsSync(abs) ? abs : null;
}

function resolveSdkDist() {
  const explicit = process.env.PI_CACHE_STATS_TEST_SDK;
  if (!explicit) return null;
  // Normalize through realpath so sibling candidates and the require anchor
  // below see the real package location, not a pnpm/.pnpm symlink path.
  try {
    return fs.realpathSync(toDistDir(explicit, "PI_CACHE_STATS_TEST_SDK"));
  } catch (e) {
    if (e && e.code === "ENOENT") return toDistDir(explicit, "PI_CACHE_STATS_TEST_SDK");
    throw e;
  }
}

function resolveTuiEntry(sdkDistDir) {
  const explicit = process.env.PI_CACHE_STATS_TEST_TUI;
  if (explicit) {
    const abs = path.resolve(explicit);
    const dist = path.join(abs, "dist");
    const dir = fs.existsSync(path.join(abs, "index.js")) ? abs : fs.existsSync(path.join(dist, "index.js")) ? dist : null;
    if (dir) return path.join(dir, "index.js");
    const entry = packageEntry(abs);
    if (entry) return entry;
    throw new Error(`PI_CACHE_STATS_TEST_TUI does not look like a pi-tui package or dist: ${abs}`);
  }
  const pkgDir = path.dirname(sdkDistDir);
  for (const candidate of [
    path.join(pkgDir, "node_modules", "@earendil-works", "pi-tui"),
    path.join(path.dirname(pkgDir), "pi-tui"),
    path.join(path.dirname(pkgDir), "@earendil-works", "pi-tui"),
  ]) {
    const distIndex = path.join(candidate, "dist", "index.js");
    if (fs.existsSync(distIndex)) return distIndex;
    const entry = packageEntry(candidate);
    if (entry) return entry;
  }
  try {
    // Anchor at the real SDK index.js. import.meta.resolve's second argument
    // is ignored without --experimental-import-meta-resolve, so resolve would
    // silently run from this loader's own URL instead.
    return createRequire(path.join(sdkDistDir, "index.js")).resolve(TUI_SPEC);
  } catch {
    throw new Error(`cannot resolve ${TUI_SPEC}: set PI_CACHE_STATS_TEST_TUI or place it next to the SDK package`);
  }
}

const sdkDist = resolveSdkDist();
const tuiEntry = sdkDist ? resolveTuiEntry(sdkDist) : null;

// Propagate these hooks to child node processes spawned by tests (e.g. the
// spawnSync(process.execPath, ["-e", ...]) self-checks), which would
// otherwise resolve bare SDK imports with no hook registered.
if (sdkDist) {
  const marker = "sdk-loader.mjs";
  const opts = process.env.NODE_OPTIONS ?? "";
  if (!opts.includes(marker)) {
    process.env.NODE_OPTIONS = `${opts} --import ${import.meta.url}`.trim();
  }
}

/**
 * Turn a filesystem path into a realpath'd file URL. A shortCircuit result
 * skips Node's own realpath step; without this, a symlinked package (e.g. a
 * pnpm .pnpm store entry) keeps the symlink path as its module URL and its
 * own bare dependencies (siblings under the real node_modules) fail to
 * resolve.
 */
function fileUrl(absPath) {
  try {
    return pathToFileURL(fs.realpathSync(absPath)).href;
  } catch {
    return pathToFileURL(absPath).href;
  }
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (!sdkDist) return nextResolve(specifier, context);
    if (specifier === SDK_SPEC) {
      return { url: fileUrl(path.join(sdkDist, "index.js")), shortCircuit: true };
    }
    if (specifier.startsWith(SDK_SPEC + "/")) {
      return { url: fileUrl(path.join(sdkDist, specifier.slice(SDK_SPEC.length + 1))), shortCircuit: true };
    }
    if (specifier === TUI_SPEC) {
      return { url: fileUrl(tuiEntry), shortCircuit: true };
    }
    if (specifier.startsWith(TUI_SPEC + "/")) {
      return { url: fileUrl(path.join(path.dirname(tuiEntry), specifier.slice(TUI_SPEC.length + 1))), shortCircuit: true };
    }
    return nextResolve(specifier, context);
  },
});
