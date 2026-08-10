# Slice 16 - Documents

Status: in progress. Tier 2 closer. Reuses the private-Blob rail from
slice 14 (store `nutrionyx-private`, `lib/blob-private`, auth-gated
streaming route pattern).

## Scope

- **Specialist** uploads documents for a patient (PDF, JPG, PNG, WebP,
  <= 10 MB) on the patient detail: list (name, date), download, delete.
- **Patient** sees and downloads their documents in /mi-espacio (read-only).
- Platform admin: never (operator-blindness).

Out: e-signature, document generation/reports, patient uploads, folders.

## Pieces

- `PatientDocument` (org-scoped): pathname, contentType, fileName,
  uploadedByAuthUserId, createdAt.
- `POST /api/documents`: nutritionist-only multipart (patientId + file),
  org-scoped ownership check, 303 back to the patient detail.
- `GET /api/documents/[id]`: stream `inline; filename=` - owner patient or
  org nutritionist; admin 403.
- Delete: server action (specialist), blob first best-effort, then row.
- `erasePatient` extended to documents (rows + blob pathnames).
- Events `DocumentAdded` / `DocumentDeleted`; isolation covers the list.

## Gates

tsc · lint · vitest · build; isolation; migration `patient_documents`.
