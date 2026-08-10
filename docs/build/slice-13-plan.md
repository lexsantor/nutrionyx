# Slice 13 - Export & erasure (GDPR product features)

Status: in progress. Tier 2; vision §4 lists both as **tested product
features** - a compliance floor. Progress photos moved to a later slice.

## Export (patient right of access)

- `GET /api/me/export`: session-gated, patient-only. JSON download of the
  patient's own data: profile, assessments, measurements, medication plan +
  doses, targets. **Specialist notes excluded**: anotaciones subjetivas del
  profesional (LOPD art. 18 / Ley 41/2002 allows reserving them); decision
  recorded here - revisit if legal review says otherwise.
- Link "Descargar mis datos" at the bottom of /mi-espacio.

## Erasure (right to be forgotten)

Anonymization-as-erasure (AEPD-accepted): children hard-deleted, the Patient
row becomes a PII-free tombstone. Why not delete the row: `resolveUserRole`
treats "no Patient row" as nutritionist, so a full delete would let an erased
patient's login resolve into the consulta's /panel (privilege escalation).
The tombstone keeps `authUserId` so the login still resolves as patient.

- `erasePatient` (org-scoped, transaction): delete doses, plan, targets,
  notes, measurements, assessments (predecessor links nulled first), and the
  patient's domain events (erasure trumps append-only); scrub email →
  `erased-<id>@anonimizado.invalid`, fullName → null.
- Best-effort `auth.organization.removeMember` with the pre-scrub email.
- Event `PatientErased` (aggregate Organization, counts only, no PII).
- Panel patient detail: destructive "Eliminar paciente" with explicit
  confirmation checkbox; redirects to the patient list.
- Isolation test: cross-org erase attempt touches nothing.

## Gates

tsc · lint · vitest · build; isolation extended; no schema change.
