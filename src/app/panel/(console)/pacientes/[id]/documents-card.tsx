"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { UploadForm } from "@/components/upload-form";
import {
  deleteDocumentAction,
  type DocumentDeleteState,
} from "./actions";

function DeleteDocButton({ documentId }: { documentId: string }) {
  const t = useTranslations("documents");
  const [state, formAction, isPending] = useActionState<
    DocumentDeleteState,
    FormData
  >(deleteDocumentAction, null);
  return (
    <form action={formAction} className="relative">
      {state?.errorKey ? (
        <p
          role="alert"
          className="absolute right-0 top-9 z-10 w-44 rounded-[10px] bg-error-soft px-2 py-1 text-xs text-error shadow-el-sm"
        >
          {t("deleteError")}
        </p>
      ) : null}
      <input type="hidden" name="documentId" value={documentId} />
      <button
        type="submit"
        disabled={isPending}
        aria-label={t("delete")}
        className="flex size-8 items-center justify-center rounded-full text-ink-subtle transition-colors hover:bg-surface-3 hover:text-error"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      </button>
    </form>
  );
}

export function DocumentsCard({
  patientId,
  documents,
}: {
  patientId: string;
  documents: { id: string; fileName: string; createdAt: string }[];
}) {
  const t = useTranslations("documents");

  return (
    <div className="flex flex-col gap-4">
      {documents.length > 0 ? (
        <ul className="flex flex-col">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center justify-between gap-3 border-b border-hairline py-2 last:border-0"
            >
              <a
                href={`/api/documents/${doc.id}`}
                target="_blank"
                rel="noreferrer"
                className="min-w-0 flex-1 truncate text-sm font-medium text-ink no-underline transition-colors hover:text-accent-text"
              >
                {doc.fileName}
              </a>
              <span className="shrink-0 text-xs text-ink-subtle">
                {doc.createdAt}
              </span>
              <DeleteDocButton documentId={doc.id} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-subtle">{t("empty")}</p>
      )}

      <UploadForm
        action="/api/documents"
        fieldName="document"
        accept="application/pdf,image/jpeg,image/png,image/webp"
        hidden={{ patientId }}
        labels={{
          file: t("fileLabel"),
          upload: t("upload"),
          uploading: t("uploading"),
          error: t("uploadError"),
        }}
      />
    </div>
  );
}
