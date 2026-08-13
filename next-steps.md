# Next steps

Resume point for a new session, written 2026-08-13 after a long working
day. [tasks/todo.md](tasks/todo.md) still holds the full slice history and
[tasks/lessons.md](tasks/lessons.md) the checkable rules; this file is only
what is still open and what a fresh session needs to know before touching
anything.

## Where things stand

`main` is green and deployed. 111 unit tests, 24 integration tests against
Neon, tsc, lint and build all pass. The last commit deployed to production
is the one this file was written against.

Three portals, one shell (`components/app-shell.tsx`): the specialist
console, the patient space and the platform admin. Every authenticated
route has been walked in a browser as its own role except where noted
below.

Verify the state before trusting this file:

```sh
npm run lint && npx tsc --noEmit && npx vitest run && npm run build
set -a; . ./.env.local; set +a; npx vitest run src/modules/isolation.integration.test.ts
```

## How to work here

**Credentials.** `~/.nutrionyx/creds.json`, mode 600, outside the git tree.
It holds `superadmin`, `consulta` and `paciente`, and the owner asked for
it to stay on disk rather than be deleted after use (see the project
memory). Read it programmatically, never print the values, and never write
it inside the repo. Flag at the start of any session that touches
authenticated surfaces that the file is still there, and delete it the day
the platform has a second real user.

**Waiting for a deploy.** Poll the commit of the newest deployment that is
both READY and production. Anything that tests a deployment's *age* spins
forever once the window is missed; six shells were left running for hours
learning that.

```sh
until [ "$(npx vercel ls --yes --json | python3 -c '
import json,sys
d=json.load(sys.stdin)["deployments"]
r=[x for x in d if x["state"]=="READY" and x.get("target")=="production"]
print(r[0]["meta"]["githubCommitSha"][:7] if r else "none")')" \
  = "$(git rev-parse --short HEAD)" ]; do sleep 20; done
```

**Verification.** A green build is a floor, not a verdict. Every UI change
in this codebase that was only reasoned about turned out wrong at least
once: drive it through the browser with Playwright, look at the capture,
and measure element rectangles rather than `documentElement.scrollWidth`.

## Where the session of 2026-08-13 left it

Everything below the line was written earlier that day. What happened after:
the widgets slice shipped and was reversed on mobile after real photographs
(`docs/build/slice-28-plan.md`), medication became opt-in and patient-shared
(`d8f0095`), the landing was brought level with what exists, and Tier 2's
first row landed: a food catalogue with per-day totals against the target
(`docs/build/slice-29-plan.md`).

Tier tables and the competitive benchmark now live in
[docs/build/roadmap-feature-tiers.md](docs/build/roadmap-feature-tiers.md) and
[docs/research/benchmark-2026-08.md](docs/research/benchmark-2026-08.md). Read
those before planning: the tier table already had two rows that were fiction
because it was written from a plan document rather than from `src/`.

**Open, and needing nobody but the next session:**

- The adherence report has no export. `/imprimir/dieta` and `/imprimir/entreno`
  are the pattern to copy.
- The food catalogue's values are hand-typed reference figures. Either a
  nutritionist reviews them or they are replaced by an import; the licence
  work is already done in the slice-29 plan (USDA public domain, CIQUAL with
  attribution, Open Food Facts share-alike and to be avoided, BEDCA's terms
  unconfirmed).
- The patient's plan shows a day's total but never says how many of its rows
  are uncounted; the specialist's editor does. Deliberate, worth revisiting.

**Open, and needing the owner:**

- The screen-reader walk of the calendar and the listbox. Roles, focus and
  keyboard were measured; VoiceOver was never run.
- Everything in Tier 0 of the roadmap: Resend's sending domain, real fiscal
  data, the legal review, and a Verifactu study before billing is scoped.
- The exercise illustrations dropped in `imgs/`: two of them are triceps and
  the catalogue has one key, so the mapping is a decision.

## Next, in order

### 1. Custom Select, DatePicker and TimePicker - built 2026-08-13

Shipped as slice 28; the plan and every decision behind it are in
[docs/build/slice-28-plan.md](docs/build/slice-28-plan.md). In short: the
native control stays in the DOM and the custom widget is drawn over it after
mount, so `required`, `defaultValue` and submitting without client JS are
still the browser's job. The popup is a top-layer popover with CSS anchor
positioning and no positioning library. No call site changed, because both
`Select` and `Input` kept their public API.

Mobile was answered deliberately: the listbox is everywhere, the calendar
only under `pointer: fine`, and a time is a listbox of 15-minute slots
rather than a third widget.

