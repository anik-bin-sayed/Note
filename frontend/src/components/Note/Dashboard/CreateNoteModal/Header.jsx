import { FiBookOpen, FiX } from "react-icons/fi";

const Header = ({ handleClose, isLoading }) => {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
          <FiBookOpen className="text-xl" />
        </div>

        <div className="min-w-0">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            Add New Entry
          </h2>

          <p className="mt-0.5 text-xs text-slate-500">
            Add something to your personal knowledge space.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleClose}
        disabled={isLoading}
        aria-label="Close modal"
        className="ml-3 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <FiX className="text-xl" />
      </button>
    </div>
  );
};

export default Header;
