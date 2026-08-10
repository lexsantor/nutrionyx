# Motion Technology Selection

Priority ladder. Move down only when the level above cannot express the
requirement. Justify every step down in DESIGN-DECISIONS.

## 1. CSS transitions/animations (default)

For: state changes, hover/focus/press, enter/exit of simple layers,
accordion-class height tricks (grid-template-rows), @starting-style
entries, scroll-driven animations where support allows.
Wins: zero JS, compositor-friendly, interruptible retargeting, reduced
motion via media query, works before hydration.

## 2. Web Animations API (WAAPI)

For: programmatic control of predetermined sequences (pause, reverse,
playbackRate), dynamic values CSS can't know at author time, finish
promises.
Wins: off-main-thread for compositor props; no dependency.

## 3. The library already in the project

If Motion (Framer Motion), react-spring, or similar is installed, use it
before adding anything. One animation runtime per project. Motion is the
right tool for React component lifecycles (AnimatePresence exits), gesture
springs, layout animations. Do not add GSAP for what Motion already does
well, or vice versa.

## 4. GSAP (see gsap-playbook.md)

Add GSAP only for capabilities above levels 1-3:
- Scroll choreography with scrub/pin/snap (ScrollTrigger has no equal).
- FLIP transitions across DOM restructuring (Flip).
- SVG morphing/drawing (MorphSVG, DrawSVG), motion along paths.
- Coordinated master timelines across many elements/scenes.
- Text splitting choreography (SplitText), physics/inertia dragging.
- Narrative scenes needing precise scene control.

If a project needs exactly one of these once, consider whether a simpler
composition (IntersectionObserver + CSS) reaches 90% of the effect at 10%
of the cost. The dependency budget rules in the project preferences apply.

## Adding a dependency: required justification

Before adding any motion library, record: why levels above fail, bundle
cost (import-size the actual modules), a11y posture, cleanup story, and
the removal path. "The reference site used it" is not a justification.

## No-animation is a valid register

MOTION_INTENSITY 1-2 means: state changes are instant, focus/hover use
color/weight only, and the interface's quality comes from typography,
spacing and speed. High-frequency operative tools often SHOULD live here.
An interface with zero animation and sub-100ms responses outranks one
with beautiful 400ms transitions on every click.
