export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="h-10 w-56 animate-pulse rounded-xl border-2 border-[#18181B]/20 bg-[#F6EFE0] dark:border-[#323244] dark:bg-[#16161F]" />
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={`stat-load-${i}`}
            className="h-28 animate-pulse rounded-2xl border-2 border-[#18181B]/20 bg-[#F6EFE0] dark:border-[#323244] dark:bg-[#16161F]"
          />
        ))}
      </div>
    </div>
  );
}
