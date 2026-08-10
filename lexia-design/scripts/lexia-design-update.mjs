#!/usr/bin/env node
/**
 * lexia-design-update — source drift detection for /lexia-design:update.
 * Zero dependencies, Node >= 18.
 *
 * Reads sources.lock.json, queries METADATA ONLY (git ls-remote HEAD,
 * npm view <pkg> version), compares against pinned versions, and writes an
 * UPDATE_PROPOSAL.md scaffold. It never downloads source code, never
 * executes anything remote, and never modifies the lock file or any rule:
 * applying changes is a human-approved step handled by the update skill.
 *
 * Usage:
 *   lexia-design-update.mjs --check [--json]     print drift table only
 *   lexia-design-update.mjs [--out <file>]       also write UPDATE_PROPOSAL.md (default ./UPDATE_PROPOSAL.md)
 *   lexia-design-update.mjs --offline            skip network; report staleness only
 *
 * Exit codes: 0 = ran (drift or not; see output), 2 = internal/config error.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFile } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const PLUGIN_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const LOCK_PATH = join(PLUGIN_ROOT, "sources.lock.json");
const STALE_DAYS = 90;

function run(cmd, args, timeout = 20000) {
  return new Promise((resolveP) => {
    execFile(cmd, args, { timeout, encoding: "utf8" }, (err, stdout) => {
      resolveP(err ? { ok: false, error: err.message } : { ok: true, out: stdout.trim() });
    });
  });
}

function daysSince(dateStr) {
  const then = Date.parse(dateStr);
  if (Number.isNaN(then)) return null;
  return Math.floor((Date.now() - then) / 86_400_000);
}

async function checkSource(src, offline) {
  const base = { id: src.id, type: src.type, pinned: src.commit || src.version || src.revision || "-", checked: src.checked, license: src.license };
  const age = daysSince(src.checked);
  if (src.type === "git") {
    if (offline) return { ...base, status: "skipped-offline", latest: "-" };
    const r = await run("git", ["ls-remote", src.url, "HEAD"]);
    if (!r.ok || !r.out) return { ...base, status: "unreachable", latest: "-", detail: r.error || "empty response" };
    const latest = r.out.split(/\s/)[0];
    return { ...base, latest, status: latest === src.commit ? "current" : "drift" };
  }
  if (src.type === "npm") {
    if (offline) return { ...base, status: "skipped-offline", latest: "-" };
    const r = await run("npm", ["view", src.package, "version"]);
    if (!r.ok || !r.out) return { ...base, status: "unreachable", latest: "-", detail: r.error || "empty response" };
    return { ...base, latest: r.out, status: r.out === src.version ? "current" : "drift" };
  }
  // web / spec / docs: metadata cannot be compared automatically
  return { ...base, latest: "manual", status: age !== null && age > STALE_DAYS ? "stale-recheck" : "manual-ok", ageDays: age };
}

function proposalMarkdown(results, generatedAt) {
  const drifted = results.filter((r) => r.status === "drift");
  const stale = results.filter((r) => r.status === "stale-recheck");
  const unreachable = results.filter((r) => r.status === "unreachable");
  const lines = [];
  lines.push("# UPDATE_PROPOSAL");
  lines.push("");
  lines.push(`Generated: ${generatedAt} by lexia-design-update (metadata only; no code fetched or executed).`);
  lines.push("");
  lines.push("This is a PROPOSAL. Nothing has been changed. Apply steps are listed at the end;");
  lines.push("each requires explicit approval and is reversible via git.");
  lines.push("");
  lines.push("## Drift table");
  lines.push("");
  lines.push("| source | type | pinned | latest | status | license (pinned) |");
  lines.push("|---|---|---|---|---|---|");
  for (const r of results) {
    lines.push(`| ${r.id} | ${r.type} | ${String(r.pinned).slice(0, 12)} | ${String(r.latest).slice(0, 12)} | ${r.status} | ${r.license || "-"} |`);
  }
  lines.push("");
  if (drifted.length) {
    lines.push("## Drifted sources — review checklist (per source)");
    lines.push("");
    for (const r of drifted) {
      lines.push(`### ${r.id}`);
      lines.push("");
      lines.push(`- Pinned: \`${r.pinned}\` -> latest: \`${r.latest}\``);
      lines.push("- [ ] Fetch and read the upstream diff in a scratch directory (content files + LICENSE).");
      lines.push("- [ ] License unchanged? If changed, assess compatibility BEFORE reading further content.");
      lines.push("- [ ] Do changes touch principles listed for this source in SOURCES.md?");
      lines.push("- [ ] Proposed edits to lexia-design reference files (list exact files + rationale):");
      lines.push("- [ ] Run `node evals/run-evals.mjs --smoke` after edits; paste results here.");
      lines.push("- [ ] If detector rules change: run fixtures before/after; paste findings diff.");
      lines.push("");
    }
  }
  if (stale.length) {
    lines.push("## Stale manual sources (re-verify by hand)");
    lines.push("");
    for (const r of stale) {
      lines.push(`- ${r.id}: last verified ${r.checked} (${r.ageDays} days ago). Re-verify license/terms/content and update sources.lock.json 'checked'.`);
    }
    lines.push("");
  }
  if (unreachable.length) {
    lines.push("## Unreachable (network or upstream problem — not confirmed current)");
    lines.push("");
    for (const r of unreachable) lines.push(`- ${r.id}: ${r.detail || "unreachable"}`);
    lines.push("");
  }
  lines.push("## Apply protocol (after human approval only)");
  lines.push("");
  lines.push("1. git commit the current state.");
  lines.push("2. Apply approved reference-file edits one source at a time.");
  lines.push("3. Update sources.lock.json (commit/version + checked date) for applied sources only.");
  lines.push("4. Append the change to CHANGELOG.md.");
  lines.push("5. Re-run `node evals/run-evals.mjs --smoke`; revert on regression.");
  lines.push("");
  lines.push("Prohibited: silent updates, executing fetched code, overwriting user decisions,");
  lines.push("importing license-incompatible material, declaring 'updated' without recording versions.");
  return lines.join("\n");
}

async function main() {
  const args = process.argv.slice(2);
  const offline = args.includes("--offline");
  const checkOnly = args.includes("--check");
  const asJson = args.includes("--json");
  const out = args.includes("--out") ? args[args.indexOf("--out") + 1] : "UPDATE_PROPOSAL.md";

  if (!existsSync(LOCK_PATH)) {
    console.error(`sources.lock.json not found at ${LOCK_PATH}`);
    process.exit(2);
  }
  let lock;
  try { lock = JSON.parse(readFileSync(LOCK_PATH, "utf8")); } catch (e) {
    console.error(`cannot parse sources.lock.json: ${e.message}`);
    process.exit(2);
  }

  const results = [];
  for (const src of lock.sources) {
    results.push(await checkSource(src, offline)); // sequential: gentle on upstreams
  }

  const generatedAt = new Date().toISOString();
  if (asJson) {
    console.log(JSON.stringify({ generatedAt, results }, null, 2));
  } else {
    console.log("source | type | pinned | latest | status");
    for (const r of results) {
      console.log(`${r.id} | ${r.type} | ${String(r.pinned).slice(0, 10)} | ${String(r.latest).slice(0, 10)} | ${r.status}${r.detail ? ` (${r.detail.split("\n")[0]})` : ""}`);
    }
    const drift = results.filter((r) => r.status === "drift").length;
    const stale = results.filter((r) => r.status === "stale-recheck").length;
    console.log(`\n${drift} drifted, ${stale} stale manual source(s), ${results.filter((r) => r.status === "unreachable").length} unreachable.`);
  }

  if (!checkOnly) {
    writeFileSync(out, proposalMarkdown(results, generatedAt));
    console.log(`\nWrote ${out}. Review it; nothing has been applied.`);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(`lexia-design-update internal error: ${err?.message || err}`);
  process.exit(2);
});
