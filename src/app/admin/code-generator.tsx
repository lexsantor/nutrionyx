"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateCodeAction, revokeCode, type CodeFormState } from "./actions";

function RevokeSubmit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-8 items-center rounded-full border border-hairline px-3 text-xs font-medium text-error transition-[transform,background-color,border-color] hover:bg-error-soft active:scale-[0.97] active:duration-150 disabled:opacity-60"
    >
      {label}
    </button>
  );
}

// Two-step confirm (house pattern, no native dialogs): first click arms,
// second click submits.
function RevokeButton({ code }: { code: string }) {
  const t = useTranslations("admin.codes");
  const [arming, setArming] = useState(false);
  if (!arming) {
    return (
      <button
        type="button"
        onClick={() => setArming(true)}
        className="inline-flex h-8 items-center rounded-full border border-hairline px-3 text-xs font-medium text-error transition-[transform,background-color,border-color] hover:bg-error-soft active:scale-[0.97] active:duration-150"
      >
        {t("revoke")}
      </button>
    );
  }
  return (
    <form action={revokeCode} className="inline-flex items-center gap-1.5">
      <input type="hidden" name="code" value={code} />
      <RevokeSubmit label={t("confirmRevoke")} />
      <button
        type="button"
        onClick={() => setArming(false)}
        className="inline-flex h-8 items-center rounded-full px-2 text-xs text-ink-subtle transition-colors hover:text-ink"
      >
        {t("cancelRevoke")}
      </button>
    </form>
  );
}

type CodeRow = {
  code: string;
  note: string | null;
  used: boolean;
  createdAt: string;
};

export function CodeGenerator({ codes }: { codes: CodeRow[] }) {
  const t = useTranslations("admin.codes");
  const [state, formAction, isPending] = useActionState<CodeFormState, FormData>(
    generateCodeAction,
    null,
  );

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="note" className="text-sm font-medium">
            {t("note")}
          </label>
          <Input
            id="note"
            name="note"
            type="text"
            maxLength={80}
            placeholder={t("notePlaceholder")}
          />
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? t("generating") : t("generate")}
        </Button>
      </form>

      <div role="status">
        {state && "ok" in state ? (
          <p
          className="rounded-[10px] bg-success-soft px-3 py-2 text-sm text-success"
        >
          {t("generated")}{" "}
          <code className="font-mono font-semibold">{state.code}</code>
        </p>
        ) : null}
        </div>
      {state && "errorKey" in state ? (
        <p
          role="alert"
          className="rounded-[10px] bg-error-soft px-3 py-2 text-sm text-error"
        >
          {t(`errors.${state.errorKey}`)}
        </p>
      ) : null}

      {codes.length > 0 ? (
        <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-hairline text-ink-subtle">
              <th scope="col" className="py-2 pr-4 font-medium">
                {t("code")}
              </th>
              <th scope="col" className="py-2 pr-4 font-medium">
                {t("noteCol")}
              </th>
              <th scope="col" className="py-2 pr-4 font-medium">
                {t("status")}
              </th>
              <th scope="col" className="py-2 font-medium">
                {t("actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {codes.map((c) => (
              <tr key={c.code} className="border-b border-hairline">
                <td className="py-2 pr-4 font-mono">{c.code}</td>
                <td className="py-2 pr-4">{c.note ?? "—"}</td>
                <td className="py-2 pr-4">
                  <span
                    className={
                      c.used
                        ? "rounded-full bg-surface-3 px-2 py-0.5 text-xs font-medium text-ink-muted"
                        : "rounded-full bg-success-soft px-2 py-0.5 text-xs font-medium text-success"
                    }
                  >
                    {c.used ? t("statuses.used") : t("statuses.pending")}
                  </span>
                </td>
                <td className="py-2">
                  {!c.used ? <RevokeButton code={c.code} /> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      ) : null}
    </div>
  );
}
