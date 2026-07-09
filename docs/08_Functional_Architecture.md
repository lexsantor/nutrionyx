# 08. Functional Architecture

## Objective

Define the functional decomposition of the platform independent of
implementation.

## Core Modules

-   Identity & Access
-   Organization Management
-   Patient Management
-   Clinical Assessment
-   Treatment Management
-   Progress Tracking
-   Medication Tracking
-   Reporting
-   Notifications
-   Settings

## Module Interaction

Patients are always accessed through an Organization. Treatments depend
on Patients. Measurements enrich Progress. Dashboards consume aggregated
data only.

## Architectural Principles

-   Modular boundaries.
-   Loose coupling.
-   High cohesion.
-   Server-authoritative business rules.
-   Event-ready architecture.

## Cross-cutting Concerns

Authentication, authorization, audit logging, analytics, validation and
notifications apply consistently across every module.
