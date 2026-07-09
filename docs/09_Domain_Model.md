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
