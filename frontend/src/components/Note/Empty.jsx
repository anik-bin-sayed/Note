import { FiBookOpen, FiPlus } from "react-icons/fi";

const Empty = ({ search, setShowAddModal }) => {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <FiBookOpen className="text-2xl" />
      </div>

      <h3 className="text-lg font-bold text-slate-900">
        {search ? "No entries found" : "Your Note is empty"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {search
          ? "Try searching with another keyword."
          : "Create your first entry and start building your personal knowledge base."}
      </p>

      {!search && (
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          <FiPlus />
          Create First Entry
        </button>
      )}
    </div>
  );
};
export default Empty;
