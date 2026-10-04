const LoadingNoteDetails = () => {
  return (
    <div className="mx-auto max-w-4xl animate-pulse py-3">
      <div className="mb-12 flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-slate-100" />
        <div className="h-3 w-48 rounded bg-slate-100" />
      </div>
      <div className="border-b border-slate-100 pb-8">
        <div className="h-6 w-36 rounded-full bg-slate-100" />
        <div className="mt-6 h-10 w-11/12 rounded-lg bg-slate-200 sm:h-12" />
        <div className="mt-3 h-10 w-2/3 rounded-lg bg-slate-200 sm:h-12" />
        <div className="mt-6 flex flex-wrap gap-4">
          <div className="h-3 w-32 rounded bg-slate-100" />
          <div className="h-3 w-32 rounded bg-slate-100" />
          <div className="h-3 w-20 rounded bg-slate-100" />
        </div>
      </div>
      <div className="space-y-4 py-9">
        <div className="h-4 w-full rounded bg-slate-100" />
        <div className="h-4 w-full rounded bg-slate-100" />
        <div className="h-4 w-10/12 rounded bg-slate-100" />
        <div className="pt-5">
          <div className="h-7 w-1/2 rounded bg-slate-200" />
        </div>
        <div className="h-4 w-full rounded bg-slate-100" />
        <div className="h-4 w-11/12 rounded bg-slate-100" />
        <div className="h-4 w-8/12 rounded bg-slate-100" />
      </div>
    </div>
  );
};

export default LoadingNoteDetails;
