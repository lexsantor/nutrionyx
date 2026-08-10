# Forms and Interface States

## Forms

Structure:
- Every control: visible label, programmatically associated, label click
  focuses the control; checkbox/radio share one generous hit target with
  their label.
- Correct type + inputmode + autocomplete + meaningful name on every field;
  spellcheck off for emails/codes/usernames; placeholders are example
  patterns (ending with an ellipsis), never labels.
- Group related fields with fieldset/legend; one column beats two for
  completion; progressive disclosure over up-front walls of fields.

Input tolerance:
- Never block paste. Never swallow keystrokes for formatting; accept, then
  format/validate with feedback. Trim trailing whitespace from text
  expansion. Compatible with password managers and OTP autofill; keep
  managers out of non-auth fields (autocomplete="off" where appropriate).
- Never ask twice (3.3.7): reuse earlier answers, offer "same as billing".

Validation and submission:
- Validate on submit (or on blur after first error); never pre-disable
  submit. Errors: inline next to the field, text + icon (not color alone),
  concrete fix suggested; on submit, focus the first error; announce count
  via aria-live.
- In-flight: disable the button, keep its label, show progress, use an
  idempotency key; on success, confirm visibly; on failure, preserve every
  character the user typed.
- Warn before navigation that would lose unsaved changes.

## The seven states of every screen

Design and implement all that apply; "happy path only" is an audit finding:

1. Empty (first use): explain value, one clear starting action; an empty
   state is an onboarding surface, not a void.
2. Sparse (1-2 items): layout must not look broken with a single item.
3. Dense (100x expected): overflow, truncation with full value on
   focus/hover, virtualization past ~50 rows, pagination/infinite choice
   deliberate.
4. Loading: skeletons mirror the final layout exactly (zero shift);
   spinners appear only after 150-300ms and remain >= 300ms; never stack
   spinner + skeleton.
5. Error: what failed, why, retry/recovery action, support path; partial
   failure states for partially loaded views.
6. Success/confirmation: visible, calm, with the next logical step
   (peak-end investment point).
7. Offline/degraded where relevant: queue, retry, stale-data labeling.

Content-length stress: every text container tested with short, average and
hostile-long content (min-w-0 on flex children, break-words, line-clamp
with full-value affordance). Localized strings assume 1.5x expansion.

State is shareable: filters, tabs, pagination, selected item, expanded
panels live in the URL when the surface is navigational; refresh and Back
restore the user's place. Destructive actions: undo window preferred over
confirmation; irreversible + no undo requires explicit consequence
language and friction proportional to loss.
