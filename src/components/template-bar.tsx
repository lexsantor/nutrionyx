"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Select } from "@/components/ui/select";

import { TEMPLATE_NAME_MAX } from "@/modules/templates/constants";

/** What the clicked submit button asks the editor's action to do. */
export type EditorIntent = "save" | "template-save" | "template-load";

/**
 * Template controls for the week editor (slice-21B). They live inside the
 * editor's own <form>, so "save as template" posts the week the specialist
 * is looking at rather than the last persisted one.
 *
 * The three buttons are plain submits carrying name="intent": the editor
 * has ONE action, which reads that value and branches. They used to point
 * at separate actions through formAction, which worked but put two action
 * descriptors in one payload for no benefit.
 *
 * Loading overwrites the stored plan, so it arms first.
 */
export function TemplateBar({
  namespace,
  templates,
  pending,
  message,
}: {
  /** "diet.templates" | "training.templates" - same keys either side. */
  namespace: string;
  templates: { id: string; name: string }[];
  /** The editor's action is in flight; every submit is disabled. */
  pending: boolean;
  /** Rendered under the controls. The editor owns the action state. */
  message: { kind: "ok"; text: string } | { kind: "error"; text: string } | null;
}) {
  const t = useTranslations(namespace);
  const [selected, setSelected] = useState("");
  const [armed, setArmed] = useState(false);

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
            name="intent"
            value="template-save"
            disabled={pending}
            className="inline-flex h-9 items-center rounded-full border border-hairline bg-surface-1 px-4 text-sm font-semibold text-ink transition-[transform,background-color,border-color] hover:border-hairline-strong hover:bg-surface-2 active:scale-[0.98] active:duration-150 disabled:opacity-60"
          >
            {t("save")}
          </button>
        </div>

        {templates.length > 0 ? (
          <div className="flex items-end gap-2">
            <div className="flex w-56 flex-col gap-1">
              <label htmlFor="templateId" className="text-xs font-medium">
                {t("loadLabel")}
              </label>
              <Select
                id="templateId"
                name="templateId"
                value={selected}
                onChange={(e) => {
                  setSelected(e.target.value);
                  setArmed(false);
                }}
                className="h-9 rounded-full bg-surface-1 text-sm"
              >
                <option value="">{t("loadPlaceholder")}</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </Select>
            </div>
            {armed ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="submit"
                  name="intent"
                  value="template-load"
                  disabled={pending}
                  className="inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-semibold text-on-primary transition-[transform,background-color] hover:bg-primary-hover active:scale-[0.98] active:duration-150 disabled:opacity-60"
                >
                  {pending ? t("loading") : t("confirmLoad")}
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
        {message?.kind === "ok" ? (
          <p className="text-xs text-success">{message.text}</p>
        ) : null}
      </div>
      {message?.kind === "error" ? (
        <p role="alert" className="text-xs text-error">
          {message.text}
        </p>
      ) : null}
    </div>
  );
}
