const LoadingNoteDetails = () => {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      {/* Header Skeleton */}
      <div className="border-b border-slate-100 px-6 py-7 sm:px-8 sm:py-8">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="h-14 w-14 shrink-0 animate-pulse rounded-2xl bg-slate-200" />

          <div className="flex-1">
            {/* Category */}
            <div className="mb-3 h-5 w-32 animate-pulse rounded-full bg-slate-200" />

            {/* Title */}
            <div className="h-8 w-3/4 animate-pulse rounded-lg bg-slate-200 sm:h-9" />

            {/* Subtitle */}
            <div className="mt-3 h-4 w-48 animate-pulse rounded bg-slate-100" />
          </div>
        </div>

        {/* Meta */}
        <div className="mt-6 flex flex-wrap gap-6 border-t border-slate-100 pt-5">
          <div className="h-4 w-36 animate-pulse rounded bg-slate-100" />

          <div className="h-4 w-36 animate-pulse rounded bg-slate-100" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="px-6 py-8 sm:px-8 sm:py-10">
        <div className="space-y-4">
          <div className="h-4 w-full animate-pulse rounded bg-slate-200" />

          <div className="h-4 w-full animate-pulse rounded bg-slate-200" />

          <div className="h-4 w-11/12 animate-pulse rounded bg-slate-200" />

          <div className="pt-3">
            <div className="h-4 w-8/12 animate-pulse rounded bg-slate-200" />

            <div className="mt-4 h-4 w-11/12 animate-pulse rounded bg-slate-200" />

            <div className="mt-4 h-4 w-7/12 animate-pulse rounded bg-slate-200" />
          </div>
        </div>
      </div>

      {/* Footer Skeleton */}
      <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-5 sm:px-8">
        <div className="flex items-center justify-between">
          <div className="h-4 w-56 animate-pulse rounded bg-slate-200" />

          <div className="h-5 w-20 animate-pulse rounded bg-slate-200" />
        </div>
      </div>
    </div>
  );
};

export default LoadingNoteDetails;
