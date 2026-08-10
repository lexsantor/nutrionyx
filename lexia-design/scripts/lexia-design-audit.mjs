#!/usr/bin/env node
/**
 * lexia-design-audit — deterministic UI audit. Zero dependencies, Node >= 18.
 *
 * Modes:
 *   lexia-design-audit.mjs <file...> [--format text|json]   audit specific files
 *   lexia-design-audit.mjs --deep [dir] [--format ...]      walk a directory + project-level rules
 *   lexia-design-audit.mjs --hook                           PostToolUse hook (stdin JSON, advisory)
 *   lexia-design-audit.mjs --stop-check                     Stop hook (reminds about unresolved findings)
 *   lexia-design-audit.mjs --list-rules                     print the rule table
 *
 * Exit codes (CLI modes): 0 = no critical/serious findings, 1 = critical/serious found, 2 = internal error.
 * Hook modes always exit 0 and never block.
 *
 * The detector finds mechanical violations. `confidence: "review"` findings are
 * heuristic and require human/agent judgment — they are signals, not verdicts.
 * It never rewrites code.
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync } from "node:fs";
import { join, extname, resolve, relative } from "node:path";
import process from "node:process";

const MARKUP = new Set([".html", ".htm", ".jsx", ".tsx", ".vue", ".svelte", ".astro"]);
const STYLES = new Set([".css", ".scss", ".sass", ".less", ...MARKUP]);
const SCRIPTY = new Set([".js", ".ts", ".mjs", ".cjs", ...MARKUP]);
const ALL_EXTS = new Set([...MARKUP, ...STYLES, ...SCRIPTY]);
const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "build", ".next", ".nuxt", ".svelte-kit", "out", "coverage", "vendor", ".vercel", ".turbo", ".astro", "storybook-static"]);
const MAX_FILE_BYTES = 1_000_000;

/* ---------------------------------- rules ---------------------------------- */
// kind: "line" (regex per occurrence), "file" (single finding), "count" (threshold on occurrences)
// raw: run on raw content (default runs on comment-blanked content)
const RULES = [
  {
    id: "a11y/user-scalable-no", severity: "critical", confidence: "certain", exts: MARKUP,
    kind: "line", re: /user-scalable\s*=\s*no|maximum-scale\s*=\s*1(?:\.0)?\b/gi,
    dedupePerLine: true,
    msg: "Zoom disabled in viewport meta",
    fix: "Remove user-scalable=no / maximum-scale=1. Zoom must always work (WCAG 1.4.4).",
  },
  {
    id: "a11y/paste-blocked", severity: "critical", confidence: "certain", exts: SCRIPTY,
    kind: "line", re: /onPaste\s*=\s*\{[^}]{0,60}preventDefault|onpaste\s*=\s*["']\s*return\s+false/g,
    msg: "Paste appears to be blocked",
    fix: "Never block paste (WCAG 3.3.8; password managers, OTP). Accept input, then validate.",
  },
  {
    id: "a11y/tabindex-positive", severity: "serious", confidence: "certain", exts: MARKUP,
    kind: "line", re: /tab[iI]ndex\s*=\s*["'{]?\s*[1-9]/g,
    msg: "Positive tabindex overrides natural focus order",
    fix: "Use tabindex 0/-1 and fix DOM order instead.",
  },
  {
    id: "a11y/div-click", severity: "serious", confidence: "certain", exts: MARKUP,
    kind: "line", re: /<(div|span|p|li)\b[^>]*\son[Cc]lick/g,
    msg: "Click handler on a non-interactive element",
    fix: "Use <button> (actions) or <a> (navigation). Keyboard and AT support come free.",
  },
  {
    id: "a11y/outline-none-no-focus-visible", severity: "serious", confidence: "certain", exts: STYLES,
    kind: "file",
    test: (c) => /outline\s*:\s*(none|0)\b|outline-none/.test(c) && !/(focus-visible|focus-within|--tw-ring|\bring-)/.test(c) && !/:focus[^{}]*\{[^}]*(box-shadow|border(?!-radius)|background)/.test(c),
    re: /outline\s*:\s*(none|0)\b|outline-none/,
    msg: "Focus outline removed with no visible replacement in this file",
    fix: "Provide a :focus-visible style with >= 3:1 contrast (WCAG 2.4.7/1.4.11).",
  },
  {
    id: "a11y/img-missing-dimensions", severity: "moderate", confidence: "certain", exts: MARKUP,
    kind: "line",
    re: /<img\b(?![^>]*\bwidth\s*=)[^>]*>|<img\b(?![^>]*\bheight\s*=)[^>]*>/g,
    dedupePerLine: true,
    msg: "<img> without explicit width/height",
    fix: "Set width/height (or aspect-ratio) to reserve space and avoid CLS.",
  },
  {
    id: "a11y/icon-button-no-name", severity: "serious", confidence: "review", exts: MARKUP,
    kind: "line",
    re: /<button\b(?![^>]*aria-label)(?![^>]*aria-labelledby)(?![^>]*\btitle\s*=)[^>]*>\s*(?:\{[^}]*\}\s*)?<(svg|[A-Z][\w]*Icon|Icon\b)[\s\S]{0,300}?<\/button>/g,
    msg: "Icon-only button may lack an accessible name",
    fix: "Add aria-label (or visually-hidden text) naming the action (WCAG 4.1.2).",
  },
  {
    id: "a11y/placeholder-as-label", severity: "moderate", confidence: "review", exts: MARKUP,
    kind: "line",
    re: /<(input|textarea)\b(?![^>]*aria-label)(?![^>]*aria-labelledby)(?![^>]*type\s*=\s*["'](hidden|submit|checkbox|radio|button|file)["'])[^>]*\bplaceholder\s*=[^>]*>/g,
    msg: "Input with placeholder — verify a real associated <label> exists",
    fix: "Placeholder is an example, not a label (WCAG 3.3.2). Associate a visible label.",
  },
  {
    id: "a11y/autofocus", severity: "minor", confidence: "certain", exts: MARKUP,
    kind: "line", re: /\b(autofocus|autoFocus)\b(?=[\s=/>])/g,
    msg: "autofocus steals focus on load",
    fix: "Justify per APG guidance or remove; disorienting for AT and keyboard users.",
  },
  {
    id: "motion/transition-all", severity: "serious", confidence: "certain", exts: STYLES,
    kind: "line", re: /transition\s*:\s*all\b|(?<=["'\s])transition-all(?=["'\s])/g,
    msg: "transition: all",
    fix: "Transition named properties only (transform, opacity, color). 'all' animates layout by accident.",
  },
  {
    id: "motion/layout-prop-transition", severity: "serious", confidence: "certain", exts: STYLES,
    kind: "line",
    re: /transition\s*:\s*[^;{}]*\b(width|height|top|left|right|bottom|margin|padding|max-height|max-width)\b/g,
    msg: "Transitioning a layout property",
    fix: "Animate transform/opacity; layout properties trigger reflow every frame.",
  },
  {
    id: "motion/scale-zero-entrance", severity: "moderate", confidence: "review", exts: STYLES,
    kind: "line",
    re: /\bscale\(\s*0(?:\.0+)?\s*\)|(?<=["'\s])scale-0(?=["'\s])|scale:\s*0(?=[,\s}])/g,
    onlyIf: (c) => /transition|animation|@keyframes|gsap|motion|animate/i.test(c),
    msg: "Entrance from scale(0)",
    fix: "Nothing real appears from nothing. Enter at scale 0.95-0.97 + opacity 0.",
  },
  {
    id: "motion/no-reduced-motion-guard", severity: "serious", confidence: "review", exts: new Set([...STYLES, ...SCRIPTY]),
    kind: "file",
    test: (c) => /@keyframes|animation\s*:|animation-name|gsap\.|<motion\.|animate\s*=\s*\{|\.animate\(/.test(c) && !/prefers-reduced-motion|useReducedMotion|reduceMotion|matchMedia\(\s*["']\(prefers/.test(c),
    re: /@keyframes|animation\s*:|gsap\.|<motion\./,
    msg: "Animations declared with no reduced-motion handling in this file",
    fix: "Honor prefers-reduced-motion (WCAG technique C39): gentler variant, movement removed.",
  },
  {
    id: "motion/long-duration", severity: "minor", confidence: "review", exts: STYLES,
    kind: "line",
    re: /(?:transition|animation)[^;{}]*?(\d+(?:\.\d+)?)(ms|s)\b/g,
    valueTest: (m) => { const v = parseFloat(m[1]) * (m[2] === "s" ? 1000 : 1); return v >= 1000; },
    excludeLine: /marquee|progress|spinner|loader|spin|pulse/i,
    msg: "Animation/transition >= 1s",
    fix: "UI ceiling ~300ms; >= 1s needs narrative justification (brand surface, MOTION dial >= 6).",
  },
  {
    id: "motion/scroll-hijack-lib", severity: "moderate", confidence: "review", exts: SCRIPTY,
    kind: "line",
    re: /from\s+["'](?:@studio-freight\/)?lenis["']|from\s+["']locomotive-scroll["']|new\s+Lenis\s*\(|new\s+LocomotiveScroll\s*\(|ScrollSmoother\.create/g,
    msg: "Scroll-smoothing/hijack library in use",
    fix: "Native scroll is the default. Justify, keep keyboard/anchors working, bypass under reduced motion.",
  },
  {
    id: "slop/purple-gradient", severity: "moderate", confidence: "review", exts: STYLES,
    kind: "line",
    re: /from-(?:purple|violet|indigo|fuchsia)-\d+[^"']*to-(?:blue|cyan|sky|pink|fuchsia)-\d+|linear-gradient\([^)]*(?:#7c3aed|#8b5cf6|#a855f7|#6366f1)[^)]*(?:#3b82f6|#06b6d4|#0ea5e9|#ec4899)/gi,
    msg: "Purple-blue gradient (the default AI palette)",
    fix: "Justified only if the brand is genuinely purple. Otherwise derive color from the direction contract.",
  },
  {
    id: "slop/emoji-icon", severity: "moderate", confidence: "review", exts: MARKUP,
    kind: "line",
    re: /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu,
    dedupePerLine: true,
    msg: "Emoji in markup — likely used as a UI icon",
    fix: "Use one real icon set with consistent stroke; emoji render inconsistently and carry no system.",
  },
  {
    id: "slop/unicode-pseudo-icon", severity: "minor", confidence: "review", exts: MARKUP,
    kind: "count", threshold: 3, distinct: true,
    re: /[■□▪▫◆◇●▲▼►◄✦✧❖▣◈]/g,
    msg: "Multiple geometric glyphs used as improvised icons",
    fix: "Unicode glyphs are not an icon system. Use a real icon set or nothing.",
  },
  {
    id: "slop/eyebrow-density", severity: "minor", confidence: "review", exts: MARKUP,
    kind: "count", threshold: 4,
    re: /class(?:Name)?\s*=\s*["'][^"']*(?:uppercase[^"']*tracking-(?:wide|widest|\[)|tracking-(?:wide|widest|\[)[^"']*uppercase)[^"']*["']/g,
    msg: "High density of uppercase tracked micro-labels (eyebrows)",
    fix: "Ration eyebrows: <= 1 per 3 sections. Delete any that fail the filler test.",
  },
  {
    id: "slop/em-dash-density", severity: "minor", confidence: "review", exts: MARKUP,
    kind: "count", threshold: 3, re: /—/g,
    msg: "Repeated em-dashes in UI copy",
    fix: "Generated-text rhythm signal in microcopy. Prefer periods/commas in UI strings.",
  },
  {
    id: "slop/card-density", severity: "minor", confidence: "review", exts: MARKUP,
    kind: "count", threshold: 13,
    re: /class(?:Name)?\s*=\s*["'][^"']*rounded[^"']*(?:shadow|border)[^"']*["']|class(?:Name)?\s*=\s*["'][^"']*(?:shadow)[^"']*rounded[^"']*["']/g,
    msg: "Very high density of card-like enclosures",
    fix: "Enclosure is expensive. Group with whitespace/alignment; check for cards inside cards.",
  },
  {
    id: "content/buzzword-copy", severity: "moderate", confidence: "review", exts: MARKUP,
    kind: "line",
    re: /\b(?:seamless(?:ly)?|revolutioni[sz]e|revolutionary|next-generation|next-gen|cutting-edge|supercharge|game-chang(?:er|ing)|unleash|effortless(?:ly)?|empower(?:ing)?\s+your|unlock\s+the\s+power)\b/gi,
    msg: "Buzzword copy without evidence",
    fix: "Claims need evidence; adjectives are not evidence. Replace with a specific, true statement.",
  },
  {
    id: "content/fabricated-metrics", severity: "serious", confidence: "review", exts: MARKUP,
    kind: "line",
    re: /\b(?:trusted|loved|used)\s+by\s+[\d,.]+[km+]*\s*\+?\s*(?:users|customers|companies|teams|developers|brands)?|\b\d{1,3}(?:,\d{3})+\+\s*(?:users|customers|companies|downloads|teams)|\b9[89](?:\.\d)?%\s*(?:uptime|satisfaction|accuracy)/gi,
    msg: "Metric claim — verify it is real",
    fix: "Never fabricate metrics. Use the real number, or a clearly labeled example, or remove.",
  },
  {
    id: "content/fake-testimonial", severity: "serious", confidence: "review", exts: MARKUP,
    kind: "file",
    test: (c) => /[★⭐]/.test(c) && /(testimonial|review|rating|stars)/i.test(c),
    re: /[★⭐]/,
    msg: "Star-rated testimonial content — verify it is real",
    fix: "Fabricated testimonials are a trust and legal problem. Real quotes with permission, or cut the section.",
  },
  {
    id: "content/todo-marker", severity: "serious", confidence: "certain", exts: ALL_EXTS, raw: true,
    kind: "line", re: /TODO:?\s*implement|FIXME\b|\[TODO\]|PLACEHOLDER_/g,
    msg: "Unfinished placeholder marker",
    fix: "Ship complete implementations. Resolve or remove before delivery.",
  },
  {
    id: "content/lorem-ipsum", severity: "moderate", confidence: "certain", exts: MARKUP,
    kind: "line", re: /lorem\s+ipsum/gi,
    msg: "Lorem ipsum in UI",
    fix: "Use real content or a labeled slot ([CLIENT-PROVIDES: ...]). Design decisions made on lorem don't survive real text.",
  },
  {
    id: "system/hardcoded-hex-density", severity: "minor", confidence: "review", exts: STYLES,
    kind: "count", threshold: 9, distinct: true,
    re: /#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g,
    msg: "Many distinct hardcoded hex colors",
    fix: "Resolve visual values to tokens; off-token values drift the system.",
  },
  {
    id: "system/h-screen-vs-dvh", severity: "minor", confidence: "certain", exts: STYLES,
    kind: "line", re: /(?<=["'\s])h-screen(?=["'\s])|100vh\b/g,
    msg: "Viewport height via h-screen/100vh",
    fix: "Prefer 100dvh/100svh (mobile browser chrome changes vh).",
  },
  {
    id: "perf/will-change-broad", severity: "minor", confidence: "review", exts: STYLES,
    kind: "line", re: /will-change\s*:\s*(?:[^;]*,\s*){2,}[^;]*;|will-change\s*:\s*all/g,
    msg: "Broad will-change declaration",
    fix: "will-change on one property, applied just before animating, removed after.",
  },
  {
    id: "content/fake-status-dot", severity: "minor", confidence: "review", exts: MARKUP,
    kind: "line",
    re: /class(?:Name)?\s*=\s*["'][^"']*animate-(?:ping|pulse)[^"']*rounded-full[^"']*["']|class(?:Name)?\s*=\s*["'][^"']*rounded-full[^"']*animate-(?:ping|pulse)[^"']*["']/g,
    msg: "Pulsing dot — decorative status indicator?",
    fix: "Status indicators must report real state. Decorative liveliness is fabricated telemetry.",
  },
];

/* -------------------------------- helpers --------------------------------- */

function blankComments(src) {
  // Replace block/html comment CONTENT with spaces, preserving newlines and length.
  return src.replace(/\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, " "));
}

function lineOf(content, index) {
  let line = 1;
  for (let i = 0; i < index && i < content.length; i++) if (content[i] === "\n") line++;
  return line;
}

function snippet(content, index, len = 80) {
  const start = content.lastIndexOf("\n", index) + 1;
  let end = content.indexOf("\n", index);
  if (end === -1) end = content.length;
  return content.slice(start, end).trim().slice(0, len);
}

function auditFile(filePath) {
  const findings = [];
  const ext = extname(filePath).toLowerCase();
  if (!ALL_EXTS.has(ext)) return findings;
  let raw;
  try {
    const st = statSync(filePath);
    if (st.size > MAX_FILE_BYTES) return findings;
    raw = readFileSync(filePath, "utf8");
  } catch {
    return findings;
  }
  if (raw.includes("\u0000")) return findings; // binary
  const blanked = blankComments(raw);

  for (const rule of RULES) {
    if (!rule.exts.has(ext)) continue;
    const content = rule.raw ? raw : blanked;
    if (rule.onlyIf && !rule.onlyIf(content)) continue;

    if (rule.kind === "file") {
      if (rule.test(content)) {
        const m = rule.re.exec(content) || { index: 0 };
        findings.push(mk(rule, filePath, lineOf(content, m.index), snippet(content, m.index)));
      }
      continue;
    }

    const re = new RegExp(rule.re.source, rule.re.flags);
    if (rule.kind === "count") {
      const seen = new Set();
      let count = 0, first = null, m;
      while ((m = re.exec(content))) {
        if (rule.distinct) {
          if (seen.has(m[0].toLowerCase())) continue;
          seen.add(m[0].toLowerCase());
        }
        count++;
        if (!first) first = m.index;
        if (m.index === re.lastIndex) re.lastIndex++;
      }
      const effective = rule.distinct ? seen.size : count;
      if (effective >= rule.threshold) {
        findings.push(mk(rule, filePath, lineOf(content, first ?? 0), `${effective} occurrences (threshold ${rule.threshold})`));
      }
      continue;
    }

    // kind === "line"
    const linesSeen = new Set();
    let m;
    while ((m = re.exec(content))) {
      if (rule.valueTest && !rule.valueTest(m)) { if (m.index === re.lastIndex) re.lastIndex++; continue; }
      const ln = lineOf(content, m.index);
      const lineText = snippet(content, m.index, 120);
      if (rule.excludeLine && rule.excludeLine.test(lineText)) { if (m.index === re.lastIndex) re.lastIndex++; continue; }
      if (rule.dedupePerLine && linesSeen.has(ln)) { if (m.index === re.lastIndex) re.lastIndex++; continue; }
      linesSeen.add(ln);
      findings.push(mk(rule, filePath, ln, lineText.slice(0, 80)));
      if (m.index === re.lastIndex) re.lastIndex++;
      if (linesSeen.size > 25) break; // cap noise per rule per file
    }
  }
  return findings;
}

function mk(rule, file, line, evidence) {
  return { id: rule.id, severity: rule.severity, confidence: rule.confidence, file, line, evidence, msg: rule.msg, fix: rule.fix };
}

function walk(dir, acc = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return acc; }
  for (const e of entries) {
    if (e.name.startsWith(".") && e.name !== ".") { if (e.isDirectory()) continue; }
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      walk(join(dir, e.name), acc);
    } else if (ALL_EXTS.has(extname(e.name).toLowerCase())) {
      acc.push(join(dir, e.name));
    }
  }
  return acc;
}

function projectRules(files, contentsById) {
  const findings = [];
  const anims = files.filter((f) => /(@keyframes|animation\s*:|gsap\.|<motion\.)/.test(contentsById.get(f) || ""));
  if (anims.length) {
    const guarded = files.some((f) => /prefers-reduced-motion|useReducedMotion|reduceMotion/.test(contentsById.get(f) || ""));
    if (!guarded) {
      findings.push({
        id: "project/no-reduced-motion-anywhere", severity: "serious", confidence: "certain",
        file: anims[0], line: 1, evidence: `${anims.length} file(s) animate; no prefers-reduced-motion anywhere`,
        msg: "Project animates without any reduced-motion handling",
        fix: "Add a global reduced-motion strategy (CSS media query and/or matchMedia gate).",
      });
    }
  }
  // Token coherence against DESIGN-SYSTEM.md if present
  for (const dsPath of [".lexia-design/DESIGN-SYSTEM.md", "DESIGN-SYSTEM.md"]) {
    if (!existsSync(dsPath)) continue;
    try {
      const ds = readFileSync(dsPath, "utf8");
      const tokens = new Set((ds.match(/#[0-9a-fA-F]{6}\b/g) || []).map((h) => h.toLowerCase()));
      if (tokens.size >= 3) {
        for (const f of files) {
          if (!STYLES.has(extname(f).toLowerCase())) continue;
          const hexes = (contentsById.get(f) || "").match(/#[0-9a-fA-F]{6}\b/g) || [];
          const off = [...new Set(hexes.map((h) => h.toLowerCase()))].filter((h) => !tokens.has(h));
          if (off.length >= 3) {
            findings.push({
              id: "system/off-token-colors", severity: "moderate", confidence: "review",
              file: f, line: 1, evidence: `${off.length} hex values not in DESIGN-SYSTEM.md tokens (e.g. ${off.slice(0, 3).join(", ")})`,
              msg: "Colors outside the declared token set",
              fix: "Map to existing tokens or extend the system deliberately (log the decision).",
            });
          }
        }
      }
    } catch { /* unreadable design system file — skip */ }
    break;
  }
  return findings;
}

/* -------------------------------- output ---------------------------------- */

const SEV_ORDER = { critical: 0, serious: 1, moderate: 2, minor: 3 };

function summarize(findings) {
  const s = { critical: 0, serious: 0, moderate: 0, minor: 0, review: 0 };
  for (const f of findings) {
    s[f.severity]++;
    if (f.confidence === "review") s.review++;
  }
  return s;
}

function printText(findings, scanned) {
  const sum = summarize(findings);
  if (!findings.length) {
    console.log(`lexia-design-audit: ${scanned} file(s) scanned, no findings.`);
    return;
  }
  const sorted = [...findings].sort((a, b) => SEV_ORDER[a.severity] - SEV_ORDER[b.severity] || a.file.localeCompare(b.file));
  let current = "";
  for (const f of sorted) {
    if (f.severity !== current) {
      current = f.severity;
      console.log(`\n[${current.toUpperCase()}]`);
    }
    const conf = f.confidence === "review" ? " (review)" : "";
    console.log(`  ${f.file}:${f.line}  ${f.id}${conf}`);
    console.log(`    ${f.msg}. ${f.fix}`);
    if (f.evidence) console.log(`    evidence: ${f.evidence}`);
  }
  console.log(`\n${scanned} file(s) scanned — critical ${sum.critical}, serious ${sum.serious}, moderate ${sum.moderate}, minor ${sum.minor} (${sum.review} need human review)`);
}

function persistForHooks(findings) {
  try {
    if (!existsSync(".lexia-design")) return; // only persist inside lexia projects
    const p = ".lexia-design/last-audit.json";
    let data = { updated: new Date().toISOString(), findings: [] };
    if (existsSync(p)) {
      try { data = JSON.parse(readFileSync(p, "utf8")); } catch { /* reset corrupt file */ }
    }
    const touched = new Set(findings.map((f) => f.file));
    data.findings = (data.findings || []).filter((f) => !touched.has(f.file)).concat(findings);
    data.updated = new Date().toISOString();
    writeFileSync(p, JSON.stringify(data, null, 2));
  } catch { /* never fail the hook over persistence */ }
}

/* --------------------------------- modes ---------------------------------- */

async function readStdin() {
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  return Buffer.concat(chunks).toString("utf8");
}

async function hookMode() {
  try {
    if (process.env.LEXIA_DESIGN_HOOKS === "0") return process.exit(0);
    const payload = JSON.parse((await readStdin()) || "{}");
    const filePath = payload?.tool_input?.file_path;
    if (!filePath || !ALL_EXTS.has(extname(filePath).toLowerCase()) || !existsSync(filePath)) return process.exit(0);
    const findings = auditFile(filePath);
    if (!findings.length) return process.exit(0);
    persistForHooks(findings);
    const top = findings
      .sort((a, b) => SEV_ORDER[a.severity] - SEV_ORDER[b.severity])
      .slice(0, 10)
      .map((f) => `- [${f.severity}${f.confidence === "review" ? "/review" : ""}] ${f.id} ${relative(process.cwd(), f.file)}:${f.line} — ${f.msg}. ${f.fix}`)
      .join("\n");
    const extra = findings.length > 10 ? `\n(+${findings.length - 10} more — run the full audit)` : "";
    console.log(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: `lexia-design detector found ${findings.length} issue(s) in the file just written:\n${top}${extra}\nFix certain-confidence critical/serious items now; "review" items need judgment.`,
      },
    }));
    process.exit(0);
  } catch {
    process.exit(0); // hooks never break the flow
  }
}

async function stopCheckMode() {
  try {
    if (process.env.LEXIA_DESIGN_HOOKS === "0") return process.exit(0);
    await readStdin(); // drain
    const p = ".lexia-design/last-audit.json";
    if (!existsSync(p)) return process.exit(0);
    const data = JSON.parse(readFileSync(p, "utf8"));
    const hot = (data.findings || []).filter((f) => (f.severity === "critical" || f.severity === "serious") && f.confidence === "certain");
    if (!hot.length) return process.exit(0);
    console.log(JSON.stringify({
      systemMessage: `lexia-design: ${hot.length} unresolved critical/serious detector finding(s) in .lexia-design/last-audit.json. Fix them or waive with a reason in decisions.jsonl.`,
    }));
    process.exit(0);
  } catch {
    process.exit(0);
  }
}

function listRules() {
  console.log("id | severity | confidence | applies to");
  for (const r of RULES) {
    console.log(`${r.id} | ${r.severity} | ${r.confidence} | ${[...r.exts].join(",")}`);
  }
  console.log(`\n${RULES.length} file-level rules + 2 project-level rules (project/no-reduced-motion-anywhere, system/off-token-colors)`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--hook")) return hookMode();
  if (args.includes("--stop-check")) return stopCheckMode();
  if (args.includes("--list-rules")) return listRules();

  const format = args.includes("--format") ? args[args.indexOf("--format") + 1] : "text";
  const deep = args.includes("--deep");
  const positional = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--format");

  try {
    let files = [];
    if (deep) {
      const root = resolve(positional[0] || ".");
      files = walk(root);
    } else {
      files = positional.map((p) => resolve(p)).filter((p) => existsSync(p));
      if (!files.length) {
        console.error("Usage: lexia-design-audit.mjs <files...> | --deep [dir] [--format text|json] | --hook | --stop-check | --list-rules");
        process.exit(2);
      }
    }

    let findings = [];
    const contents = new Map();
    for (const f of files) {
      findings.push(...auditFile(f));
      if (deep) {
        try { const st = statSync(f); if (st.size <= MAX_FILE_BYTES) contents.set(f, blankComments(readFileSync(f, "utf8"))); } catch { /* skip */ }
      }
    }
    if (deep) findings.push(...projectRules(files, contents));

    findings = findings.map((f) => ({ ...f, file: relative(process.cwd(), f.file) || f.file }));

    if (format === "json") {
      console.log(JSON.stringify({ tool: "lexia-design-audit", version: "0.1.0", scanned: files.length, summary: summarize(findings), findings }, null, 2));
    } else {
      printText(findings, files.length);
    }
    const sum = summarize(findings);
    process.exit(sum.critical + sum.serious > 0 ? 1 : 0);
  } catch (err) {
    console.error(`lexia-design-audit internal error: ${err?.message || err}`);
    process.exit(2);
  }
}

main();
