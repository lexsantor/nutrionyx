"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { TEMPLATE_NAME_MAX } from "@/components/template-bar";
import {
  deleteTemplateAction,
  duplicateTemplateAction,
  renameTemplateAction,
  type LibraryFormState,
  type TemplateKind,
} from "./actions";

/**
 * Rename, duplicate and delete for one template row. The three live in a
 * single form targeted by formAction, mirroring components/template-bar,
 * so the name input is shared instead of duplicated per action.
 *
 * Deleting arms first: it is the only irreversible control on the page.
 */
export function TemplateActions({
  kind,
  id,
  name,
}: {
  kind: TemplateKind;
  id: string;
  name: string;
}) {
  const t = useTranslations("library");
  const [renameState, renameAction, renamePending] = useActionState<
    LibraryFormState,
    FormData
  >(renameTemplateAction, null);
  const [copyState, copyAction, copyPending] = useActionState<
    LibraryFormState,
    FormData
  >(duplicateTemplateAction, null);
  const [deleteState, deleteAction, deletePending] = useActionState<
    LibraryFormState,
    FormData
  >(deleteTemplateAction, null);
  const [armed, setArmed] = useState(false);

  const state = renameState ?? copyState ?? deleteState;
  const busy = renamePending || copyPending || deletePending;

  const ghost =
    "inline-flex h-9 items-center rounded-full border border-hairline bg-surface-1 px-3.5 text-sm font-medium text-ink transition-[transform,background-color,border-color] hover:border-hairline-strong hover:bg-surface-2 active:scale-[0.98] active:duration-150 disabled:opacity-50";

  return (
    <form className="flex flex-col gap-2">
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="id" value={id} />

      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={`name-${id}`} className="sr-only">
          {t("nameLabel")}
        </label>
        <input
          id={`name-${id}`}
          name="name"
          type="text"
          defaultValue={name}
          maxLength={TEMPLATE_NAME_MAX}
          className="h-9 w-full max-w-64 rounded-full border border-field-border bg-surface-2 px-3.5 text-sm text-ink"
        />
        <button
          type="submit"
          formAction={renameAction}
          disabled={busy}
          className={ghost}
        >
          {renamePending ? t("renaming") : t("rename")}
        </button>
        <button
          type="submit"
          formAction={copyAction}
          disabled={busy}
          className={ghost}
        >
          {copyPending ? t("duplicating") : t("duplicate")}
        </button>

        {armed ? (
          <span className="flex items-center gap-1.5">
            <button
              type="submit"
              formAction={deleteAction}
              disabled={busy}
              className="inline-flex h-9 items-center rounded-full bg-error px-3.5 text-sm font-semibold text-on-destructive transition-[transform,background-color] hover:bg-error-hover active:scale-[0.98] active:duration-150 disabled:opacity-60"
            >
              {deletePending ? t("deleting") : t("confirmDelete")}
            </button>
            <button
              type="button"
              onClick={() => setArmed(false)}
              className="inline-flex h-9 items-center rounded-full px-3 text-sm text-ink-subtle transition-colors hover:text-ink"
            >
              {t("cancel")}
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setArmed(true)}
            className={`${ghost} text-error`}
          >
            {t("delete")}
          </button>
        )}
      </div>

      {armed ? (
        <p className="text-xs text-warning">{t("deleteWarning")}</p>
      ) : null}

      <div role="status">
        {state && "ok" in state ? (
          <p className="text-xs text-success">{t("done")}</p>
        ) : null}
      </div>
      {state && "errorKey" in state ? (
        <p role="alert" className="text-xs text-error">
          {t(`errors.${state.errorKey}`)}
        </p>
      ) : null}
    </form>
  );
}
