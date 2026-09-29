const LoadingNote = () => {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div
          key={item}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          {/* Header skeleton */}
          <div className="mb-5 flex items-start gap-3">
            <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-slate-200" />

            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded-md bg-slate-200" />
              <div className="h-3 w-1/2 animate-pulse rounded-md bg-slate-100" />
            </div>

            <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-100" />
          </div>

          {/* Text skeleton */}
          <div className="space-y-2">
            <div className="h-3 w-full animate-pulse rounded-md bg-slate-100" />
            <div className="h-3 w-full animate-pulse rounded-md bg-slate-100" />
            <div className="h-3 w-5/6 animate-pulse rounded-md bg-slate-100" />
            <div className="h-3 w-2/3 animate-pulse rounded-md bg-slate-100" />
          </div>

          {/* Footer skeleton */}
          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
            <div className="h-3 w-24 animate-pulse rounded-md bg-slate-100" />
            <div className="h-6 w-12 animate-pulse rounded-full bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingNote;
