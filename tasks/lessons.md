# Lessons

Checkable rules from corrections in this project. Review at session start.

- Before acting on files in this repo, verify current directory state first; the operator reorganizes the folder directly (2026-07-09: discovery material was removed and restored outside agent control).
- ~~Never run npm install against the mounted folder / /tmp/work dance~~ **Outdated 2026-08-10**: the current sandbox runs npm install, prisma generate, `prisma migrate dev`, builds and integration tests directly on the mount. Still true: watch the lockfile after any npm install (see the @swc/helpers rule).
- ~~`binaries.prisma.sh` blocked; fake-engine workaround~~ **Outdated 2026-08-10**: Prisma 7.8 generate and migrate dev work plain in the sandbox.
- `next/font/google` phones Google in every build (EU concern) and fails in offline builds; self-host fonts via `@fontsource-variable/*` packages (the `geist` package was dropped 2026-08-09 with the mono font).
- Neon Auth Beta: `organization.getInvitation` is recipient-only (403 "You are not the recipient" for org admins), despite docs not saying so. Admin-side invitation reads must go through `listInvitations`. Feed this into deviation 0001's review.
- The Prisma client lives in gitignored src/generated/: every fresh install needs `prisma generate` (now wired as postinstall). In the sandbox, run installs as `npm install --ignore-scripts` and generate manually with the fake-engine env var; the operator's npm blocks dependency install scripts (allow-scripts), so tell them to run `npx prisma generate` if the module is missing.
- In the Cowork sandbox, `/tmp` is not writable - use `$HOME/work` for the work copy (not `/tmp/work`). A full `npm install` does not complete within one tool call, and background jobs do not survive across calls (each bash call is an independent process tree). Do not attempt to run tsc/lint/test/build for this project in-session: author the change against verified signatures/schema and hand the operator the exact commands to run gates and DB-backed tests. Commit only after the operator reports green.
- DB-backed (integration) tests must not break the unit run: gate them with `describe.skipIf(!process.env.DATABASE_URL)` so `npm test` and CI stay green without a database; run them explicitly with `npm run test:integration` and a real `DATABASE_URL`.
- Gate protected pages by DOMAIN ROLE, never by "has a session" or "belongs to an org". A patient accepts a Better Auth invitation and becomes a `member` of the nutritionist's org, so `auth.organization.list()` returns that org for them too. Use `resolveUserRole(userId)` (Patient row by authUserId = patient, else nutritionist) in the home redirect, in `/panel`, and in owner-only actions. Assigning a role in Better Auth and never reading it back is not authorization.
- Before committing any dependency change, verify the lockfile is in sync: `npm ci --dry-run` must pass. The operator's local `npm install` (allow-scripts/lavamoat setup) can leave `package-lock.json` missing a transitive dep (e.g. `@swc/helpers`) - `npm install`, `tsc`, and `next build` still pass locally, but CI's `npm ci` fails with "Missing X from lock file". Fix by regenerating the lock (`npm install --package-lock-only`) and confirming `npm ci --dry-run`. Seen in M2 and again on the design-foundation push.
- Do NOT generate lockfiles with `npm install --package-lock-only --ignore-scripts` on top of an existing lock: it is conservative and can emit a TRUNCATED lock (missing nested nodes like `next-intl/node_modules/@swc/helpers@0.5.23`). `next build`/Vercel (which use `npm install`) accept it, but CI's `npm ci` rejects it. Verify with a REAL `npm ci` (its EUSAGE/"Missing" error appears in ~3s), never trust `npm ci --dry-run` - its "add X"/"change X undefined => Y" lines ARE the out-of-sync signal, not success. Correct fix: `rm package-lock.json && npm install --package-lock-only` (from-scratch resolve) so every transitive is recorded. Seen on the reicon-react add (Slice 5.7): only next-intl's nested @swc/helpers@0.5.23 was dropped.
- Long installs CAN be run in the sandbox despite the per-call timeout: launch detached with `setsid bash -c '<cmd> >/tmp/x.log 2>&1' & disown`, then poll `[ -f package-lock.json ]` across subsequent calls. Plain `nohup ... &` does NOT survive; `setsid` does (the container persists between calls). A full-tree `npm install --package-lock-only` took ~65s (two poll calls).
- NEVER run `npm ci` in the sandbox: it wipes `node_modules` first, and the sandbox operates on the operator's REAL folder over the mount, so an interrupted `npm ci` corrupts the operator's `node_modules` (half-extracted packages -> ENOTEMPTY / ERR_MODULE_NOT_FOUND like confbox). To reconcile-check a lockfile without installing, verify structurally instead (grep the lockfile). Recovery for the operator: `rm -rf node_modules && npm install` on their Mac.
- The lockfile is fragile across platforms: a macOS `npm install` records `@next/swc-darwin-*` but can DROP `next-intl/node_modules/@swc/helpers@0.5.23` (fatal: CI `npm ci` fails); a sandbox-linux `npm install --package-lock-only` records `@swc/helpers@0.5.23` but omits the `@next/swc` platform optionals (benign: `next build` self-patches). Do NOT commit a locally-regenerated lockfile after a `rm -rf node_modules && npm install` repair or a `next build` swc-patch. Before committing ANY lockfile change, grep it: it MUST contain `next-intl/node_modules/@swc/helpers` and `0.5.23`. If no dependency changed in package.json, prefer `git checkout <known-good-commit> -- package-lock.json` over a regeneration.

