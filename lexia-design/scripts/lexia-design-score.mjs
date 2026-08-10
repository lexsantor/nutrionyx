#!/usr/bin/env node
/**
 * lexia-design-score — scoring gate, history and project scaffolding.
 * Zero dependencies, Node >= 18.
 *
 * Subcommands:
 *   init  [--project-dir .]                       scaffold .lexia-design/ from plugin templates
 *   gate  --scores <file.json> [options]          evaluate thresholds, append history, emit verdict
 *   history [--project-dir .] [--format text|json] show recorded iterations
 *
 * gate options:
 *   --project-dir <dir>       default: cwd
 *   --iteration <n>           default: previous + 1
 *   --regressions <n>         visual regressions vs previous iteration (default 0)
 *   --critical-a11y <n>       unresolved critical accessibility issues (default read from scores file, else 0)
 *   --critical-usability <n>  unresolved critical usability issues (default read from scores file, else 0)
 *   --format text|json        default text
 *
 * Scores file shape:
 *   { "scores": { "TASK_CLARITY": 8, ... 15 dimensions, null = not applicable / not verified },
 *     "criticalA11y": 0, "criticalUsability": 0, "notes": { "DIMENSION": "evidence..." } }
 *
 * Exit codes: 0 = converged (all gates pass), 1 = continue iterating,
 *             2 = stop without convergence (max iterations / no progress), 3 = input error.
 *
 * The gate exists to be failed honestly. It never adjusts scores.
 */

import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync, copyFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const DIMENSIONS = [
  "TASK_CLARITY", "INFORMATION_ARCHITECTURE", "USABILITY", "ACCESSIBILITY",
  "CONTENT_INTEGRITY", "VISUAL_HIERARCHY", "TYPOGRAPHY", "COLOR_AND_CONTRAST",
  "SPACING_AND_RHYTHM", "RESPONSIVENESS", "SYSTEM_COHERENCE", "DISTINCTIVENESS",
  "MOTION_QUALITY", "PERFORMANCE", "PRODUCTION_READINESS",
];

const DEFAULT_THRESHOLDS = {
  MAX_ITERATIONS: 4,
  MIN_TOTAL_SCORE: 8.5,
  MIN_DISTINCTIVENESS_SCORE: 7.5,
  CRITICAL_ACCESSIBILITY_ISSUES: 0,
  CRITICAL_USABILITY_ISSUES: 0,
  VISUAL_REGRESSIONS: 0,
  MIN_PROGRESS_DELTA: 0.05,
};

const PLUGIN_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function arg(args, name, fallback = undefined) {
  const i = args.indexOf(name);
  return i !== -1 && args[i + 1] !== undefined ? args[i + 1] : fallback;
}

function loadThresholds(projectDir) {
  const p = join(projectDir, ".lexia-design", "project-preferences.json");
  if (!existsSync(p)) return { ...DEFAULT_THRESHOLDS };
  try {
    const prefs = JSON.parse(readFileSync(p, "utf8"));
    return { ...DEFAULT_THRESHOLDS, ...(prefs.thresholds || {}) };
  } catch {
    console.error(`warning: could not parse ${p}; using default thresholds`);
    return { ...DEFAULT_THRESHOLDS };
  }
}

function readHistory(projectDir) {
  const p = join(projectDir, ".lexia-design", "evaluation-history.jsonl");
  if (!existsSync(p)) return [];
  return readFileSync(p, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => { try { return JSON.parse(l); } catch { return null; } })
    .filter(Boolean);
}

/* ---------------------------------- init ---------------------------------- */

