# Discovery: Assessment Slice (Slice 1)

Status: closed - owner inputs answered 2026-07-09; spec lives in [09_Domain_Model](../09_Domain_Model.md) Assessment Aggregate section.
Created: 2026-07-09. Owner: Lex.

## Why this slice

Chosen 2026-07-09 over weight-logging and medication-adherence candidates. The Assessment is the gate every lifecycle rule pivots on (04_Product_Operating_Model §4.5: dashboards locked and treatment modules unavailable until completed), it delivers Journey 1 end to end (10_User_Journeys: Invitation -> Activation -> Authentication -> Mandatory Assessment -> Treatment Creation -> Dashboard Unlock), it exercises the multi-tenant identity spine every later slice needs, and it is the only entity with real evidence behind it ([reference flow analysis](../research/reference-flow-analysis.md)).

## Problem

From PRD_02 §2.1: nutrition professionals run intake through paper questionnaires, spreadsheets, and messaging apps; intake is slow, error-prone, and unstructured, and patients disengage before treatment starts.

Evidence status: UNVALIDATED. This is an assertion inherited from the PRDs, which contain no research artifacts (LPEF PR1 gap, flagged in discovery review 2026-07-09). Slice 1 proceeds on it as an explicit bet; the assumption ledger below is the honest record.

## Decisions already taken

- Slice 1 = Assessment, end to end ([selection recorded above](#why-this-slice)).
- Spanish UI, i18n from day one ([ADR-0001](../../adr/0001-spanish-ui-i18n-from-day-one.md)).
- Food preferences: Diet Plan owns; Assessment may capture; optional for slice 1 ([ADR-0002](../../adr/0002-food-preferences-ownership.md)).

## Scope

In: nutritionist invites patient; patient activates account; patient completes a multi-step assessment (one question per screen, progress indicator, live computed feedback - the three patterns adopted from the reference flow analysis); computed summary (BMI at minimum); AssessmentCompleted event; dashboard unlock for both roles.

Out: diet plan generation, medication, exercise, messaging, food preference capture (optional, ADR-0002), any of the reference funnel's marketing machinery (fake processing, unverifiable claims, plan-hostage email gate - rejected wholesale, LPEF C13).

## Proposed success metrics (owner must confirm targets)

- Primary: assessment completion rate - of patients who activate their account, the share that reaches AssessmentCompleted. Proposed target: >= 80 percent. Basis: none yet; first cohort sets the baseline.
- Counter-metric: median completion time <= 15 minutes (already asserted in 10_User_Journeys) - guards against completion bought with data-entry burden.
- Guardrail: zero clinically unsafe targets accepted silently - unsafe weight-loss ratios get the tiered warning at capture time (adopted from the reference flow's strongest pattern, repurposed as a clinical guardrail).

## Assumption ledger

1. Nutritionists will delegate intake to a patient-completed digital assessment (vs doing intake verbally in consultation). If false, the slice's primary user is wrong.
2. The patient completes the assessment before first value (04's mandatory gate). Aggressive; the reference product gates a free plan behind 27 steps, but our patients have a professional relationship as motivation.
3. BMI plus the profile fields below constitute a clinically useful initial picture for the nutritionist.

## Owner inputs (answered 2026-07-09)

1. Field list: core clinical intake only - demographics, anthropometrics, activity level, goals, medical essentials (conditions, allergies/intolerances, current medication). Lifestyle detail, nutrition history, and document upload excluded from slice 1.
2. Assessment states: InProgress -> Completed; editable until Completed, then frozen.
3. Repeats: new version per repeat; completed assessments immutable, history preserved.
4. Targets confirmed: >= 80 percent completion, <= 15 minutes median.

## Next artifacts

Once owner inputs land: Assessment domain delta to 09_Domain_Model (entity, states, events, and the missing reconciliation of 7-vs-4 aggregate roots flagged 2026-07-09), then the build plan against stack-2026.
