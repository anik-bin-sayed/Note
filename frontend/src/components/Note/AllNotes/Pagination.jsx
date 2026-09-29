import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const Pagination = ({ totalPages, page, setPage }) => {
  return (
    <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row">
      <p className="text-sm text-slate-500">
        Page <span className="font-semibold text-slate-900">{page}</span> of{" "}
        <span className="font-semibold text-slate-900">{totalPages}</span>
      </p>

      <div className="flex items-center gap-2">
        {/* Previous */}
        <button
          type="button"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FiChevronLeft />
          Previous
        </button>

        {/* Page Numbers */}
        <div className="hidden items-center gap-1 sm:flex">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setPage(pageNumber)}
                className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-sm font-semibold transition ${
                  page === pageNumber
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                {pageNumber}
              </button>
            ),
          )}
        </div>

        {/* Next */}
        <button
          type="button"
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
