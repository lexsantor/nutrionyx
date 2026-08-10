# Feature tiers - effort / impact / benefit (2026-08-10)

Inventory sources: FitOdds reference screens (screens-ui-examples, mined in
slice-8-plan), the target architecture (docs/00 §3 bounded contexts), and gaps
neither covers. Effort: S (<1 slice), M (1 slice), L (2-3 slices), XL (epic).
Impact: who feels it and how often. Benefit: strategic value beyond the user.

Ordering rule (LPEF C2/C6): highest impact-per-effort first; compliance floors
are not optional; anything touching AI-on-health-data or marketplace needs a
dedicated compliance review before scoping (docs/00 §4).

## Tier 1 - now (S-M effort, daily-use impact)

| Feature | Effort | Impact | Benefit |
|---|---|---|---|
| Targets + daily checklist (slice 9, in progress) | M | Patient daily habit loop + specialist prescribes targets | Closes the first prescribe→track→review loop; base for food/training |
| Specialist notes on patient | S | Specialist, every consultation | First editable clinical datum; near-zero risk |
| Email notifications (invite, dose/weigh-in reminders) | M | Both, weekly | Engagement multiplier for everything already built; needs Resend (or similar) |
| Patient shell parity (mi-espacio on console patterns) | S | Patient, every visit | UX coherence; removes legacy Topbar debt |
| Consulta logo upload (Vercel Blob) | S | Specialist branding | Deferred since slice 4; trivial with Blob |

## Tier 2 - next wave (M-L)

| Feature | Effort | Impact | Benefit |
|---|---|---|---|
| Body composition (manual: waist/hip, % fat, derived lean/fat) | M | Both, weekly | Extends Measurement pattern; FitOdds core screen, no camera needed |
| Progress photos (Blob, private) | M | Both, monthly | High perceived value; GDPR Art. 9 storage care |
| Export & erasure as product features | M | Compliance | Vision §4 lists as tested features - a floor, not a nice-to-have |
| RBAC team members | L | Multi-staff consultas | Unlocks bigger customers; vision [next] |
| Specialist reporting-lite (adherence/evolution per patient) | M | Specialist, weekly | Reuses existing data; retention driver |
| Documents (PDFs, consents) | L | Both, monthly | Practice operations; e-sign later |

## Tier 3 - big bets (L-XL, sequenced after tiers 1-2)

| Feature | Effort | Impact | Benefit |
|---|---|---|---|
| Diet plan builder (meals, recipes, macros) | XL | Core clinical treatment | The product's reason to exist long-term; needs domain design first |
| Training log + routines | L | Sports-nutritionist segment | Activates the SPORTS_NUTRITIONIST sub-role divergence |
| Messaging patient↔specialist | L-XL | Both, daily | Engagement; needs notification infra first (Tier 1 email) |
| Scheduling & calendar | XL | Practice operations | Whole bounded context; external calendar sync |
| Billing (Stripe, Tier E) | L | Monetization | When converting to paid; entitlements design exists in vision |

## Tier 4 - gated or not for web v1

| Feature | Why not now |
|---|---|
| Marketplace | High-compliance (reviews of health professionals); far future |
| AI (diet generators, risk detection) | Compliance review required before scoping (docs/00 §4) |
| Camera body scan / 3D form demos | Native-app tech; web v1 substitutes manual entry |
| Apple Health sync | Native; revisit if a mobile wrapper ever ships |
| Streaks/gamification | Anti-reference (PRODUCT.md): no guilt mechanics |

## Sequence recommendation

Slice 9 (targets+checklist) → notes → email notifications → body composition
→ shell parity + logo (filler slices) → export/erasure → reporting-lite →
then pick the first big bet (diet plans is the strategic one; training if the
sports segment pulls harder).
