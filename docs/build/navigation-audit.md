# Navigation audit - three portals (2026-08-12)

What each role can reach today, what exists but has no door, and what is
missing outright. Compared against [07_Information_Architecture.md](../07_Information_Architecture.md),
the domain model in `prisma/schema.prisma`, and the planned tiers in
[roadmap-feature-tiers.md](roadmap-feature-tiers.md).

Method: the route tree under `src/app`, the three nav definitions
(`components/console-shell.tsx` `PRIMARY_NAV`, `app/mi-espacio/patient-nav.tsx`,
and `/admin`, which has none), and every Prisma model checked for whether a
human can see it. Claims below are read off those files, not inferred.

## The rule this audit applies

**No nav entry without a screen behind it.** An empty tab is worse than a
missing one: it promises and then wastes a click. Everything recommended
here has data already in the database and code already written - this is
about doors, not features.

Second rule, from the IA doc: **maximum three levels, frequent actions
within two clicks.** Most gaps below are things sitting at four clicks or
behind an arbitrary choice.

---

## 1. Specialist console (`/panel`)

Today: **Inicio · Pacientes · Agenda**, with Ajustes pinned at the bottom.

Three items is not automatically too few. The question is whether anything
daily is unreachable from them. Two things are.

### Exists, but has no door

| Thing | Where it lives now | Why that is wrong |
|---|---|---|
| **Plantillas** de dieta y entreno | Inside a patient's diet or training editor (`TemplateBar`) | Org-level asset behind a patient-level door. To rename, delete or even *see* your templates you must first open some arbitrary patient. Shipped today; already needs this. |
| **Mensajes** | `/panel/pacientes/[id]/mensajes`; unread shows only as a badge on the patients table | No inbox. With 40 patients, "who wrote me" is a table scan. This is the one daily loop that currently requires hunting. |
| **Evaluaciones** | Read-only block inside patient detail | The dashboard counts "con evaluación completada" but the number is not a list. You cannot act on it. |
| **Documentos** | Per patient | Correct at this size. Not a gap. |

### Not built at all

Reporting (adherencia, evolución), RBAC de equipo, facturación. All three are
already sequenced in the roadmap. Correctly deferred - a single-staff consulta
does not need RBAC (YAGNI), and reporting needs the data to accumulate first.

### Ajustes is not a gap

Worth stating because it looks thin from the sidebar: it already holds the
consulta profile, fiscal data, logo, specialty configuration and consent. It
is fine.

### Recommended

**Inicio · Pacientes · Agenda · Mensajes · Biblioteca** | Ajustes

`Biblioteca` is the honest name for org-level reusable content: diet
templates, training templates, and later the exercise catalogue. Five items
is still a short sidebar.

---

## 2. Patient portal (`/mi-espacio`)

Today: **Inicio · Dieta · Entreno · Medicación · Mensajes**.

The problem here is the opposite of the console's. Nothing is missing so
much as everything ended up on the home page. `/mi-espacio` currently carries
the weight check-in, the protein log, the BMI summary, the weight chart,
upcoming appointments, documents, photos, the data export link and the
assessment entry point. It is a dashboard doing the job of five screens.

### Exists, but has no door

| Thing | Where | Why that is wrong |
|---|---|---|
| **Evaluación** | A card on home, and only before completing it | The clinical baseline of the whole relationship. After finishing it there is no route back from the nav to review what was answered. |
| **Peso e histórico** | Chart on home | No list, no history, no editing a wrong entry. |
| **Medidas corporales** | Logged by the specialist | The patient never sees them, though they are their own body data. |
| **Fotos** | Card on home | No gallery, no before/after, which is the entire reason photos exist. |
| **Documentos** | List on home | Downloadable. No surface of their own. |
| **Exportar mis datos** | A link on home | A GDPR right living in a card among lifestyle widgets. |

### Not built at all

- **Perfil / cuenta**: no page to see own data, review consents, or change a
  password.
- **Solicitar borrado**: only the specialist can erase (`erase-form.tsx` in
  the console). That is defensible - the consulta is the data controller,
  Nutrionyx the processor - but the patient has no visible way to *ask*.
  Worth a decision record either way, not silence.
