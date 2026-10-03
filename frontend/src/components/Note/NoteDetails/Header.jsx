import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiEdit3, FiShare2, FiTrash2 } from "react-icons/fi";

const Header = ({
  deleting,
  canDelete,
  handleDeleteNote,
  canEdit,
  canShare,
  onEdit,
  onShare,
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="back-button inline-flex items-center gap-2  px-3 py-2 text-sm cursor-pointer font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 "
        >
          <FiArrowLeft />
          Back to Notes
        </button>

        <div className="flex items-center gap-2">
          {canShare && (
            <button
              type="button"
              onClick={onShare}
              className="inline-flex cursor-pointer items-center gap-2  border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
            >
              <FiShare2 />
              <span className="hidden sm:inline">Share</span>
            </button>
          )}

          {canEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex cursor-pointer items-center gap-2  border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
            >
              <FiEdit3 />
              <span className="hidden sm:inline">Edit</span>
            </button>
          )}

          {canDelete && (
            <button
              type="button"
              disabled={deleting}
              onClick={() => handleDeleteNote(id)}
              className="inline-flex cursor-pointer items-center gap-2  border border-red-200 bg-white px-3.5 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed"
            >
              <FiTrash2 />
              <span className="hidden sm:inline">Delete</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
