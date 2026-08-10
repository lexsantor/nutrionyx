"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { deletePhotoAction, type PhotoDeleteState } from "./actions";

function DeleteButton({ photoId }: { photoId: string }) {
  const t = useTranslations("photos");
  const [state, formAction, isPending] = useActionState<
    PhotoDeleteState,
    FormData
  >(deletePhotoAction, null);
  return (
    <form action={formAction} className="absolute right-1.5 top-1.5">
      {state?.errorKey ? (
        <p
          role="alert"
          className="absolute right-0 top-9 w-40 rounded-[10px] bg-error-soft px-2 py-1 text-xs text-error shadow-el-sm"
        >
          {t("deleteError")}
        </p>
      ) : null}
      <input type="hidden" name="photoId" value={photoId} />
      <button
        type="submit"
        disabled={isPending}
        aria-label={t("delete")}
        className="flex size-7 items-center justify-center rounded-full bg-canvas/80 text-ink-subtle backdrop-blur transition-colors hover:text-error"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      </button>
    </form>
  );
}

export function PhotosCard({
  photos,
  uploadError,
}: {
  photos: { id: string; createdAt: string }[];
  uploadError: boolean;
}) {
  const t = useTranslations("photos");

  return (
    <section className="flex h-full flex-col gap-4 rounded-xl border border-hairline bg-surface-1 p-6 shadow-el-sm transition-[transform,box-shadow,border-color,background-color,color] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:shadow-el-md">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-lg font-semibold">{t("title")}</h2>
        <p className="text-sm text-ink-subtle">{t("privacy")}</p>
      </div>

      {photos.length > 0 ? (
        <ul className="grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <li
              key={photo.id}
              className="relative aspect-[3/4] overflow-hidden rounded-[10px] border border-field-border bg-surface-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/photos/${photo.id}`}
                width={600}
                height={800}
                alt={t("photoAlt", { date: photo.createdAt })}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <DeleteButton photoId={photo.id} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-subtle">{t("empty")}</p>
      )}

      <form
        action="/api/me/photos"
        method="post"
        encType="multipart/form-data"
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
      >
        <input
          type="file"
          name="photo"
          required
          accept="image/jpeg,image/png,image/webp"
          className="block w-full rounded-[10px] border border-field-border bg-surface-2 px-3.5 py-2.5 text-sm text-ink file:mr-3 file:rounded-full file:border-0 file:bg-surface-3 file:px-3 file:py-1 file:text-sm file:font-medium file:text-ink"
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
    </section>
  );
}
