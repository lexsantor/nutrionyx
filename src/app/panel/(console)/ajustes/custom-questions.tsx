"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CUSTOM_PROMPT_MAX,
  MAX_CUSTOM_QUESTIONS,
} from "@/modules/assessment/definition";
import {
  addQuestionAction,
  removeQuestionAction,
  type QuestionsFormState,
} from "./actions";

/**
 * The consulta's own assessment questions. Add and retire only: the wording is
 * write-once, because editing it would silently re-label every answer already
 * given under the old phrasing.
 */
export function CustomQuestions({
  questions,
}: {
  questions: { id: string; prompt: string }[];
}) {
  const t = useTranslations("settings.questions");
  const [state, formAction, isPending] = useActionState<
    QuestionsFormState,
    FormData
  >(addQuestionAction, null);
  const full = questions.length >= MAX_CUSTOM_QUESTIONS;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">{t("title")}</h2>
        <p className="text-sm text-ink-subtle">{t("hint")}</p>
      </div>

      {questions.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {questions.map((question, index) => (
            <li
              key={question.id}
              className="flex items-start justify-between gap-3 rounded-[10px] border border-hairline bg-surface-2 px-3 py-2.5"
            >
              <span className="flex min-w-0 items-baseline gap-2 text-sm">
                <span className="shrink-0 tabular-nums text-ink-subtle">
                  {index + 1}.
                </span>
                <span className="min-w-0 break-words">{question.prompt}</span>
              </span>
              <form action={removeQuestionAction} className="shrink-0">
                <input type="hidden" name="questionId" value={question.id} />
                <button
                  type="submit"
                  className="rounded-full px-2 py-0.5 text-xs font-medium text-ink-subtle transition-colors hover:bg-surface-3 hover:text-error"
                >
                  {t("remove")}
                </button>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-subtle">{t("empty")}</p>
      )}

      <form action={formAction} className="flex flex-col gap-2">
        <label htmlFor="prompt" className="text-sm font-medium">
          {t("addLabel")}
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            id="prompt"
            name="prompt"
            type="text"
            maxLength={CUSTOM_PROMPT_MAX}
            required
            disabled={full}
            placeholder={t("addPlaceholder")}
            className="min-w-0 flex-1"
          />
          <Button
            type="submit"
            variant="secondary"
            disabled={isPending || full}
          >
            {isPending ? t("adding") : t("add")}
          </Button>
        </div>
        {full ? (
          <p className="text-xs text-ink-subtle">
            {t("full", { max: MAX_CUSTOM_QUESTIONS })}
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
      </form>
    </div>
  );
}
