const Loader = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="flex flex-col items-center">
        {/* Spinner */}
        <div className="relative flex h-14 w-14 items-center justify-center">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20" />
        </div>

        {/* Loading text */}
        <h2 className="mt-5 text-base font-semibold tracking-wide text-slate-800">
          Loading
        </h2>

        {/* Dots */}
        <div className="mt-2 flex items-center gap-1">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500 [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-purple-500 [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-pink-500" />
        </div>
      </div>
    </div>
  );
};

export default Loader;
