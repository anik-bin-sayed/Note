import { FiCalendar, FiClock } from "react-icons/fi";

const formatDate = (value) => {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Unknown";
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const MetaInfo = ({ note, readingMinutes }) => {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 sm:gap-x-5">
      <div className="inline-flex items-center gap-1.5">
        <FiCalendar aria-hidden="true" className="text-slate-400" />
        <span>Created {formatDate(note?.created_at)}</span>
      </div>
      <div className="inline-flex items-center gap-1.5">
        <FiClock aria-hidden="true" className="text-slate-400" />
        <span>Updated {formatDate(note?.updated_at)}</span>
      </div>
      <span className="hidden text-slate-300 sm:inline" aria-hidden="true">
        ·
      </span>
      <span>{readingMinutes} min read</span>
    </div>
  );
};

export default MetaInfo;
