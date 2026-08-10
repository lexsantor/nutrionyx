# GSAP Playbook

Verified 2026-07-31: gsap 3.15.0, @gsap/react 2.1.2. GSAP is 100% free
including all formerly-Club plugins since 3.13.0 (2025-04-30), under the
Standard "no charge" GSAP License granted by Webflow
(https://gsap.com/community/standard-license/). Commercial use allowed. Do
not redistribute modified GSAP source; do not build no-code visual
animation builders with it. GSAP is an implementation engine, not an art
direction: the decision to use it comes from tech-selection.md.

## Module map (import only what is used)

- Core: gsap (tweens, timelines), CSSPlugin (bundled).
- Scroll: ScrollTrigger (scrub/pin/snap/enter-leave), ScrollToPlugin,
  Observer (normalized wheel/touch input without scroll linkage),
  ScrollSmoother (smooth scroll layer; use rarely, see below).
- Layout: Flip (FLIP state transitions).
- SVG: DrawSVGPlugin, MorphSVGPlugin, MotionPathPlugin.
- Text: SplitText (chars/words/lines; 3.13 rewrite improved a11y),
  TextPlugin, ScrambleTextPlugin.
- Interaction: Draggable + InertiaPlugin.
- Easing: CustomEase, CustomBounce, CustomWiggle.
- Dev: GSDevTools (never ships to production).

Register once per app: gsap.registerPlugin(ScrollTrigger, ...).

## React contract (mandatory shape)

useGSAP from @gsap/react replaces useEffect/useLayoutEffect for animation
code: it wraps gsap.context() and auto-reverts every tween, timeline,
ScrollTrigger, Draggable and SplitText created inside on unmount (React 18
strict-mode double-invoke safe).

```tsx
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Section() {
  const scope = useRef<HTMLElement>(null);

  const { contextSafe } = useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          desktop: "(min-width: 768px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { desktop, reduceMotion } = ctx.conditions!;
          if (reduceMotion) {
            gsap.set(".reveal", { opacity: 1, y: 0 });
            return;
          }
          gsap.from(".reveal", {
            opacity: 0,
            y: desktop ? 24 : 12,
            duration: 0.5,
            ease: "power3.out",
            stagger: 0.06,
            scrollTrigger: { trigger: scope.current, start: "top 75%" },
          });
        }
      );
    },
    { scope }
  );

  // Event-handler animations must be contextSafe to be tracked/cleaned:
  const onActivate = contextSafe(() => {
    gsap.to(".indicator", { xPercent: 100, duration: 0.25, ease: "power2.out" });
  });

  return <section ref={scope}>...</section>;
}
```

Rules encoded above, all mandatory:
- scope confines selector text to the component's subtree.
- gsap.matchMedia() with a reduceMotion condition is the default pattern:
  responsive variants and reduced motion in one construct, auto-reverted.
- Reduced-motion branch SETS final states; content is never left hidden.
- Elements animated with .from() must be visible at rest without JS: never
  author opacity: 0 in CSS and reveal via GSAP.

## ScrollTrigger pitfalls (verified against official guidance)

- Never nest ScrollTriggers inside a timeline's child tweens; attach one
  trigger to the parent timeline.
- Multiple tweens animating the same properties of the same targets:
  immediateRender: false or fromTo, or the last-created from() wins wrongly.
- Loop to create one trigger per section; don't reuse one trigger for many
  elements' independent animations.
- Function-based start/end plus invalidateOnRefresh: true for values that
  depend on viewport size.
- Create triggers in document order or set refreshPriority.
- ScrollTrigger.refresh() after dynamic content/fonts/images settle
  (fonts.ready, image onload) or positions are wrong.
- SPA route change: kill triggers for removed DOM before/with navigation
  (useGSAP handles component-scoped ones; page-level ones are your job).
- Pinning inside transformed/overflow ancestors misbehaves: pin containers
  live at layout top level.

## Scroll integrity

scrub choreography and pinning are legitimate narrative tools on brand
surfaces at MOTION_INTENSITY >= 6. Scroll speed hijacking (ScrollSmoother
or lenis-class smoothing) requires explicit justification, a reduced-motion
bypass, working keyboard/anchor navigation and acceptable input latency;
default is native scroll. Never trap or reverse scroll direction; never
require scroll to be watched like a video with no skip.

## Performance discipline

- Animate transforms/opacity; xPercent/yPercent over left/top; force3D
  default is fine; avoid animating filter/box-shadow on large areas.
- One master timeline per scene, labels for choreography, timeScale for
  global tuning.
- Batch DOM reads before writes; ScrollTrigger.batch for many similar
  reveals.
- Kill loops when offscreen (ScrollTrigger onLeave/onEnterBack or
  IntersectionObserver).
- Budget: profile with 4x CPU throttle; if a pinned scene drops frames,
  simplify the scene, don't add will-change everywhere.

## Vanilla / non-React cleanup

Keep references to timelines/triggers; on teardown: tl.kill(),
trigger.kill(), mm.revert(), Observer.kill(), draggable.kill(). One
central destroy() per scene. Verify with repeated create/destroy cycles
(memory snapshots stable).
