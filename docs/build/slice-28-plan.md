# Slice 28 — Custom Select, DatePicker and TimePicker

Status: PLAN ONLY. No component written yet.
Date: 2026-08-13.

## What was asked

Own the widgets whose popups the platform cannot theme. `components/ui/select.tsx`
already owns the closed state of a select and `globals.css` tints the date and
time trigger icons, but the *open* list, the calendar and the clock are drawn by
the operating system, outside the page, where no CSS reaches.

## The decision already taken (owner, 2026-08-13)

**Hybrid.** A custom listbox everywhere, at every width. Custom calendar and
clock **only under `pointer: fine`**; on a touch device the native iOS/Android
wheel stays. Reasoning: a native `<select>` popup is the worst of the three and
nothing is lost by replacing it, while the native date wheel is better than
anything hand-rolled and the patient space is used mostly on a phone.

This is the constraint everything below is designed against.

## What exists today

- `Select` (`components/ui/select.tsx`): a plain `<select>` with
  `appearance-none`, an SVG chevron drawn at our own inset, and a comment that
  states the open list is the platform's. It is a **server-safe** component:
  no `"use client"`.
- Five call sites, and the mix matters more than the count:
  - `agenda/appointment-form.tsx` — three selects. `patientId` is
    **uncontrolled + `required`**, `durationMin` is uncontrolled with
    `defaultValue`, `mode` is controlled.
  - `admin/auditoria/page.tsx` — three selects, **all uncontrolled**, inside a
    **server component**, in a filter form that submits without client JS.
  - `entreno/routine-editor.tsx` — controlled, with `<optgroup>`.
  - `template-bar.tsx` — controlled.
  - `evaluacion/wizard-step.tsx` — three controlled selects, `required`,
    for a birth date.
- Four native date/time fields: `agenda` (date + time), `mi-espacio/weight-check-in`
  (date), `mi-espacio/medicacion/dose-form` (date).
- **Nothing to build on.** `grep` across `src` finds no `createPortal`, no
  `<dialog>`, no `role="listbox"`, no popover, no positioning library. Every
  primitive in this slice is the first of its kind in the codebase.

## Decisions to make before building (owner)

**D1 — How the value reaches the server.** A custom listbox is a `<div>`, not a
form control, so something has to carry `name` and `value` into the POST.

- **(a) Keep the real `<select>` in the DOM and enhance it after mount.**
  The component renders exactly what it renders today; a `useEffect` flips an
  `enhanced` flag and only then is the custom listbox drawn over it, with the
  native one hidden from both the layout and the accessibility tree. Before
  hydration, and forever if client JS fails, the native select works.
  `required`, `defaultValue`, form reset and autofill stay the browser's job.
- (b) `<input type="hidden">` plus a listbox. Cleaner DOM, but native
  `required` is gone and three call sites rely on it, and nothing works
  without JS.
- (c) Controlled-only, rewriting all five call sites. Largest diff, and it
  breaks the no-JS path in `admin/auditoria` and `agenda`.

**Recommendation: (a).** This codebase already keeps sign-out working without
client JS (`app/logout-button.tsx` is a form bound to a server action). A select
that only works once a bundle lands would be a step down from that, and it is
the only option that leaves `required` alone.

**D2 — Where the popup is drawn.** The app shell clips: `overscroll-contain`
on the shell scroller, and an earlier session already learned that an overflow
check against `documentElement` is blind inside it (lessons.md). An
`position: absolute` popup inside that scroller will be cut off.

The modern answer is the Popover API (`popover` attribute, promotes to the top
layer, escapes any `overflow`) anchored with CSS anchor positioning. **I have
not verified the current Firefox support for CSS anchor positioning and will not
claim it.** First build step is a throwaway page that proves the combination in
Chrome, Safari and Firefox at both themes; if anchor positioning is not there
yet, the fallback is a portal to `body` plus a `getBoundingClientRect` measured
on open and on scroll — more code, no dependency either way.

**D3 — Does a TimePicker exist at all?** Recommendation: **no.** An appointment
time is a choice from a list of slots, so it is the listbox from D1 with options
generated at 15-minute steps, not a third widget. This removes roughly a third
of the slice. If the owner wants a free-typed time, say so and it comes back.

**D4 — Birth date stays three selects.** `evaluacion/wizard-step.tsx` uses day,
month and year selects. A calendar is worse for a date forty years back, so
those three become custom listboxes and never a DatePicker.

## Shape of the build

Three new pieces, in dependency order.

1. **`useEnhanced()`** — a two-line hook returning `false` on the server and on
   the first client render, `true` after mount. One mechanism serves both D1 and
   the `pointer: fine` gate, since `matchMedia` cannot be read during SSR
   either. Everything else in this slice depends on it.
2. **`Listbox`** — the popup for `Select`. WAI-ARIA APG listbox pattern:
   `aria-activedescendant` rather than moving focus into the options, so focus
   return is free. Keyboard: arrows, Home/End, typeahead with a timeout, Esc,
   Enter, Tab commits and closes. Reads its rows from the `<option>` and
   `<optgroup>` children the call sites already pass, so **no call site changes**.
3. **`Calendar`** — month grid, week starting Monday, `Intl.DateTimeFormat` for
   the month and weekday names in `es`. No dependency. Rendered only when
   `useEnhanced()` and `matchMedia("(pointer: fine)")` both hold; on touch the
   native input is untouched.

`Select`'s public API does not change, so the five call sites are edited zero
times. The four date fields get wrapped.

## Risks, stated plainly

- **This is the largest accessibility surface in the project and there is no
  browser test to catch a regression.** The suite is `vitest` over `src/modules`;
  it cannot see a listbox. Verification is a manual keyboard walk plus VoiceOver
  on each of the five call sites, at both themes, at 390px and 1280px.
- A listbox that is worse than the native one on a phone is a real possibility
  and the reason D1(a) is recommended: the native control stays in the DOM, so
  backing out is deleting the enhancement, not a revert.
- `admin/auditoria` is a server component. A `"use client"` `Select` imported
  into it is fine, but that the `<option>` children survive the server-to-client
  boundary well enough for the listbox to read them **is an assumption to prove
  in step 2, not a fact**.

## Gates

The usual: `npx tsc --noEmit && npm run lint && npm test && npm run build`, plus
the integration run. None of them proves this slice works. The evidence is the
browser walk, measured with element rectangles rather than `documentElement`.

## Sequence

1. Prove D2 in a throwaway page. Report which combination holds.
2. `useEnhanced()` + `Listbox`, wired into `Select`. Walk all five call sites.
3. `Calendar` behind the `pointer: fine` gate. Walk the four date fields, and
   confirm on a real phone that nothing changed there.

Step 1 is cheap and decides the shape of step 2, so it goes first and its result
comes back to the owner before any component is written.
