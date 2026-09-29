"use client";

import { useEffect, useState } from "react";
import {
  FiBookOpen,
  FiCheck,
  FiCode,
  FiFileText,
  FiItalic,
  FiLink,
  FiList,
  FiLoader,
  FiMinus,
  FiRotateCcw,
  FiRotateCw,
  FiX,
} from "react-icons/fi";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";

import { useCreateNoteMutation } from "../../../lib/features/noteApi";

const CreateNoteModal = ({ setShowAddModal }) => {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const [createNote, { isLoading }] = useCreateNoteMutation();

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      }),
    ],
    content: "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setText(editor.getHTML());
      setError("");
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[230px] w-full px-4 py-3.5 text-sm leading-7 text-slate-900 outline-none",
      },
    },
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
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
              <FiBookOpen className="text-xl" />
            </div>

            <div className="min-w-0">
              <h2 className="text-lg font-bold tracking-tight text-slate-900">
                Add New Entry
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Add something to your personal knowledge space.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            aria-label="Close modal"
            className="ml-3 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiX className="text-xl" />
          </button>
        </div>

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
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="entry-text"
                  className="flex items-center gap-2 text-sm font-semibold text-slate-800"
                >
                  <FiBookOpen className="text-slate-400" />
                  Description
                </label>

                <span className="text-xs text-slate-400">
                  {characterCount} characters
                </span>
              </div>

              {/* Editor */}
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition focus-within:border-slate-900 focus-within:bg-white focus-within:ring-4 focus-within:ring-slate-900/5">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-white p-2">
                  {/* Bold */}
                  <ToolbarButton
                    title="Bold"
                    active={editor?.isActive("bold")}
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                  >
                    <strong>B</strong>
                  </ToolbarButton>

                  {/* Italic */}
                  <ToolbarButton
                    title="Italic"
                    active={editor?.isActive("italic")}
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                  >
                    <FiItalic />
                  </ToolbarButton>

                  {/* Strike */}
                  <ToolbarButton
                    title="Strike"
                    active={editor?.isActive("strike")}
                    onClick={() => editor?.chain().focus().toggleStrike().run()}
                  >
                    <FiMinus />
                  </ToolbarButton>

                  <ToolbarDivider />

                  {/* Heading 1 */}
                  <ToolbarButton
                    title="Heading 1"
                    active={editor?.isActive("heading", { level: 1 })}
                    onClick={() =>
                      editor?.chain().focus().toggleHeading({ level: 1 }).run()
                    }
                  >
                    <span className="font-bold">H1</span>
                  </ToolbarButton>

                  {/* Heading 2 */}
                  <ToolbarButton
                    title="Heading 2"
                    active={editor?.isActive("heading", { level: 2 })}
                    onClick={() =>
                      editor?.chain().focus().toggleHeading({ level: 2 }).run()
                    }
                  >
                    <span className="font-bold">H2</span>
                  </ToolbarButton>

                  <ToolbarDivider />

                  {/* Bullet list */}
                  <ToolbarButton
                    title="Bullet List"
                    active={editor?.isActive("bulletList")}
                    onClick={() =>
                      editor?.chain().focus().toggleBulletList().run()
                    }
                  >
                    <FiList />
                  </ToolbarButton>

                  {/* Ordered list */}
                  <ToolbarButton
                    title="Numbered List"
                    active={editor?.isActive("orderedList")}
                    onClick={() =>
                      editor?.chain().focus().toggleOrderedList().run()
                    }
                  >
                    <span className="text-xs font-bold">1.</span>
                  </ToolbarButton>

                  {/* Blockquote */}
                  <ToolbarButton
                    title="Quote"
                    active={editor?.isActive("blockquote")}
                    onClick={() =>
                      editor?.chain().focus().toggleBlockquote().run()
                    }
                  >
                    <span className="text-base font-bold">"</span>
                  </ToolbarButton>

                  <ToolbarDivider />

                  {/* Inline code */}
                  <ToolbarButton
                    title="Inline Code"
                    active={editor?.isActive("code")}
                    onClick={() => editor?.chain().focus().toggleCode().run()}
                  >
                    <FiCode />
                  </ToolbarButton>

                  {/* Code block */}
                  <ToolbarButton
                    title="Code Block"
                    active={editor?.isActive("codeBlock")}
                    onClick={() =>
                      editor?.chain().focus().toggleCodeBlock().run()
                    }
                  >
                    <span className="text-xs font-bold">{"</>"}</span>
                  </ToolbarButton>

                  {/* Link */}
                  <ToolbarButton
                    title="Add Link"
                    active={editor?.isActive("link")}
                    onClick={handleAddLink}
                  >
                    <FiLink />
                  </ToolbarButton>

                  <ToolbarDivider />

                  {/* Text Colors */}
                  <div className="flex items-center gap-1">
                    <ToolbarButton
                      title="Black"
                      onClick={() => handleTextColor("#0f172a")}
                    >
                      <span className="h-3 w-3 rounded-full bg-slate-900" />
                    </ToolbarButton>

                    <ToolbarButton
                      title="Red"
                      onClick={() => handleTextColor("#ef4444")}
                    >
                      <span className="h-3 w-3 rounded-full bg-red-500" />
                    </ToolbarButton>

                    <ToolbarButton
                      title="Blue"
                      onClick={() => handleTextColor("#2563eb")}
                    >
                      <span className="h-3 w-3 rounded-full bg-blue-600" />
                    </ToolbarButton>

                    <ToolbarButton
                      title="Green"
                      onClick={() => handleTextColor("#16a34a")}
                    >
                      <span className="h-3 w-3 rounded-full bg-green-600" />
                    </ToolbarButton>

                    <ToolbarButton
                      title="Purple"
                      onClick={() => handleTextColor("#9333ea")}
                    >
                      <span className="h-3 w-3 rounded-full bg-purple-600" />
                    </ToolbarButton>
                  </div>

                  {/* Highlight */}
                  <ToolbarButton
                    title="Yellow Highlight"
                    active={editor?.isActive("highlight")}
                    onClick={() => handleHighlight("#fef08a")}
                  >
                    <span className="rounded bg-yellow-200 px-1 text-xs font-bold">
                      A
                    </span>
                  </ToolbarButton>

                  <ToolbarDivider />

                  {/* Undo */}
                  <ToolbarButton
                    title="Undo"
                    disabled={!editor?.can().undo()}
                    onClick={() => editor?.chain().focus().undo().run()}
                  >
                    <FiRotateCcw />
                  </ToolbarButton>

                  {/* Redo */}
                  <ToolbarButton
                    title="Redo"
                    disabled={!editor?.can().redo()}
                    onClick={() => editor?.chain().focus().redo().run()}
                  >
                    <FiRotateCw />
                  </ToolbarButton>
                </div>

                {/* Editor Content */}
                <EditorContent editor={editor} />
              </div>
            </div>
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

/* -------------------------------- */
/* Toolbar Button                   */
/* -------------------------------- */

const ToolbarButton = ({
  children,
  title,
  active = false,
  disabled = false,
  onClick,
}) => {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onMouseDown={(event) => {
        event.preventDefault();
      }}
      onClick={onClick}
      className={`flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-lg px-2 text-sm transition ${
        active
          ? "bg-slate-900 text-white"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      } disabled:cursor-not-allowed disabled:opacity-30`}
    >
      {children}
    </button>
  );
};

/* -------------------------------- */
/* Toolbar Divider                  */
/* -------------------------------- */

const ToolbarDivider = () => {
  return <div className="mx-1 h-6 w-px bg-slate-200" />;
};

export default CreateNoteModal;
