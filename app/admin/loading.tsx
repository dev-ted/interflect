export default function AdminLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-5 dark:border-zinc-800">
        <div className="space-y-2.5">
          <div className="h-5 w-36 animate-pulse rounded-full bg-zinc-100 dark:bg-zinc-900" />
          <div className="h-8 w-72 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900" />
          <div className="h-4 w-96 max-w-full animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />
        </div>
        <div className="h-9 w-32 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 lg:col-span-4 xl:col-span-3 dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="flex items-center justify-between">
            <div className="h-4 w-20 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
            <div className="h-7 w-24 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
          </div>
          {Array.from({ length: 4 }, (_, idx) => (
            <div
              key={`admin-course-load-${idx}`}
              className="h-20 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800"
            />
          ))}
        </div>

        <div className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-6 lg:col-span-8 xl:col-span-9 dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="h-8 w-1/2 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
          <div className="flex gap-2">
            <div className="h-8 w-24 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
            <div className="h-8 w-32 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, idx) => (
              <div
                key={`admin-panel-load-${idx}`}
                className="h-28 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
