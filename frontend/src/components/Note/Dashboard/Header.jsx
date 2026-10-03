import { FiBookOpen, FiPlus } from "react-icons/fi";

const Header = ({ user, setShowAddModal }) => {
  return (
    <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
          <FiBookOpen className="text-slate-500" />
          Personal Knowledge Base
        </div>

        <p className="mb-1 text-sm font-medium text-slate-500">Welcome back</p>

        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {user?.name || "Your Notes"}
        </h2>

        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
          Store words, concepts, definitions and anything you want to remember.
        </p>
      </div>

      <button
        type="button"
        onClick={() => {
          setShowAddModal(true);
        }}
        className="flex cursor-pointer items-center justify-center gap-2 rounded bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98]"
      >
        <FiPlus className="text-lg" />
        Add Entry
      </button>
    </div>
  );
};

export default Header;