- **Reservar cita**: appointments are visible, not bookable. Already backlog.

### Recommended

**Inicio · Dieta · Entreno · Medicación · Progreso · Mensajes** | Perfil

- **Progreso** absorbs weight history, body measurements and photos. It
  answers "am I getting better", which is the patient's actual question and
  today has no home.
- **Perfil** absorbs mis datos, mi evaluación, consentimientos, exportar,
  solicitar borrado, cerrar sesión. As an avatar menu, not a sixth tab -
  six items is the mobile topbar ceiling.
- **Inicio** then becomes what it should be: today. Check-in, next dose,
  next appointment. Everything else moves out.

---

## 3. Superadmin (`/admin`)

Today: **one page, no navigation.** Four metric cards, a read-only consultas
table, and access-code generation.

At this scale a single page is a defensible choice. What is not defensible is
what it cannot do.

| Gap | Why it matters |
|---|---|
| **Consultas are read-only** | Cannot open one, cannot see its users, cannot suspend it. `listConsultas()` is the only query that exists. |
| **No user lookup** | "This person cannot log in" has no tool behind it. Every support request becomes a database query. |
| **No audit view** | `DomainEvent` is append-only and there is no way to read it. Every slice writes to it faithfully and nothing has ever read it back. A platform admin with no audit trail is a compliance gap, not a convenience one. |
| **No billing** | Tier E, correctly deferred until monetization. |

Access codes are fine: `createAccessCode` and `revokeAccessCode` both exist
and are wired.

### Recommended

**Resumen · Consultas · Usuarios · Auditoría** (facturación later)

This is the one portal where adding navigation is itself the change: it needs
a shell before it needs pages.

---

## Plan

Effort per LPEF: S = under one slice, M = one slice.

### Tier 1 - the two that are actually broken

| # | Change | Effort | Impact | Benefit |
|---|---|---|---|---|
| 1 | `/panel/biblioteca` - list diet and training templates, rename, duplicate, delete, preview a week | S-M | Specialist, weekly | Gives what shipped today a door. Templates are effectively write-only right now. |
| 2 | `/panel/mensajes` - all threads, unread first then recency, links into the patient thread | M | Specialist, daily | Removes the only daily task that currently requires scanning a table. |

Both reuse repositories that already exist. Neither needs a migration.

### Tier 2 - patient information architecture

| # | Change | Effort | Impact | Benefit |
|---|---|---|---|---|
| 3 | `/mi-espacio/progreso` - weight history, chart, body measurements, photo gallery | M | Patient, weekly | Answers the patient's real question, currently scattered across home. |
| 4 | `/mi-espacio/perfil` - own data, assessment review, consents, export, erasure request, sign out | M | Patient, monthly + compliance | Moves a GDPR right out of a lifestyle card. |
| 5 | Trim `/mi-espacio` to "hoy" once 3 and 4 absorb its cards | S | Patient, every visit | Home stops being a dumping ground. |

Do 5 in the same slice as 3 and 4, not after: leaving the cards duplicated in
both places is worse than either layout alone.

### Tier 3 - superadmin

| # | Change | Effort | Impact | Benefit |
|---|---|---|---|---|
| 6 | Admin shell with nav + consulta detail (users, status, suspend) | M | Platform, weekly | Support stops being a database query. |
| 7 | `/admin/auditoria` - read `DomainEvent`, filter by org, type, date | M | Compliance | The audit trail exists and has never been readable. |

### Tier 4 - reserve the place, do not ship the tab

Reporting-lite, facturación, RBAC de equipo, reserva de cita por el paciente.
All already in the roadmap. Nav should have room for them; none should appear
until there is a screen behind it.

### Sequence

1 → 2 → (3, 4, 5 as one slice) → 6 → 7.

Tier 1 first because both items are doors onto work already done, which is
the cheapest impact available. Tier 2 next because it is the portal a patient
opens daily and the one carrying the most structural debt. Tier 3 last
because the platform has one administrator, and that administrator can still
reach the database.
