"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import {
  deleteDocumentAction,
  type DocumentDeleteState,
} from "./actions";

function DeleteDocButton({ documentId }: { documentId: string }) {
  const t = useTranslations("documents");
  const [, formAction, isPending] = useActionState<
    DocumentDeleteState,
    FormData
  >(deleteDocumentAction, null);
  return (
    <form action={formAction}>
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
  uploadError,
}: {
  patientId: string;
  documents: { id: string; fileName: string; createdAt: string }[];
  uploadError: boolean;
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

      <form
        action="/api/documents"
        method="post"
        encType="multipart/form-data"
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
      >
        <input type="hidden" name="patientId" value={patientId} />
        <input
          type="file"
          name="document"
          required
          accept="application/pdf,image/jpeg,image/png,image/webp"
          className="block w-full rounded-[10px] border border-hairline bg-surface-2 px-3.5 py-2.5 text-sm text-ink file:mr-3 file:rounded-full file:border-0 file:bg-surface-3 file:px-3 file:py-1 file:text-sm file:font-medium file:text-ink"
        />
        <button
          type="submit"
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-full border border-hairline bg-surface-1 px-5 text-sm font-semibold text-ink transition-colors hover:border-hairline-strong hover:bg-surface-2 active:scale-[0.97]"
        >
          {t("upload")}
        </button>
      </form>
      {uploadError ? (
        <p
          role="alert"
          className="rounded-[10px] bg-error-soft px-3 py-2 text-sm text-error"
        >
          {t("uploadError")}
        </p>
      ) : null}
    </div>
  );
}
