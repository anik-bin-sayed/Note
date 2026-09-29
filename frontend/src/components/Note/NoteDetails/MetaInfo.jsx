import { FiCalendar, FiClock } from "react-icons/fi";

const MetaInfo = ({ note }) => {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-slate-100 pt-5">
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <FiCalendar className="text-slate-400" />

        <span>
          Created{" "}
          {new Date(note?.created_at).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-400">
        <FiClock className="text-slate-400" />

        <span>
          Updated{" "}
          {new Date(note?.updated_at).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>
    </div>
  );
};

export default MetaInfo;
