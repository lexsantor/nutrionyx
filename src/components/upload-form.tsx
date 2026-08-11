"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

/**
 * Fetch-based multipart uploader for the blob route handlers (which exist
 * to escape the server-action body limit): pending state, double-submit
 * guard, inline error and a soft refresh instead of a full page reload.
 */
export function UploadForm({
  action,
  fieldName,
  accept,
  hidden = {},
  labels,
}: {
  action: string;
  fieldName: string;
  accept: string;
  hidden?: Record<string, string>;
  labels: { file: string; upload: string; uploading: string; error: string };
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const body = new FormData(event.currentTarget);
    setFailed(false);
    setPending(true);
    try {
      const res = await fetch(action, { method: "POST", body });
      if (!res.ok) throw new Error(String(res.status));
      formRef.current?.reset();
      router.refresh();
    } catch {
      setFailed(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="flex flex-col gap-2"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {Object.entries(hidden).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
        <input
          type="file"
          name={fieldName}
          required
          accept={accept}
          aria-label={labels.file}
          disabled={pending}
          className="block w-full rounded-[10px] border border-field-border bg-surface-2 px-3.5 py-2.5 text-sm text-ink file:mr-3 file:rounded-full file:border-0 file:bg-surface-3 file:px-3 file:py-1 file:text-sm file:font-medium file:text-ink disabled:opacity-60"
        />
        <Button
          type="submit"
          variant="secondary"
          disabled={pending}
          className="shrink-0"
        >
          {pending ? labels.uploading : labels.upload}
        </Button>
      </div>
      <div aria-live="polite">
        {failed ? (
          <p
            role="alert"
            className="rounded-[10px] bg-error-soft px-3 py-2 text-sm text-error"
          >
            {labels.error}
          </p>
        ) : null}
      </div>
    </form>
  );
}
