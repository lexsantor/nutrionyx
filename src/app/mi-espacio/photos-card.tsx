"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { deletePhotoAction, type PhotoDeleteState } from "./actions";
import { UploadForm } from "@/components/upload-form";

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
        className="flex size-9 items-center justify-center rounded-full bg-canvas/80 text-ink-subtle backdrop-blur transition-colors hover:text-error"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      </button>
    </form>
  );
}

export function PhotosCard({
  photos,
}: {
  photos: { id: string; createdAt: string }[];
}) {
  const t = useTranslations("photos");

  return (
    <section className="flex h-full flex-col gap-4 rounded-xl border border-hairline bg-surface-1 p-6 shadow-el-sm transition-[transform,box-shadow,border-color,background-color,color] duration-500 ease-house hover:-translate-y-0.5 hover:shadow-el-md">
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

      <UploadForm
        action="/api/me/photos"
        fieldName="photo"
        accept="image/jpeg,image/png,image/webp"
        labels={{
          file: t("fileLabel"),
          upload: t("upload"),
          uploading: t("uploading"),
          error: t("uploadError"),
        }}
      />
    </section>
  );
}
