# 09. Domain Model

## Aggregate Roots

-   Organization
-   Patient
-   Assessment
-   Treatment

## Main Entities

Organization ├── Nutritionists ├── Patients ├── Settings

Patient ├── Assessments ├── Treatments ├── Measurements ├── Medication
├── Documents ├── Timeline

Treatment ├── Diet Plan ├── Exercise Program ├── Goals ├── Reviews

## Value Objects

-   Body Measurements
-   Weight
-   BMI
-   Medication Dose
-   Goal Target

## Invariants

-   Every patient belongs to one organization.
-   Historical measurements are immutable.
-   Treatments are versioned.
-   Ownership is inherited.
-   Completed assessments are immutable; re-assessment creates a new version (decision 2026-07-09).

## Assessment Aggregate (slice 1 specification, 2026-07-09)

Source decisions: [discovery](discovery/assessment-slice.md), [ADR-0002](../adr/0002-food-preferences-ownership.md).

### States

`InProgress -> Completed`. Created as InProgress when the patient starts it; answers editable while InProgress; frozen at Completed. Completed is terminal - a repeat creates a new Assessment version referencing its predecessor. The patient dashboard unlocks on the first Completed assessment (04_Product_Operating_Model §4.5).

### Sections and fields (core clinical intake)

-   Demographics: sex, birth date.
-   Anthropometrics: height, current weight, target weight.
-   Activity: activity level.
-   Goals: primary objective, secondary objectives.
-   Medical essentials: existing conditions, allergies and intolerances, current medication (declarative text at intake; not linked to the Medication entity in slice 1).

Excluded from slice 1 by decision: lifestyle detail, nutrition history, document upload, food preferences (Diet Plan context, ADR-0002).

### Computed values

BMI (existing value object) from height and weight at completion; target-weight delta ratio, driving the tiered safety feedback at capture time.

### Events

-   AssessmentStarted
-   AssessmentCompleted (fires once per version; unlocks dashboard on first occurrence)

### Open (not slice 1)

Reconciliation of aggregate roots with PRD_03 §3.5: PRD_03 lists Medication, Diet Plan, and Exercise Program as roots; this model holds them as child entities. Decide when the first of those contexts is built; flagged 2026-07-09.