**What is left here is the screen-reader walk.** Roles, focus order, keyboard
and the touch gate were measured in a browser and again against production.
VoiceOver was not run, and this file's own rule says a UI that was only
reasoned about turns out wrong at least once. Start there before trusting the
accessibility of any of the three.

One judgement call worth a second opinion: an appointment time can no longer
be typed, only picked from 07:00-21:45 in quarters. Better for booking, a
real loss otherwise, and the range is an assumption about a consulta's day
that nothing in the domain enforces.

### 2. Whatever the owner reports next

Two things shipped defensively and were never reproduced locally, so they
need a real device before they can be called done:

- **Date field overflow on Chrome for Android.** Fixed with `min-w-0` on
  the primitives plus the webkit pseudo-elements and `max-width:100%` on
  the control. Never reproduced at 390px or under Pixel 7 emulation.
- **Scroll running past the end of a patient record on Brave.** Fixed with
  `overscroll-contain` on the shell scroller and `overscroll-behavior:none`
  on `html`. Reproduced as a behaviour, not as a layout gap.

### 3. Small, real, unglamorous - done 2026-08-13

All three are closed; kept here for the next reader.

- `Cerrar sesión` in `/mi-espacio/perfil` and the four template-bar controls
  are the `Button` primitive now, so they go full width on a phone like every
  other action. The template bar was also overflowing its card: a fixed `w-56`
  name field beside a non-wrapping button pushed `Guardar semana` past the
  right edge.
- The remove control on an exercise row rides with sets and reps on a phone,
  and `sm:order-*` puts it back between the exercise column and the
  illustration from sm up. Desktop is unchanged to the pixel.
- The slug is not a bug. `orgSlug()` appends a 4-char suffix on purpose, to
  avoid an availability round-trip, so `corporesano-z3gn` is expected.

## Blocked on the owner

- **Exercise illustrations: 4 of 41.** press-banca, sentadilla,
  press-militar and dominadas. Peso muerto and curl de bíceps were
  generated wrong and never redone. 4 Pletor credits left, about 9 per
  exercise, so this is parked until the balance is topped up. The recipe
  (platform mannequin as style reference, background removed, cropped to
  content on a square canvas at 320px) and the `ILLUSTRATED` gate are in
  `modules/training/exercises.ts`; a test fails if a key is listed there
  without a file behind it.
- **Fiscal data are placeholders**, chosen so they cannot collide with a
  real business: `B00000000` fails the Spanish CIF checksum and `08000` is
  not an assigned postcode. Replace them in Ajustes with the real ones.
- **The CorporeSano mark** (`public/corporesano.svg`, 400 bytes) is a first
  pass and the owner was offered a redraw: lighter on ink, outlined rather
  than solid, or a different idea entirely.
- **Resend domain verification.** Patient emails are still in sandbox.
- **Legal review** of the provisional pages.

## Not built, and why

- **Suspending a consulta** and a **user-lookup page** in the admin area:
  both need a status column and a migration, for a platform with one
  consulta. YAGNI until there are more.
- **Unread badge on the console's Mensajes entry.** The shell is a client
  component and the count would have to be threaded through the layout;
  the inbox itself already answers the question.
- **Patient-initiated erasure.** The consulta is the data controller and
  holds the clinical record, so `/mi-espacio/perfil` explains the route and
  points at the specialist rather than offering a button that would only
  file a ticket. Recorded as a decision, not an omission.
- Reporting-lite, billing (Stripe), RBAC for team members and patient
  self-booking are all reserved in the navigation and none is built.

## Test data currently in the database

Written this session, all through the UI. Nothing here is real:

- Consulta **CorporeSano** with the placeholder profile and the SVG mark.
- One patient (Alejandro Sánchez), one diet plan of seven days with
  alternatives, one three-day routine, and one template of each.
- Three messages in the patient's thread, two of which are the string
  "Prueba bandeja 21h" from verifying the inbox. Left in place on purpose:
  `modules/messaging/repository.ts` states that messages are never deleted.
- 58 domain events. The 13 that carried clinical values were redacted with
  the owner's agreement; every event since carries identifiers only, and
  `modules/events.test.ts` fails if a new payload breaks that.

## Traps already paid for

Read [tasks/lessons.md](tasks/lessons.md) before debugging anything that
smells familiar. The ones that cost the most time today, in short:

- A constant shared with a server action cannot live in a `"use client"`
  module: it arrives as a client reference, not a value.
- React 19 resets a form on **every** outcome, success included, and
  `defaultValue` is read once at mount, so re-hydrating needs both an echo
  and a remount.
- Two competing Tailwind utilities settle by stylesheet order, not by the
  order of the class attribute. A primitive picks one and exposes a prop.
- An overflow check against `documentElement` is blind inside a shell that
  clips, and neither check catches a flex row that compresses instead.
