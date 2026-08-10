# Slice 14 - Progress photos (private Blob)

Status: in progress. Tier 2. Art. 9 data: photos live in the **private**
Blob store `nutrionyx-private` (store_d5EPcKBZ36Q4hyw6) - the public store
would expose them by URL (verified empirically: per-blob private on a public
store is rejected). Served only through an auth-gated route.

## Access model

- Patient: uploads, views, deletes their own photos.
- Specialist: views the photos of patients in their org (read-only).
- Platform admin: never (operator-blindness).

## Pieces

- `PatientPhoto` (org-scoped): pathname, contentType, createdAt. DB rows in
  the repository; blob I/O only in routes (keeps integration tests DB-only).
- `src/lib/blob-private.ts`: put/get/del passing the
  `PRIVATE_BLOB_READ_WRITE_TOKEN` env (the CLI cannot link a second store -
  env name collision - so the owner connects it in the dashboard with the
  `PRIVATE` prefix).
- `POST /api/me/photos`: patient-only multipart upload (jpeg/png/webp,
  <= 8 MB), 303 back to /mi-espacio. Route handler, not a server action
  (avoids the server-action body limit).
- `GET /api/photos/[id]`: session-gated stream - owner patient or a
  nutritionist of the same org. `Cache-Control: private`.
- Delete: server action (patient, own photo) - blob first, then row.
- `erasePatient` also deletes photo rows and returns pathnames so the
  caller can best-effort delete the blobs.
- Events: `PhotoAdded` / `PhotoDeleted` (ids only).

## Gates

tsc · lint · vitest · build; isolation: photos invisible cross-org;
migration `patient_photos` (sandbox-runnable now).
