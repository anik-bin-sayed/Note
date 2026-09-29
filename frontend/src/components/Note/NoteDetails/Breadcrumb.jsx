import { Link } from "react-router-dom";

const Breadcrumb = ({ note }) => {
  return (
    <div className="mb-6 flex items-center gap-2 text-xs text-slate-400">
      <Link to="/notes" className="transition hover:text-slate-700">
        Notes
      </Link>

      <span>/</span>

      <span className="max-w-45 truncate text-slate-500">{note?.title}</span>
    </div>
  );
};

export default Breadcrumb;
