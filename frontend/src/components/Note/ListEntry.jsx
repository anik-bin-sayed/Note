// react router
import { Link } from "react-router-dom";

// react icons
import { FiBookOpen, FiEdit3, FiTrash2 } from "react-icons/fi";

import DOMPurify from "dompurify";

const ListEntry = ({ entries, handleDeleteNote, deleting }) => {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {entries.map((entry) => (
        <article
          key={entry.id}
          className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
        >
          {/* Top */}
          <div className="mb-4 flex items-start justify-between gap-4">
            {entry.decryption_error ? (
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <FiBookOpen />
                </div>

                <div className="min-w-0">
                  <h4 className="line-clamp-2 text-base font-bold leading-6 text-slate-900">
                    {entry.title}
                  </h4>
                </div>
              </div>
            ) : (
              <Link to={`/notes/${entry.id}`}>
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <FiBookOpen />
                  </div>

                  <div className="min-w-0">
                    <h4 className="line-clamp-2 text-base font-bold leading-6 text-slate-900">
                      {entry.title}
                    </h4>
                  </div>
                </div>
              </Link>
            )}
            <div className="flex items-center gap-1">
              {entry.role === "owner" && (
                <button
                  type="button"
                  aria-label={`Delete ${entry.title}`}
                  onClick={() => handleDeleteNote(entry?.id)}
                  disabled={deleting}
                  className="
      shrink-0 cursor-pointer rounded-lg p-2
      text-slate-400 transition
      hover:bg-red-50 hover:text-red-500
      lg:opacity-0 lg:group-hover:opacity-100
      disabled:cursor-not-allowed
    "
                >
                  <FiTrash2 />
                </button>
              )}

              {!entry.decryption_error && (
                <button
                  type="button"
                  aria-label={`Edit ${entry.title}`}
                  disabled={deleting}
                  className="
      shrink-0 cursor-pointer rounded-lg p-2
      text-slate-400 transition
      hover:bg-blue-50 hover:text-blue-500
      lg:opacity-0 lg:group-hover:opacity-100
      disabled:cursor-not-allowed
    "
                >
                  <FiEdit3 />
                </button>
              )}
            </div>
          </div>
          {entry.decryption_error ? (
            <div
              className="line-clamp-6 whitespace-pre-wrap text-sm leading-6 text-slate-600"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(entry.text),
              }}
            />
          ) : (
            <Link to={`/notes/${entry.id}`}>
              <div
                className="line-clamp-6 whitespace-pre-wrap text-sm leading-6 text-slate-600"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(entry.text),
                }}
              />
            </Link>
          )}

          {/* Footer */}
          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-400">
              Updated{" "}
              {entry.updated_at
                ? new Date(entry.updated_at).toLocaleDateString()
                : "Recently"}
            </p>

            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
              {entry.role === "owner" ? "Note" : `Shared · ${entry.role}`}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
};

export default ListEntry;
