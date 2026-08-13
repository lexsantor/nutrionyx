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

## Next, in order

### 1. Custom Select, DatePicker and TimePicker

The owner asked for this explicitly and it is the largest open item.
Native controls are themed as far as CSS reaches: `components/ui/select.tsx`
owns the closed state, `globals.css` tints the date and time trigger icons.
The *popups* are drawn by the operating system and no CSS reaches them, so
the only way to theme them is to own the widgets.

That means keyboard navigation, typeahead, focus return, screen-reader
semantics, and a deliberate answer for mobile, where iOS and Android give
away a wheel picker that is better than anything hand-rolled. Write a plan
in `docs/build/` before writing a component, and decide the mobile question
first: a custom listbox that is worse on a phone is a downgrade for the
audience that uses the patient space most.

Call sites to migrate, all currently `components/ui/select.tsx`: the agenda
form, the audit filters, the exercise picker, the template bar, and the
assessment wizard's birth-date selects.

### 2. Whatever the owner reports next

Two things shipped defensively and were never reproduced locally, so they
need a real device before they can be called done:

- **Date field overflow on Chrome for Android.** Fixed with `min-w-0` on
  the primitives plus the webkit pseudo-elements and `max-width:100%` on
  the control. Never reproduced at 390px or under Pixel 7 emulation.
- **Scroll running past the end of a patient record on Brave.** Fixed with
  `overscroll-contain` on the shell scroller and `overscroll-behavior:none`
  on `html`. Reproduced as a behaviour, not as a layout gap.

### 3. Small, real, unglamorous

- `Cerrar sesión` in `/mi-espacio/perfil` and `Guardar semana` in the
  template bar are raw buttons, not the `Button` primitive, so they stay
  narrow on a phone while every other action goes full width.
- On an exercise row with nothing picked, the remove control sits alone on
  its own line, because the illustration slot beside it collapses.
- The consulta's slug came out `corporesano-z3gn`: `modules/organization/slug.ts`
  appends a suffix. Worth checking whether that is intended for a free slug.

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