- 2026-08-11: Vercel's git webhook can silently skip a push (no
  deployment row appears). Check `vercel ls` age after every push; an
  empty commit re-triggers it.

## A constant shared with a server action cannot live in a client component

`TEMPLATE_NAME_MAX` sat in `components/template-bar.tsx` (`"use client"`) and
was re-exported by the template repositories. On the server that export is a
client reference, not a number, so `name.slice(0, TEMPLATE_NAME_MAX)` coerced
to `NaN` and returned `""`. Every "guardar semana" answered "ponle un nombre"
with the name filled in on screen, for the whole life of slice 21B.

**Check:** a value imported by a server action must come from a module with no
`"use client"` directive, directly or through any re-export chain. Put shared
constants in a plain module (`modules/*/constants.ts`).

**Second lesson from the same bug:** validate emptiness before applying a cap.
`if (!typed) return nameRequired;` then `typed.slice(0, MAX)` fails loudly at
the right place instead of blaming the user for a field they filled in.

## A feature is not shipped until it has been driven through the UI

Slice 21B shipped templates with unit tests, integration tests, a green build
and a production deploy. None of it exercised the actual button, so the
feature was broken from the first commit and stayed broken through three more
slices that touched it.

**Check:** for anything with a form and a server action, drive it once against
production with real credentials and confirm the row in the database, not the
message on screen.

## An overflow check against documentElement is blind inside a clipping shell

The audit sweep measured `documentElement.scrollWidth > clientWidth` and
reported 36 of 36 routes clean. It could not have reported anything else: the
app shell is `h-dvh overflow-hidden`, so horizontal overflow is clipped rather
than turned into document scroll.

**Check:** measure each element's `getBoundingClientRect().right` against the
scroll container's right edge, not the document's. And know that neither check
catches the opposite failure: a flex row that *compresses* instead of
overflowing. The routine editor's exercise select renders at 18px on a 390px
viewport while overflowing nothing at all.

**Corollary:** a clean automated sweep is a floor, not a verdict. Look at the
captures.

## An append-only log is still a place data can be over-collected

DomainEvent stored a weight, a BMI, a drug name and dose, an injection site
and two emails, because eight call sites copied the value instead of pointing
at the row that owns it. Nothing read those payloads for eleven slices, so the
defect was invisible until the platform audit view made the table readable.

**Check:** an event payload carries identifiers, never values. Categories
(`kind`, `sender`, `version`) are fine; a measured number is not. The rule is
enforced by `modules/events.test.ts`, which reads every payload literal in the
module tree.

**Why it matters more than it looks:** this table is the one clinical-adjacent
store the platform operator may read under adr/0004. Every value written into
it is special-category data handed to the widest audience in the system, and
duplicated from a row that already holds it.

**On the stored history:** append-only protects the fact of the event, not a
redundant copy of a value. Redacting the values while keeping type, aggregate,
id and timestamp preserves everything the trail is for and is the
minimisation the data deserved in the first place. Do it with the owner's
agreement and print what changed, row by row.

## Two competing utilities never settle by attribute order

`<Button className="w-auto">` did not override the primitive's `w-full`:
Tailwind emits `w-auto` before `w-full`, and at equal specificity the
stylesheet order wins, not the order in the class attribute. The search
button went full width and overflowed its row. This is the second time this
class of bug has landed here; the first was `hidden sm:inline-flex` losing to
ButtonLink's own `inline-flex`.

**Check:** a primitive must pick ONE utility per property and expose the
choice as a prop (`width="auto" | "block"`), never let a caller add a second
one and hope. If you find yourself writing a className to undo a base class,
the base class should have been a variant.

## Never poll for a condition that expires

Six background shells sat spinning for hours, some over three, waiting on
deploys that had finished minutes after they started. The loops tested the
deployment's *age* (`until vercel ls | grep -E "^  ([0-9]+s|[1-3]m) .*Ready"`),
which is true only inside a window. Miss the window, because CI was still
running when the loop began, and it can never become true again: a deployment
only gets older.

**Check:** poll a monotonic fact, not a transient one. For Vercel that is the
commit, which `vercel ls --json` carries:

    until [ "$(npx vercel ls --yes --json | python3 -c \
      'import json,sys;print(json.load(sys.stdin)["deployments"][0]["meta"]["githubCommitSha"][:7])')" \
      = "$(git rev-parse --short HEAD)" ]; do sleep 20; done