function init(args) {
  const projectDir = resolve(arg(args, "--project-dir", "."));
  const dir = join(projectDir, ".lexia-design");
  mkdirSync(dir, { recursive: true });
  const templates = join(PLUGIN_ROOT, "templates");
  const pairs = [
    ["DESIGN-BRIEF.md", "DESIGN-BRIEF.md"],
    ["DESIGN-SYSTEM.md", "DESIGN-SYSTEM.md"],
    ["DESIGN-AUDIT.md", "DESIGN-AUDIT.md"],
    ["project-preferences.json", "project-preferences.json"],
  ];
  const created = [];
  for (const [src, dst] of pairs) {
    const target = join(dir, dst);
    if (existsSync(target)) continue; // never overwrite
    copyFileSync(join(templates, src), target);
    created.push(dst);
  }
  for (const f of ["decisions.jsonl", "rejected-patterns.jsonl", "evaluation-history.jsonl"]) {
    const target = join(dir, f);
    if (!existsSync(target)) { writeFileSync(target, ""); created.push(f); }
  }
  console.log(created.length ? `Initialized .lexia-design/ (${created.join(", ")})` : ".lexia-design/ already complete; nothing overwritten.");
}

/* ---------------------------------- gate ---------------------------------- */

function gate(args) {
  const projectDir = resolve(arg(args, "--project-dir", "."));
  const scoresPath = arg(args, "--scores");
  const format = arg(args, "--format", "text");
  if (!scoresPath || !existsSync(scoresPath)) {
    console.error("gate: --scores <file.json> is required and must exist");
    process.exit(3);
  }
  let input;
  try { input = JSON.parse(readFileSync(scoresPath, "utf8")); } catch (e) {
    console.error(`gate: cannot parse scores file: ${e.message}`);
    process.exit(3);
  }
  const scores = input.scores || {};
  const missing = DIMENSIONS.filter((d) => !(d in scores));
  if (missing.length) {
    console.error(`gate: missing dimensions: ${missing.join(", ")} (use null for not-applicable)`);
    process.exit(3);
  }
  for (const d of DIMENSIONS) {
    const v = scores[d];
    if (v !== null && (typeof v !== "number" || v < 0 || v > 10)) {
      console.error(`gate: ${d} must be a number 0-10 or null, got ${JSON.stringify(v)}`);
      process.exit(3);
    }
  }

  const t = loadThresholds(projectDir);
  const history = readHistory(projectDir);
  const prev = history.length ? history[history.length - 1] : null;
  const iteration = parseInt(arg(args, "--iteration", prev ? String(prev.iteration + 1) : "1"), 10);
  const regressions = parseInt(arg(args, "--regressions", "0"), 10);
  const criticalA11y = parseInt(arg(args, "--critical-a11y", String(input.criticalA11y ?? 0)), 10);
  const criticalUsability = parseInt(arg(args, "--critical-usability", String(input.criticalUsability ?? 0)), 10);

  const applicable = DIMENSIONS.filter((d) => scores[d] !== null);
  const total = applicable.length
    ? Math.round((applicable.reduce((s, d) => s + scores[d], 0) / applicable.length) * 100) / 100
    : 0;

  const gates = {
    total: { value: total, min: t.MIN_TOTAL_SCORE, pass: total >= t.MIN_TOTAL_SCORE },
    distinctiveness: {
      value: scores.DISTINCTIVENESS,
      min: t.MIN_DISTINCTIVENESS_SCORE,
      pass: scores.DISTINCTIVENESS === null ? true : scores.DISTINCTIVENESS >= t.MIN_DISTINCTIVENESS_SCORE,
      note: scores.DISTINCTIVENESS === null ? "n/a" : undefined,
    },
    criticalA11y: { value: criticalA11y, max: t.CRITICAL_ACCESSIBILITY_ISSUES, pass: criticalA11y <= t.CRITICAL_ACCESSIBILITY_ISSUES },
    criticalUsability: { value: criticalUsability, max: t.CRITICAL_USABILITY_ISSUES, pass: criticalUsability <= t.CRITICAL_USABILITY_ISSUES },
    regressions: { value: regressions, max: t.VISUAL_REGRESSIONS, pass: regressions <= t.VISUAL_REGRESSIONS },
  };
  const allPass = Object.values(gates).every((g) => g.pass);

  const delta = prev ? Math.round((total - prev.total) * 100) / 100 : null;
  const improved = new Set(), regressed = new Set();
  if (prev?.scores) {
    for (const d of applicable) {
      if (typeof prev.scores[d] !== "number") continue;
      if (scores[d] > prev.scores[d]) improved.add(d);
      if (scores[d] < prev.scores[d]) regressed.add(d);
    }
  }

  let verdict;
  if (allPass) verdict = "stop-converged";
  else if (iteration >= t.MAX_ITERATIONS) verdict = "stop-max-iterations";
  else if (prev && delta !== null && delta <= t.MIN_PROGRESS_DELTA && regressed.size === 0 && improved.size === 0) verdict = "stop-no-progress";
  else verdict = "continue";

  const entry = {
    ts: new Date().toISOString(),
    iteration, scores, total, delta,
    criticalA11y, criticalUsability, regressions,
    gates: Object.fromEntries(Object.entries(gates).map(([k, g]) => [k, g.pass])),
    verdict,
    improved: [...improved], regressed: [...regressed],
    notes: input.notes || undefined,
  };
  const dir = join(projectDir, ".lexia-design");
  mkdirSync(dir, { recursive: true });
  appendFileSync(join(dir, "evaluation-history.jsonl"), JSON.stringify(entry) + "\n");

  if (format === "json") {
    console.log(JSON.stringify({ entry, thresholds: t }, null, 2));
  } else {
    console.log(`Iteration ${iteration} — TOTAL ${total} (${applicable.length}/15 dims applicable${delta !== null ? `, delta ${delta >= 0 ? "+" : ""}${delta}` : ""})`);
    for (const [name, g] of Object.entries(gates)) {
      const bound = "min" in g ? `>= ${g.min}` : `<= ${g.max}`;
      console.log(`  ${g.pass ? "PASS" : "FAIL"}  ${name} ${g.note ?? g.value} (${bound})`);
    }
    if (regressed.size) console.log(`  regressed dimensions: ${[...regressed].join(", ")} — revert what caused this or justify`);
    if (improved.size) console.log(`  improved dimensions: ${[...improved].join(", ")}`);
    console.log(`VERDICT: ${verdict}`);
    if (verdict === "stop-max-iterations") console.log("Report remaining gaps honestly; do not keep iterating.");
    if (verdict === "stop-no-progress") console.log("No measurable improvement over the previous iteration; stop and report.");
  }
  process.exit(verdict === "stop-converged" ? 0 : verdict === "continue" ? 1 : 2);
}

