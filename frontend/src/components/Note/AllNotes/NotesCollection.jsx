import DOMPurify from "dompurify";
import { Link } from "react-router-dom";
import {
  FiBookOpen,
  FiExternalLink,
  FiMoreHorizontal,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";

const getRelativeTime = (value) => {
  const timestamp = Date.parse(value || "");
  if (!Number.isFinite(timestamp)) return "Recently";

  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
};

const NotePreview = ({ entry, className = "" }) => (
  <div
    className={`line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-slate-500 ${className}`}
    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(entry.text || "") }}
  />
);

const NoteActions = ({ entry, onDelete, deleting }) => {
  if (entry.decryption_error && entry.role !== "owner") return null;

  return (
    <details className="group relative shrink-0">
      <summary
        aria-label={`More actions for ${entry.title}`}
        title="More actions"
        className="grid h-9 w-9 cursor-pointer list-none place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 [&::-webkit-details-marker]:hidden"
      >
        <FiMoreHorizontal aria-hidden="true" className="text-lg" />
      </summary>
      <div className="absolute right-0 top-full z-20 mt-1 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
        {!entry.decryption_error && (
          <Link
            to={`/notes/${entry.id}`}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <FiExternalLink aria-hidden="true" />
            Open note
          </Link>
        )}
        {entry.role === "owner" && (
          <button
            type="button"
            disabled={deleting}
            onClick={(event) => {
              event.currentTarget.closest("details").open = false;
              onDelete(entry.id);
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiTrash2 aria-hidden="true" />
            Delete
          </button>
        )}
      </div>
    </details>
  );
};

const NoteIdentity = ({ entry, compact = false }) => {
  const content = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        <FiBookOpen aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-slate-900 transition group-hover:text-sky-700">
          {entry.title || "Untitled note"}
        </span>
        <span className="mt-1 block truncate text-xs text-slate-400">
          {entry.role === "owner" ? "Note" : `Shared · ${entry.role}`}
        </span>
        {compact && <NotePreview entry={entry} className="mt-2 sm:hidden" />}
      </span>
    </>
  );

  return entry.decryption_error ? (
    <div className="flex min-w-0 items-center gap-3">{content}</div>
  ) : (
    <Link
      to={`/notes/${entry.id}`}
      className="group flex min-w-0 items-center gap-3"
    >
      {content}
    </Link>
  );
};

const GridSkeleton = () => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {Array.from({ length: 8 }, (_, index) => (
      <div
        key={index}
        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="mb-5 flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-3/4 animate-pulse rounded bg-slate-200" />
            <div className="h-2.5 w-1/3 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-100" />
        </div>
        <div className="space-y-2">
          <div className="h-2.5 w-full animate-pulse rounded bg-slate-100" />
          <div className="h-2.5 w-full animate-pulse rounded bg-slate-100" />
          <div className="h-2.5 w-2/3 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="mt-5 border-t border-slate-100 pt-3">
          <div className="h-2.5 w-1/3 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    ))}
  </div>
);

const ListSkeleton = () => (
  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
    <div className="hidden grid-cols-[minmax(180px,0.9fr)_minmax(0,1.5fr)_120px_44px] border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500 sm:grid">
      <span>Note</span>
      <span>Preview</span>
      <span>Updated</span>
      <span />
    </div>
    {Array.from({ length: 7 }, (_, index) => (
      <div
        key={index}
        className="grid grid-cols-[minmax(0,1fr)_40px] items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-0 sm:grid-cols-[minmax(180px,0.9fr)_minmax(0,1.5fr)_120px_44px]"
      >
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 shrink-0 animate-pulse rounded-lg bg-slate-200" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3 w-3/4 animate-pulse rounded bg-slate-200" />
            <div className="h-2.5 w-1/3 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
        <div className="hidden space-y-2 sm:block">
          <div className="h-2.5 w-full animate-pulse rounded bg-slate-100" />
          <div className="h-2.5 w-2/3 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="hidden h-2.5 w-16 animate-pulse rounded bg-slate-100 sm:block" />
        <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-100" />
      </div>
    ))}
  </div>
);

const NotesCollection = ({
  entries,
  viewMode,
  isLoading,
  isEmpty,
  search,
  onCreateNote,
  onDelete,
  deleting,
}) => {
  if (isLoading) {
    return viewMode === "grid" ? <GridSkeleton /> : <ListSkeleton />;
  }

  if (isEmpty) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center sm:py-14">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
          <FiBookOpen className="text-xl" />
        </span>
        <h3 className="text-base font-bold text-slate-900">
          {search ? "No notes found" : "No notes yet"}
        </h3>
        <p className="mx-auto mt-1.5 max-w-sm text-sm leading-6 text-slate-500">
          {search
            ? "Try another search to find what you are looking for."
            : "Start capturing your ideas and knowledge."}
        </p>
        {!search && (
          <button
            type="button"
            onClick={onCreateNote}
            className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <FiPlus aria-hidden="true" />
            Create your first note
          </button>
        )}
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="hidden grid-cols-[minmax(180px,0.9fr)_minmax(0,1.5fr)_120px_44px] border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:grid">
          <span>Note</span>
          <span>Preview</span>
          <span>Updated</span>
          <span />
        </div>
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="group grid grid-cols-[minmax(0,1fr)_40px] items-center gap-3 border-b border-slate-100 px-3 py-3 transition last:border-0 hover:bg-slate-50 sm:grid-cols-[minmax(180px,0.9fr)_minmax(0,1.5fr)_120px_44px] sm:px-4"
          >
            <NoteIdentity entry={entry} compact />
            {!entry.decryption_error ? (
              <Link
                to={`/notes/${entry.id}`}
                className="hidden min-w-0 sm:block"
              >
                <NotePreview entry={entry} />
              </Link>
            ) : (
              <div className="hidden min-w-0 sm:block">
                <NotePreview entry={entry} />
              </div>
            )}
            <span className="hidden text-xs text-slate-500 sm:block">
              {getRelativeTime(entry.updated_at)}
            </span>
            <div className="flex items-center justify-end gap-1">
              <span className="sr-only sm:hidden">
                Updated {getRelativeTime(entry.updated_at)}
              </span>
              <NoteActions
                entry={entry}
                onDelete={onDelete}
                deleting={deleting}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {entries.map((entry) => (
        <article
          key={entry.id}
          className="group flex min-h-52 flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md"
        >
          <div className="mb-3 flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <FiBookOpen aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              {entry.decryption_error ? (
                <h3 className="line-clamp-2 text-sm font-bold leading-5 text-slate-900">
                  {entry.title || "Untitled note"}
                </h3>
              ) : (
                <Link
                  to={`/notes/${entry.id}`}
                  className="line-clamp-2 text-sm font-bold leading-5 text-slate-900 transition hover:text-sky-700"
                >
                  {entry.title || "Untitled note"}
                </Link>
              )}
              <p className="mt-1 text-xs text-slate-400">
                {entry.role === "owner" ? "Note" : `Shared · ${entry.role}`}
              </p>
            </div>
            <NoteActions
              entry={entry}
              onDelete={onDelete}
              deleting={deleting}
            />
          </div>
          {entry.decryption_error ? (
            <NotePreview entry={entry} className="line-clamp-3" />
          ) : (
            <Link to={`/notes/${entry.id}`} className="min-h-0 flex-1">
              <NotePreview entry={entry} className="line-clamp-3" />
            </Link>
          )}
          <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-400">
            <span className="inline-flex min-w-0 items-center gap-1.5 truncate">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
              Updated {getRelativeTime(entry.updated_at)}
            </span>
            <span className="shrink-0">
              {entry.updated_at
                ? new Date(entry.updated_at).toLocaleDateString()
                : ""}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
};

export default NotesCollection;
