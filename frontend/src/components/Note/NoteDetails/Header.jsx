import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiEdit3,
  FiMoreVertical,
  FiShare2,
  FiTrash2,
} from "react-icons/fi";

const Header = ({
  noteTitle,
  deleting,
  canDelete,
  canEdit,
  canShare,
  onRequestDelete,
  onEdit,
  onShare,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/notes"
            aria-label="Back to Notes"
            title="Back to Notes"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <FiArrowLeft />
          </Link>
          <nav
            aria-label="Breadcrumb"
            className="flex min-w-0 items-center gap-2 text-sm"
          >
            <Link
              to="/notes"
              className="shrink-0 text-slate-500 transition hover:text-slate-900"
            >
              Notes
            </Link>
            <span aria-hidden="true" className="text-slate-300">
              /
            </span>
            <span className="truncate font-medium text-slate-800">
              {noteTitle || "Note"}
            </span>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {canEdit && (
            <button
              type="button"
              aria-label="Edit note"
              title="Edit note"
              onClick={onEdit}
              className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 sm:px-3"
            >
              <FiEdit3 />
              <span className="hidden sm:inline">Edit</span>
            </button>
          )}

          {canDelete && (
            <button
              type="button"
              aria-label="Delete note"
              title="Delete note"
              disabled={deleting}
              onClick={onRequestDelete}
              className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 sm:px-3"
            >
              <FiTrash2 />
              <span className="hidden sm:inline">Delete</span>
            </button>
          )}

          {canShare && (
            <details className="group relative">
              <summary
                aria-label="More note options"
                title="More options"
                className="grid h-9 w-9 cursor-pointer list-none place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 [&::-webkit-details-marker]:hidden"
              >
                <FiMoreVertical />
              </summary>
              <div className="absolute right-0 top-full z-30 mt-2 w-48 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                <button
                  type="button"
                  onClick={(event) => {
                    event.currentTarget.closest("details").open = false;
                    onShare();
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <FiShare2 /> Share and collaborate
                </button>
              </div>
            </details>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
