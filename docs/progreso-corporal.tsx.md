# 04. Product Operating Model

## Purpose

This chapter defines how the platform operates from a business
perspective. It describes the lifecycle of organizations, professionals,
patients and treatments independently of implementation details.

------------------------------------------------------------------------

# 4.1 Operating Model

The platform is a multi-tenant SaaS where each organization operates
independently.

Each organization owns:

-   Professionals
-   Patients
-   Treatments
-   Clinical data
-   Documents
-   Dashboards
-   Configuration

No data may cross organization boundaries.

------------------------------------------------------------------------

# 4.2 Organization Lifecycle

1.  Organization created.
2.  Lead Nutritionist becomes Organization Owner.
3.  Platform configuration.
4.  Patient onboarding begins.
5.  Daily clinical operation.
6.  Organization growth (future assistants/coaches).
7.  Subscription lifecycle (future).

------------------------------------------------------------------------

# 4.3 Patient Lifecycle

Every patient progresses through a defined journey.

``` text
Invited
↓
Account Activated
↓
Mandatory Onboarding
↓
Initial Assessment
↓
Treatment Planning
↓
Active Treatment
↓
Periodic Reviews
↓
Treatment Completed
↓
Maintenance
```

Patients cannot skip mandatory stages.

------------------------------------------------------------------------

# 4.4 Treatment Lifecycle

Every treatment is versioned rather than overwritten.

Stages:

-   Draft
-   Active
-   Updated
-   Completed
-   Archived

Historical treatments remain available for reporting.

------------------------------------------------------------------------

# 4.5 Onboarding Rules

The initial assessment is mandatory.

Until completed:

-   dashboards remain locked;
-   treatment modules are unavailable;
-   progress tracking cannot begin.

Progress is automatically saved.

------------------------------------------------------------------------

# 4.6 Daily Workflow

### Nutritionist

1.  Reviews dashboard.
2.  Checks alerts.
3.  Opens patient.
4.  Reviews progress.
5.  Adjusts treatment.
6.  Records consultation.
7.  Schedules next review.

### Patient

1.  Opens dashboard.
2.  Reviews today's actions.
3.  Records measurements.
4.  Confirms medication (if enabled).
5.  Follows diet/exercise.
6.  Reviews progress.

------------------------------------------------------------------------

# 4.7 Ownership Rules

Every business object has a single owner.

Organization └── Patient ├── Assessments ├── Treatments ├── Measurements
├── Medication ├── Documents └── Timeline

Ownership is inherited.

------------------------------------------------------------------------

# 4.8 Multi-Tenant Isolation

Isolation applies to:

-   Authentication
-   Authorization
-   Storage
-   Queries
-   Analytics
-   Reports
-   Exports

Server-side validation is mandatory for every request.

------------------------------------------------------------------------

# 4.9 Business Events

Important lifecycle events include:

-   Patient invited
-   Assessment completed
-   Treatment activated
-   Medication started
-   Review scheduled
-   Goal achieved
-   Treatment completed

These events will support future automation and notifications.

------------------------------------------------------------------------

# 4.10 Design Implications

The interface must always reflect lifecycle state.

Examples:

-   Incomplete onboarding → onboarding UI.
-   Active treatment → daily dashboard.
-   Completed treatment → maintenance dashboard.

Users should never see functionality that is not relevant to their
current stage.
