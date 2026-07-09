# 05. Identity & Access Model

## Purpose

Define identity, authentication, authorization and ownership principles.

## Identity Principles

-   Every user has a unique identity.
-   Every identity belongs to exactly one Organization.
-   Authorization is server-side only.
-   Deny by default.

## Roles

-   Organization Owner (Nutritionist)
-   Patient
-   Future: Coach, Assistant, Admin

## Permission Matrix

  Resource          Owner       Patient
  ---------------- ------- ------------------
  Patients          CRUD       Read Self
  Assessments       CRUD    Read/Update Own
  Diet Plans        CRUD        Read Own
  Exercise Plans    CRUD        Read Own
  Medication        CRUD    Read/Confirm Own
  Reports           CRUD        Read Own

## Ownership

Every resource inherits Organization ownership. No cross-tenant access
is ever allowed.

## Security Rules

-   Least privilege.
-   Role-based authorization.
-   Server validation mandatory.
-   Audit-ready architecture.
