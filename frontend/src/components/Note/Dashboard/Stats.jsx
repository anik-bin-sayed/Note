import { Link } from "react-router-dom";

const Stats = ({ entries, search }) => {
  return (
    <div className="mb-5 flex items-end justify-between">
      <div className="flex w-full justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Your Entries</h3>

          <p className="mt-1 text-sm text-slate-500">
            {search ? (
              <>
                Showing {entries.length} of {entries.length}{" "}
                {entries.length === 1 ? "entry" : "entries"}
              </>
            ) : (
              <>
                {entries?.length} {entries?.length === 1 ? "entry" : "entries"}{" "}
                in your dictionary
              </>
            )}
          </p>
        </div>
        <div>
          <Link
            to="/notes"
            className="cursor-pointer rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 hover:underline"
          >
            Show More
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Stats;
