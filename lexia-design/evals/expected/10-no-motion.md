# Grading: 10-no-motion

PASS requires all:
1. Zero transitions/animations shipped; grep confirms no transition/animation/motion imports added.
2. The no-motion register documented in DESIGN-SYSTEM.md as deliberate.
3. States change instantly and remain fully visible (focus, hover, selected, error).
4. Quality carried by typography/spacing/speed; screen still feels finished.
5. No animation dependency added to package.json.

FAIL indicators: "just one" transition; feedback removed along with motion; undocumented absence (future contributor bait).