/* --------------------------------- history -------------------------------- */

function historyCmd(args) {
  const projectDir = resolve(arg(args, "--project-dir", "."));
  const format = arg(args, "--format", "text");
  const entries = readHistory(projectDir);
  if (format === "json") { console.log(JSON.stringify(entries, null, 2)); return; }
  if (!entries.length) { console.log("No evaluation history."); return; }
  console.log("iter | total | delta | verdict | a11y | usab | regr | ts");
  for (const e of entries) {
    console.log(`${String(e.iteration).padStart(4)} | ${String(e.total).padStart(5)} | ${e.delta === null || e.delta === undefined ? "    -" : String(e.delta).padStart(5)} | ${e.verdict.padEnd(19)} | ${e.criticalA11y} | ${e.criticalUsability} | ${e.regressions} | ${e.ts}`);
  }
}

/* ---------------------------------- main ---------------------------------- */

const [cmd, ...rest] = process.argv.slice(2);
try {
  if (cmd === "init") init(rest);
  else if (cmd === "gate") gate(rest);
  else if (cmd === "history") historyCmd(rest);
  else {
    console.error("Usage: lexia-design-score.mjs <init|gate|history> [options]  (see file header)");
    process.exit(3);
  }
} catch (err) {
  console.error(`lexia-design-score internal error: ${err?.message || err}`);
  process.exit(3);
}
