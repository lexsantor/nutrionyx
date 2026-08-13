# Benchmark: what the reference class offers that we do not

Date: 2026-08-13. Purpose: decide what to build next, not to write a
comparison for the landing page (the owner asked for the first and explicitly
not the second).

## How much to trust this

Compiled from vendor sites, review aggregators and comparison posts, not from
using the products. Feature lists written by vendors overstate; comparison
posts are often written by competitors. Treat every row as "they claim to have
this", verify before committing to parity, and re-check pricing separately
because none of it is recorded here.

Reference class per [PRODUCT.md](../../PRODUCT.md) and
[docs/00](../00_Vision_and_Target_Architecture.md): Healthie, Practice Better,
Nutrium, SimplePractice. Dietopro added because it is Spanish and competes for
the same consulta.

## The four, in one line each

- **Healthie** (US) — an EHR first: SOAP notes, custom intake forms, treatment
  plans, lab values and medications on the chart, plus telehealth, a branded
  client portal, photo food journaling, programs and courses, an AI scribe,
  and insurance billing.
- **Practice Better** (CA) — the most complete practice management of the
  four: scheduling, charting, protocols, packages, billing, client portal and
  app. Meal planning came from acquiring That Clean Life in 2023. Supplement
  protocols wired into dispensaries (Fullscript and others).
- **Nutrium** (PT) — the nutrition specialist: a large food database, meal
  plans built from it, automatic macro *and micro* nutrient analysis per
  intake, patient app, exportable reports, wearables, and 100+ educational
  infographics. GDPR-native, which matters here.
- **Dietopro** (ES) — assisted diet generation from the clinical history,
  including pathologies and drug-nutrient interactions; agenda with
  reminders; clinical history with anthropometry and lab results; invoicing;
  reports; educational content.

## The gaps, ordered by how much they cost us

### 1. Food database and automatic macros — the one that decides the sale

Every one of the four builds the diet plan on top of a food database and
computes macros (Nutrium also micros) as the plan is written. Ours is
structured free text: `cantidad` + `alimento` rows, no database behind them,
no totals. A dietista-nutricionista notices this in the first ten minutes.

This is also the largest thing on the list. It needs a food composition source
(BEDCA is the Spanish reference, USDA the usual fallback), a portion/measure
model, and a plan editor that recomputes as you type. `docs/00` already parks
it under Clinical Treatment - Nutrition `[future]`.

### 2. Invoicing, and a legal deadline attached to it

All four invoice. For Spain there is a harder reason than parity:
**Verifactu**, the Agencia Tributaria's verifiable invoicing regime, requires
issued invoices to be recorded so they cannot be altered afterwards. If the
platform ever issues invoices on behalf of a consulta, it inherits that
requirement. Billing is `[Tier E]` in the vision; the point here is that when
it lands it is not a Stripe integration, it is a compliance feature.

**This needs its own check before it is scoped.** I have not verified which
obligations fall on the software vs on the professional, and the answer
changes the size of the work.

### 3. Clinical notes for the specialist

Healthie and Practice Better both centre on SOAP-style charting. We have no
place for the specialist to write anything about a patient: the record holds
what the patient submitted and what was prescribed, and nothing the
professional thought. `tasks/todo.md` already lists "Specialist notes" as a
next candidate and calls it small and high-value. The benchmark agrees.

### 4. The patient books their own appointment

All four let the client book from the portal. Our agenda is specialist-side
only; the navigation reserves the space. Reminders exist here already (the
daily cron) but delivery waits on the sending domain.

### 5. A food diary

Healthie's differentiator is photo-based food journaling with feedback. Our
patient logs weight, doses, sessions and measurements, but never what they
ate, so the plan is prescribed and never observed. Note this is a volume
problem as much as a feature: a daily photo per patient is storage and review
time.

### 6. Telehealth

Healthie and Practice Better include video. Our appointments carry a `VIDEO`
mode and a link field, which covers the case without being a video product.
Probably correct to leave as is.

### 7. Custom intake forms

Ours is a fixed 10-step assessment. Theirs are builders. A form builder is a
large, generic feature; a smaller version is letting a consulta add a few
questions of its own.

### 8. Programs, packages and courses

Practice Better and Healthie sell these as the specialist's own monetization.
Out of scope until our own billing exists.

### 9. Supplement dispensaries

Fullscript and similar are a US revenue model that does not transfer to the EU
market. Recommend ignoring.

### 10. Wearables

All four sync something. Ours would be weight and activity, and both already
have a manual path.

## What we have that they mostly do not

Worth keeping in view, because the temptation of a benchmark is to converge on
the average product:

- **GLP-1 as a first-class object.** Prescriber's regimen, per-dose logging,
  injection-site rotation on an anatomical figure, adherence in the report.
  With semaglutide and tirzepatide where they are, this is a real wedge, and
  none of the four is built around it.
- **Training beside nutrition in one record.** Nutrium and Healthie are
  nutrition products; training is usually a different app.
- **Operator-blindness as an enforced rule**, with tests that fail if a domain
  event carries a clinical value. That is a claim the others do not make in
  these terms.

## Recommendation

Sequenced by value against cost, and against the vision rather than against
the competition:

1. **Specialist notes.** Small, already on the backlog, closes a gap all four
   have covered. Days, not weeks.
2. **Food database and macros, as a thin slice.** Not the whole system: one
   food source, one portion model, totals per day, on the existing plan
   editor. This is where the product either becomes a nutrition tool or stays
   a coordination tool.
3. **Patient self-booking**, once email delivery is real. Half the work is
   already in the agenda.
4. **Invoicing with a Verifactu review first**, not a Stripe integration
   first.

Explicitly not recommended: supplement dispensaries, a form builder, a
telehealth product, wearables.

## Sources

- [Healthie on Capterra](https://www.capterra.com/p/167439/Healthie/) ·
  [Healthie review 2026](https://www.promealplan.com/en/blog/healthie-review-2026)
- [Practice Better review 2026](https://www.promealplan.com/en/blog/practice-better-review-2026) ·
  [Practice Better guide](https://jesscreatives.com/blog/practice-better-the-ultimate-guide-and-qa/)
- [Nutrium features](https://nutrium.com/blog/es/funcionalidades/) ·
  [Nutrium on Capterra](https://www.capterra.com/p/173803/Nutrium/)
- [Spanish market roundup incl. Dietopro and Verifactu](https://www.focuss.es/mejor-software-para-nutricionistas-2026/) ·
  [fitgeneration roundup](https://fitgeneration.es/5-mejores-softwares-para-dietistas/)