Once true it stays true. The same rule applies to any wait: if the predicate
can go from false to true to false, it is the wrong predicate.

**Second half of the same lesson, learned separately:** matching the commit is
not enough either. `deployments[0]` is the newest *created* deployment, so the
sha matches while it is still BUILDING, and a capture taken then photographs
the previous build. Filter on `state === "READY"` and `target ===
"production"` as well, then compare the sha of that one.

## React 19 resets the form on success too, not only on error

Both week editors echoed the submitted values back and re-hydrated from them
`when "errorKey" in state`. React 19 resets an action's form whenever the
action resolves, success included, and the editors keep their cells as
uncontrolled inputs. So "guardar semana como plantilla" blanked every amount,
food, series and repetition on screen, plus the title and the notes, and the
next "guardar plan" wrote that emptiness over the real plan.

Found by seeding a real week through the UI for the print slice: the template
came out with all seven days and the plan came out empty.

**Check:** if a form has uncontrolled inputs and more than one action, echo
the submitted values on every outcome that leaves the user where they were,
and deliberately do not echo on the one that replaces their content (loading
a template). "Only on error" is the wrong condition.

## A programmatic value on a native control is invisible to React

The custom listbox (slice-28) sets the value of the real `<select>` it wraps.
Assigning `select.value = v` directly changes the DOM and changes nothing in
React: a controlled call site keeps its old state and re-renders the old
value straight back over it.

**Check:** go through the prototype's own setter, then dispatch a bubbling
`change`, and the pick becomes indistinguishable from a user's:

    const setter = Object.getOwnPropertyDescriptor(
      HTMLSelectElement.prototype, "value")?.set;
    setter?.call(select, value);
    select.dispatchEvent(new Event("change", { bubbles: true }));

Same rule for `HTMLInputElement`. If a call site is uncontrolled it works
either way, which is exactly why this is easy to miss until a controlled one
appears.

## A form control hidden with display:none breaks native validation

Slice-28 hides the real `<select>` once the listbox takes over. With
`display:none` (or `visibility:hidden`) the browser refuses to focus it, and a
`required` one makes form submission fail with "An invalid form control with
name='x' is not focusable" — the form silently does nothing.

**Check:** hide a control that still has to validate with `opacity: 0` plus
`pointer-events: none`, keeping it in the layout. It stays focusable, so the
validation bubble lands over the visible trigger that replaced it.

## setState in an effect is a lint error, and the mount flag has a real shape

`useEffect(() => setEnhanced(true), [])` is the usual "am I on the client yet"
flag and this repo's eslint rejects it: `react-hooks/set-state-in-effect`.

**Check:** the answer differs between server and client, which is what
`useSyncExternalStore` is for. Shorter than the effect, and no cascading
render:

    const enhanced = useSyncExternalStore(() => () => {}, () => true, () => false);

## Playwright's colorScheme does not test this app's theme

A capture taken with `colorScheme: "dark"` came back in light and proved
nothing. The theme here is `data-theme` on the root, set by the ThemeToggle,
not `prefers-color-scheme`.

**Check:** drive the toggle, then assert on `documentElement.dataset.theme`
before capturing. Read the computed colours too — a screenshot cannot tell you
a token resolved rather than fell back.

## A status score is checked against src/, never against a plan document

The tier table written on 2026-08-13 scored "specialist notes" at 0 and "logo
upload from Ajustes" at 3, effort S each. Both were already built:
`modules/notes/repository` with `addNoteAction`, `note-form.tsx` and the dated
list on the patient record; `LogoFileInput` with file upload and a `logoUrl`
field in `ajustes/profile-form.tsx`.

The table had been assembled from the competitive benchmark and from
`tasks/todo.md`, whose "next candidates" section still listed both. Two of five
Tier 1 rows were fiction, and the owner was about to spend a session on work
that existed.

**Check:** before scoring or planning anything, grep `src/` for the feature and
open what comes back. A planning document records what someone intended once;
only the code records what is there. The same applies to `docs/00`'s
[built]/[next]/[future] markers, which are equally free to drift.

## `tail -3` on a test run hides whether it passed

A commit went to CI red with `events.test.ts` failing. Locally the suite had
been run with `npx vitest run 2>&1 | tail -3`, which prints the duration line
and nothing else: the failure count sits three lines further up, so a red run
and a green run look identical.

The failure it hid was worth catching. A `MealLogged` payload carried `slot`
and `status`, and "DINNER / SKIPPED" tells the platform operator that this
patient skipped dinner — the clinical fact operator-blindness exists to keep
from them (adr/0004). The rule was right; the payload was wrong.

**Check:** grep the outcome, never the tail. `| grep -E "Test Files|Tests|FAIL"`
prints the counts and any failing file, and an empty result is itself a
signal. The same applies to `npm run build | tail`: match on "Compiled" or
"error", not on position.
