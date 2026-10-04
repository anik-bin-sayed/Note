import { FiAlertCircle, FiX } from "react-icons/fi";

const DeleteNoteModal = ({ noteTitle, deleting, onCancel, onConfirm }) => (
  <div
    className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
    onMouseDown={(event) => {
      if (event.target === event.currentTarget && !deleting) onCancel();
    }}
  >
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-note-title"
      aria-describedby="delete-note-description"
      className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6"
    >
      <div className="flex items-start gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
          <FiAlertCircle aria-hidden="true" className="text-xl" />
        </span>
        <div className="min-w-0 flex-1">
          <h2
            id="delete-note-title"
            className="text-base font-bold text-slate-900"
          >
            Delete this note?
          </h2>
          <p
            id="delete-note-description"
            className="mt-2 text-sm leading-6 text-slate-500"
          >
            {noteTitle ? (
              <>
                <span className="font-semibold text-slate-700">
                  {noteTitle}
                </span>{" "}
                will be permanently deleted. This action cannot be undone.
              </>
            ) : (
              "This note will be permanently deleted. This action cannot be undone."
            )}
          </p>
        </div>
        <button
          type="button"
          aria-label="Close delete confirmation"
          disabled={deleting}
          onClick={onCancel}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
        >
          <FiX />
        </button>
      </div>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          disabled={deleting}
          onClick={onCancel}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={deleting}
          onClick={onConfirm}
          className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {deleting ? "Deleting..." : "Delete Note"}
        </button>
      </div>
    </section>
  </div>
);

export default DeleteNoteModal;
