"use client";

// react icons
import { useEffect, useState } from "react";
import { FiCheck, FiFileText, FiLoader, FiX } from "react-icons/fi";

// redux toolkit query
import { useCreateNoteMutation } from "../../../../lib/features/noteApi";

// local components
import Header from "./Header";
import Description from "./Description";
import useTiptapEditor from "../../../Editor/useTiptapEditor";

const CreateNoteModal = ({ setShowAddModal }) => {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const [createNote, { isLoading }] = useCreateNoteMutation();

  const editor = useTiptapEditor({
    setText,
    setError,
  });

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  const handleCreateEntry = async (event) => {
    event.preventDefault();

    const plainText = editor?.getText().trim() || "";

    if (!title.trim() || !plainText) {
      setError("Please provide both title and description.");
      return;
    }

    try {
      await createNote({
        title: title.trim(),
        text: text,
      }).unwrap();

      setTitle("");
      setText("");
      editor?.commands.clearContent();

      setShowAddModal(false);
    } catch (error) {
      console.error(error);

      setError(
        error?.data?.detail ||
          error?.data?.message ||
          "Failed to create entry. Please try again.",
      );
    }
  };

  const handleClose = () => {
    if (isLoading) return;

    setShowAddModal(false);
  };

  const handleAddLink = () => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href;

    const url = window.prompt("Enter URL", previousUrl || "https://");

    if (url === null) {
      return;
    }

    if (url.trim() === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({
        href: url.trim(),
      })
      .run();
  };

  const handleTextColor = (color) => {
    if (!editor) return;

    editor.chain().focus().setColor(color).run();
  };

  const handleHighlight = (color) => {
    if (!editor) return;

    editor.chain().focus().toggleHighlight({ color }).run();
  };

  const characterCount = editor?.getText().length || 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:p-6"
      onMouseDown={handleClose}
    >
      <div
        className="flex h-full w-full max-w-3xl flex-col overflow-hidden border border-slate-200 bg-white shadow-2xl shadow-slate-900/20 sm:h-auto sm:max-h-[calc(100vh-48px)] sm:rounded-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <Header handleClose={handleClose} isLoading={isLoading} />

        {/* Form */}
        <form
          onSubmit={handleCreateEntry}
          className="flex-1 overflow-y-auto p-5 sm:p-6"
        >
          <div className="space-y-5">
            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                <div className="mt-0.5 shrink-0">
                  <FiX />
                </div>

                <p>{error}</p>
              </div>
            )}

            {/* Title */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="entry-title"
                  className="flex items-center gap-2 text-sm font-semibold text-slate-800"
                >
                  <FiFileText className="text-slate-400" />
                  Title
                </label>

                <span
                  className={`text-xs ${
                    title.length >= 255
                      ? "font-semibold text-red-500"
                      : "text-slate-400"
                  }`}
                >
                  {title.length}/255
                </span>
              </div>

              <input
                id="entry-title"
                type="text"
                value={title}
                maxLength={255}
                onChange={(event) => {
                  setTitle(event.target.value);
                  setError("");
                }}
                placeholder="e.g. Authentication"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
                required
              />
            </div>

            {/* Description */}

            <Description
              characterCount={characterCount}
              editor={editor}
              handleAddLink={handleAddLink}
              handleTextColor={handleTextColor}
              handleHighlight={handleHighlight}
            />
          </div>

          {/* Footer */}
          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading || !title.trim() || !editor?.getText().trim()}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {isLoading ? (
                <>
                  <FiLoader className="animate-spin text-base" />
                  Saving...
                </>
              ) : (
                <>
                  <FiCheck className="text-base" />
                  Save Entry
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNoteModal;
