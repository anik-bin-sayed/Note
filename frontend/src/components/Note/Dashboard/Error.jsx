import { FiRefreshCw } from "react-icons/fi";

const Error = ({ error, fetchEntries }) => {
  return (
    <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium text-red-600">{error}</p>

      <button
        type="button"
        onClick={fetchEntries}
        className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
      >
        <FiRefreshCw />
        Try Again
      </button>
    </div>
  );
};

export default Error;
