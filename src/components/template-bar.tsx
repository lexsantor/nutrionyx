"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";

/** Shared by the diet and training editors; both cap names the same. */
export const TEMPLATE_NAME_MAX = 80;

export type TemplateFormState =
  | { errorKey: string }
  | { ok: true; kind: "saved" | "loaded" }
  | null;

/**
 * Template controls for the week editor (slice-21B). Both live inside the
 * editor's own <form>, so "save as template" posts the week the
 * specialist is looking at rather than the last persisted one.
 *
 * The two buttons use formAction to target different server actions from
 * that single form. Loading overwrites the stored plan, so it arms first.
 */
export function TemplateBar({
  namespace,
  templates,
  saveAction,
  loadAction,
}: {
  /** "diet.templates" | "training.templates" - same keys either side. */
  namespace: string;
  templates: { id: string; name: string }[];
  saveAction: (
    state: TemplateFormState,
    formData: FormData,
  ) => Promise<TemplateFormState>;
  loadAction: (
    state: TemplateFormState,
    formData: FormData,
  ) => Promise<TemplateFormState>;
}) {
  const t = useTranslations(namespace);
  const [saveState, saveFormAction, savePending] = useActionState<
    TemplateFormState,
    FormData
  >(saveAction, null);
  const [loadState, loadFormAction, loadPending] = useActionState<
    TemplateFormState,
    FormData
  >(loadAction, null);
  const [selected, setSelected] = useState("");
  const [armed, setArmed] = useState(false);

  const state = saveState ?? loadState;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-hairline bg-surface-2 p-4">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-sm font-semibold">{t("title")}</h2>
        <p className="text-xs text-ink-subtle">{t("hint")}</p>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="flex items-end gap-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="templateName" className="text-xs font-medium">
              {t("nameLabel")}
            </label>
            <input
              id="templateName"
              name="templateName"
              type="text"
              maxLength={TEMPLATE_NAME_MAX}
              placeholder={t("namePlaceholder")}
              className="h-9 w-56 rounded-full border border-field-border bg-surface-1 px-3.5 text-sm text-ink placeholder:text-ink-subtle"
            />
          </div>
          <button
            type="submit"
            formAction={saveFormAction}
            disabled={savePending}
            className="inline-flex h-9 items-center rounded-full border border-hairline bg-surface-1 px-4 text-sm font-semibold text-ink transition-[transform,background-color,border-color] hover:border-hairline-strong hover:bg-surface-2 active:scale-[0.98] active:duration-150 disabled:opacity-60"
          >
            {savePending ? t("saving") : t("save")}
          </button>
        </div>

        {templates.length > 0 ? (
          <div className="flex items-end gap-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="templateId" className="text-xs font-medium">
                {t("loadLabel")}
              </label>
              <select
                id="templateId"
                name="templateId"
                value={selected}
                onChange={(e) => {
                  setSelected(e.target.value);
                  setArmed(false);
                }}
                className="h-9 w-56 rounded-full border border-field-border bg-surface-1 px-3 text-sm text-ink"
              >
                <option value="">{t("loadPlaceholder")}</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
            {armed ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="submit"
                  formAction={loadFormAction}
                  disabled={loadPending}
                  className="inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-semibold text-on-primary transition-[transform,background-color] hover:bg-primary-hover active:scale-[0.98] active:duration-150 disabled:opacity-60"
                >
                  {loadPending ? t("loading") : t("confirmLoad")}
                </button>
                <button
                  type="button"
                  onClick={() => setArmed(false)}
                  className="inline-flex h-9 items-center rounded-full px-3 text-sm text-ink-subtle transition-colors hover:text-ink"
                >
                  {t("cancelLoad")}
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={!selected}
                onClick={() => setArmed(true)}
                className="inline-flex h-9 items-center rounded-full border border-hairline bg-surface-1 px-4 text-sm font-semibold text-ink transition-[transform,background-color,border-color] hover:border-hairline-strong hover:bg-surface-2 active:scale-[0.98] active:duration-150 disabled:opacity-50"
              >
                {t("load")}
              </button>
            )}
          </div>
        ) : null}
      </div>

      {armed ? (
        <p className="text-xs text-warning">{t("overwriteWarning")}</p>
      ) : null}

      <div role="status">
        {state && "ok" in state ? (
          <p className="text-xs text-success">
            {state.kind === "saved" ? t("savedOk") : t("loadedOk")}
          </p>
        ) : null}
      </div>
      {state && "errorKey" in state ? (
        <p role="alert" className="text-xs text-error">
          {t(`errors.${state.errorKey}`)}
        </p>
      ) : null}
    </div>
  );
}
