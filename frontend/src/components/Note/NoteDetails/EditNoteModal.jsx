import { useEffect, useState } from "react";
import { FiCheck, FiLoader, FiX } from "react-icons/fi";
import useTiptapEditor from "../../Editor/useTiptapEditor";
import Description from "../Dashboard/CreateNoteModal/Description";

const EditNoteModal = ({
  note,
  saving,
  error: saveError,
  remoteUpdate,
  onClose,
  onLoadLatest,
  onSave,
}) => {
  const [title, setTitle] = useState(note.title);
  const [text, setText] = useState(note.text);
  const [error, setError] = useState("");
  const editor = useTiptapEditor({ setText, setError });

  useEffect(() => {
    if (editor && editor.getHTML() !== note.text) {
      editor.commands.setContent(note.text, { emitUpdate: false });
    }
  }, [editor, note.text]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title.trim() || !editor?.getText().trim()) {
      setError("Please provide both title and description.");
      return;
    }

    await onSave({ title: title.trim(), text });
  };

  const handleAddLink = () => {
    if (!editor) return;
    const currentUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL", currentUrl || "https://");
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url.trim() })
      .run();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:p-6"
      onMouseDown={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-note-title"
        className="flex h-full w-full max-w-3xl flex-col overflow-hidden border border-slate-200 bg-white shadow-2xl sm:h-auto sm:max-h-[calc(100vh-48px)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <h2
              id="edit-note-title"
              className="text-lg font-bold text-slate-900"
            >
              Edit note
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Latest save wins if collaborators edit together.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close editor"
            onClick={onClose}
            disabled={saving}
            className="rounded p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
          >
            <FiX />
          </button>
        </header>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-5 sm:p-6"
        >
          {(error || saveError) && (
            <p
              role="alert"
              className="mb-4 border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {saveError || error}
            </p>
          )}
          {remoteUpdate && (
            <div
              role="status"
              className="mb-4 flex flex-wrap items-center justify-between gap-3 border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
            >
              <span>
                A collaborator saved a newer version. Saving here will overwrite
                it.
              </span>
              <button
                type="button"
                onClick={onLoadLatest}
                className="font-semibold underline"
              >
                Load latest
              </button>
            </div>
          )}
          <label className="mb-5 block text-sm font-semibold text-slate-800">
            Title
            <input
              value={title}
              maxLength={255}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-2 w-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:bg-white"
              required
            />
          </label>
          <Description
            characterCount={editor?.getText().length || 0}
            editor={editor}
            handleAddLink={handleAddLink}
            handleTextColor={(color) =>
              editor?.chain().focus().setColor(color).run()
            }
            handleHighlight={(color) =>
              editor?.chain().focus().toggleHighlight({ color }).run()
            }
          />
          <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !title.trim()}
              className="inline-flex items-center gap-2 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? <FiLoader className="animate-spin" /> : <FiCheck />}
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default EditNoteModal;
