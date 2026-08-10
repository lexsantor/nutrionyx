---
name: motion-design
description: >
  This skill should be used for interface motion work: "add animations",
  "animate this section", "scroll animations", "page transitions",
  "micro-interactions", "make this feel alive", "GSAP/Framer Motion
  work", "review these animations", or deciding that something should
  NOT animate. Decides what deserves motion, picks the technology tier,
  and implements or reviews it. Also invoked by the lexia-design
  orchestrator after structure validates.
metadata:
  version: "0.1.0"
---

# Motion Design

Motion is a system decision, not decoration. Structure must already be
validated: never animate a layout that hasn't passed its audit.

## Decision sequence

1. Budget. Read MOTION_INTENSITY from `.lexia-design/DESIGN-BRIEF.md`
   (infer + declare it if absent). Apply the frequency gate from
   `${CLAUDE_PLUGIN_ROOT}/references/motion/principles.md`: exposure
   frequency caps animation regardless of the dial; keyboard paths get
   none.
2. Inventory. List candidate moments; for each, name the function
   (causality, continuity, attention, state, orientation, brand delight)
   or strike it. Produce two lists: WILL animate (with function) and
   WILL NOT (with reason). The second list is part of the deliverable:
   restraint is demonstrated, not claimed.
3. Concentrate. One authored focal moment beats ubiquitous entrances.
   At intensity >= 5, choose THE moment (usually the signature move);
   everything else stays in the standard register.
4. Technology. Walk the ladder in
   `${CLAUDE_PLUGIN_ROOT}/references/motion/tech-selection.md`: CSS ->
   WAAPI -> the library already installed -> GSAP. Adding GSAP (or any
   runtime) requires the dependency justification. GSAP work follows
   `${CLAUDE_PLUGIN_ROOT}/references/motion/gsap-playbook.md` exactly
   (useGSAP + scope + contextSafe + gsap.matchMedia with reduceMotion in
   React; pitfalls list for ScrollTrigger).
5. Specify before implementing: duration band, easing token, origin,
   interruption behavior, reduced-motion variant, cleanup owner. A
   motion without a spec is a reflex.

## Mandatory properties of every animation shipped

- Respects prefers-reduced-motion (gentler, not zero; content never
  hidden at rest waiting for JS).
- Interruptible; never locks input; retargets from live values.
- transform/opacity only; no transition: all; correct transform-origin;
  no scroll listeners (observers / scroll-driven APIs / ScrollTrigger).
- No scroll hijacking; native scroll integrity; keyboard and anchor
  navigation still work.
- Cleanup: timelines, observers, listeners torn down on
  unmount/navigation; verified across repeated mount cycles.
- Usable without the animation: motion communicates, never gates.
- Validated at 4x CPU throttle; loops pause offscreen.

## Review mode

When reviewing existing motion: audit against the same rules; the fix
hierarchy is delete -> reduce -> retime/re-ease -> reorigin -> make
interruptible -> optimize. Produce Before/After/Why per change with
file:line. Rapid re-trigger test (mash the toggle) and reduced-motion
pass are mandatory checks. The deterministic rules [motion/*] in the
detector catch the mechanical subset; judgment covers feel, asymmetry
(exits ~0.7-0.8x of entrances), and coherence with the direction's
motion personality.

## No-motion verdicts

"This should not animate" is a first-class deliverable. High-frequency
operative surfaces, reduced budgets, or a direction whose register is
instant (Terminal Utility, Brutalist) produce a WILL NOT list and
tokens that specify instant states: document it in DESIGN-SYSTEM.md so
nobody "fixes" the absence later.
