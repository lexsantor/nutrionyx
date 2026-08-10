export default function Loading() {
  return (
    <main
      aria-busy="true"
      className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-6 py-10"
    >
      <span className="sr-only">Cargando…</span>
      <div className="h-8 w-56 animate-pulse rounded-full bg-surface-3" />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="h-44 animate-pulse rounded-xl bg-surface-3 lg:col-span-8" />
        <div className="h-44 animate-pulse rounded-xl bg-surface-3 lg:col-span-4" />
        <div className="h-64 animate-pulse rounded-xl bg-surface-3 lg:col-span-8" />
        <div className="h-64 animate-pulse rounded-xl bg-surface-3 lg:col-span-4" />
      </div>
    </main>
  );
}
