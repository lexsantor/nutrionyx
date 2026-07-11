"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateCodeAction, revokeCode, type CodeFormState } from "./actions";

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

      {state && "ok" in state ? (
        <p
          role="status"
          className="rounded-[10px] bg-success-soft px-3 py-2 text-sm text-success"
        >
          {t("generated")}{" "}
          <code className="font-mono font-semibold">{state.code}</code>
        </p>
      ) : null}
      {state && "errorKey" in state ? (
        <p
          role="alert"
          className="rounded-[10px] bg-error-soft px-3 py-2 text-sm text-error"
        >
          {t(`errors.${state.errorKey}`)}
        </p>
      ) : null}

      {codes.length > 0 ? (
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
                        ? "rounded-full bg-surface-3 px-2 py-0.5 text-xs font-medium text-ink-subtle"
                        : "rounded-full bg-success-soft px-2 py-0.5 text-xs font-medium text-success"
                    }
                  >
                    {c.used ? t("statuses.used") : t("statuses.pending")}
                  </span>
                </td>
                <td className="py-2">
                  {!c.used ? (
                    <form action={revokeCode}>
                      <input type="hidden" name="code" value={c.code} />
                      <button
                        type="submit"
                        className="rounded-full border border-hairline px-3 py-0.5 text-xs font-medium text-error transition-colors hover:bg-error-soft"
                      >
                        {t("revoke")}
                      </button>
                    </form>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </div>
  );
}
