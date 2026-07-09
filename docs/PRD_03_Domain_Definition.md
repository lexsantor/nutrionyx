# 03. Domain Definition

## Purpose

This chapter defines the business domain independently from any
technology or user interface.

The platform must always be designed around the domain model rather than
around screens or CRUD operations.

------------------------------------------------------------------------

# 3.1 Ubiquitous Language

The following terminology is mandatory throughout the project.

  -----------------------------------------------------------------------
  Concept                        Definition
  ------------------------------ ----------------------------------------
  Organization                   A nutrition practice or clinic that owns
                                 all its data.

  Nutritionist                   Professional responsible for one
                                 organization.

  Patient                        Individual receiving treatment.

  Assessment                     Structured health evaluation completed
                                 during onboarding or follow-up.

  Treatment                      Complete nutrition program assigned to a
                                 patient.

  Diet Plan                      Nutritional recommendations and meal
                                 planning.

  Exercise Program               Physical activity plan.

  Medication                     Physician-prescribed medication related
                                 to treatment.

  Progress                       Historical evolution of patient metrics.

  Dashboard                      Visual representation of actionable
                                 information.
  -----------------------------------------------------------------------

Developers and AI agents must always use this vocabulary consistently.

------------------------------------------------------------------------

# 3.2 Core Domain

The platform exists to manage long-term nutritional treatments.

Everything revolves around one central concept:

Patient Journey

The software does not manage isolated data.

It manages the complete treatment lifecycle.

------------------------------------------------------------------------

# 3.3 Domain Vision

The product must answer four questions continuously:

1.  Who is this patient?
2.  What is their current situation?
3.  What treatment are they following?
4.  Is their health progressing toward the objective?

Every feature must contribute to answering one or more of these
questions.

------------------------------------------------------------------------

# 3.4 Bounded Contexts

The system is divided into independent business domains.

## Identity

Authentication

Authorization

Roles

Organizations

------------------------------------------------------------------------

## Patient Management

Patient profile

Medical history

Assessments

Progress

Documents

------------------------------------------------------------------------

## Clinical Treatment

Diet plans

Exercise programs

Medication

Objectives

Recommendations

------------------------------------------------------------------------

## Monitoring

Weight

Measurements

Photos

Medication adherence

Exercise adherence

Timeline

------------------------------------------------------------------------

## Communication (Future)

Messages

Notifications

Reminders

Appointments

------------------------------------------------------------------------

## Reporting

Dashboards

Reports

Statistics

Exports

------------------------------------------------------------------------

# 3.5 Aggregate Roots

The following entities are aggregate roots.

Organization

Patient

Treatment

Assessment

Medication

Diet Plan

Exercise Program

Each aggregate owns its internal consistency.

Cross-aggregate modifications must be explicit.

------------------------------------------------------------------------

# 3.6 Domain Rules

Rule 1

Every patient belongs to exactly one organization.

Rule 2

Every nutritionist belongs to one organization.

Rule 3

Patients never access other patients.

Rule 4

Organizations are completely isolated.

Rule 5

Historical information is immutable unless explicitly corrected.

Rule 6

Measurements are append-only.

Rule 7

Treatments evolve over time rather than being overwritten.

Rule 8

Dashboards are derived from historical data rather than manually edited.

------------------------------------------------------------------------

# 3.7 Domain Events

Future architecture should support events such as:

PatientCreated

AssessmentCompleted

WeightRecorded

MeasurementUpdated

DietAssigned

MedicationStarted

MedicationTaken

GoalReached

GoalUpdated

TreatmentCompleted

------------------------------------------------------------------------

# 3.8 Future Evolution

The domain must remain compatible with future support for:

• AI recommendations

• Wearables

• Apple Health

• Google Fit

• Multiple clinics

• Multiple languages

• Mobile applications

• External APIs

• Billing

No architectural decision may prevent these future capabilities.
