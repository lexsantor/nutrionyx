# PRD.md

# 00. Document Control

  Field      Value
  ---------- ----------------------------------
  Project    Nutrition Platform
  Document   Product Requirements Document
  Version    0.1
  Status     Draft
  Audience   Product, Design, Engineering, QA
  Owner      Product Team

## Purpose

This document is the single source of truth for the product. It defines
the product vision, scope, business rules, user experience principles,
and implementation constraints. Any architectural or implementation
decision must remain aligned with this document.

## Objectives

-   Define a scalable SaaS platform for nutrition professionals.
-   Support multi-tenant operation from day one.
-   Deliver a premium experience for nutritionists and patients.
-   Ensure privacy, security, maintainability and future extensibility.

## Audience

-   Product Managers
-   UX/UI Designers
-   Software Architects
-   Frontend Engineers
-   Backend Engineers
-   QA Engineers
-   AI coding agents (Claude Code)

## Guiding Rules

1.  The PRD prevails over implementation details.
2.  Simplicity takes priority over feature quantity.
3.  Every feature must provide measurable value.
4.  Patient privacy is mandatory.
5.  The architecture must support future growth without major redesign.

## Assumptions

-   Initial deployment on Vercel.
-   Authentication via Clerk.
-   PostgreSQL database (final provider documented in Architecture).
-   Responsive, mobile-first application.
-   Multi-tenant architecture.

## Change Log

  Version   Date         Description
  --------- ------------ ----------------------------------
  0.1       2026-07-09   Initial Document Control chapter
