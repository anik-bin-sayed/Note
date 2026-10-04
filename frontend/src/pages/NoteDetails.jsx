// react icons
import { useEffect, useMemo, useState } from "react";
import { FiArrowLeft, FiEdit3, FiTrash2 } from "react-icons/fi";

// react router dom
import { Link, useNavigate, useParams } from "react-router-dom";

// dompurify
import DOMPurify from "dompurify";

// rtk query
import {
  useDeleteEntryMutation,
  useGetNoteDetailsQuery,
  useUpdateNoteMutation,
} from "../lib/features/noteApi";

// local components
import Header from "../components/Note/NoteDetails/Header";
import MetaInfo from "../components/Note/NoteDetails/MetaInfo";
import LoadingNoteDetails from "../components/Note/NoteDetails/LoadingNoteDetails";
import EditNoteModal from "../components/Note/NoteDetails/EditNoteModal";
import DeleteNoteModal from "../components/Note/NoteDetails/DeleteNoteModal";
import ShareCollaboratePanel from "../components/Note/NoteDetails/ShareCollaboratePanel";
import { useAuth } from "../context/AuthContext";

const NoteDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const navigate = useNavigate();

  const {
    data: note,
    isLoading,
    isError,
    refetch,
  } = useGetNoteDetailsQuery(id);
  const [deleteEntry, { isLoading: deleting }] = useDeleteEntryMutation();
  const [updateNote, { isLoading: saving }] = useUpdateNoteMutation();
  const [editing, setEditing] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [remoteUpdate, setRemoteUpdate] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!id) return;

    const apiUrl = new URL(
      import.meta.env.VITE_API_URL || "http://localhost:8000/api",
    );
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const socket = new WebSocket(
      `${protocol}//${apiUrl.host}/api/entries/${id}/live`,
    );

    socket.onmessage = (event) => {
      const update = JSON.parse(event.data);
      if (update.type !== "note-updated") return;
      if (update.updated_by === user?.id && saving) return;
      if (editing) setRemoteUpdate(true);
      else refetch();
    };

    return () => socket.close();
  }, [editing, id, refetch, saving, user?.id]);

  const handleDeleteNote = async () => {
    try {
      await deleteEntry(id).unwrap();
      navigate("/notes");
    } catch (error) {
      console.error(error);
      setSaveError(
        error?.data?.detail || error?.message || "Could not delete this note.",
      );
      setConfirmDelete(false);
    }
  };

  const handleSave = async (updatedNote) => {
    setSaveError("");
    try {
      await updateNote({ id, note: updatedNote, entry: note }).unwrap();
      setEditing(false);
      setRemoteUpdate(false);
      await refetch();
    } catch (error) {
      setSaveError(
        error?.data?.detail || error.message || "Could not save this note.",
      );
    }
  };

  const canEdit = note?.role === "owner" || note?.role === "editor";
  const canShare = note?.role === "owner";
  const { contentHtml, headings, readingMinutes } = useMemo(() => {
    if (!note?.text || typeof document === "undefined") {
      return { contentHtml: "", headings: [], readingMinutes: 1 };
    }

    const safeHtml = DOMPurify.sanitize(note.text);
    const content = document.createElement("div");
    content.innerHTML = safeHtml;
    const noteHeadings = Array.from(content.querySelectorAll("h1, h2, h3"))
      .map((heading, index) => {
        const title = heading.textContent.trim();
        if (!title) return null;
        const headingId = `note-heading-${index + 1}`;
        heading.id = headingId;
        return {
          id: headingId,
          title,
          level: Number(heading.tagName.slice(1)),
        };
      })
      .filter(Boolean);
    const wordCount = (content.textContent.match(/\S+/g) || []).length;

    return {
      contentHtml: content.innerHTML,
      headings: noteHeadings,
      readingMinutes: Math.max(1, Math.ceil(wordCount / 220)),
    };
  }, [note?.text]);

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Header
        noteTitle={note?.title}
        deleting={deleting}
        canDelete={note?.role === "owner"}
        canEdit={canEdit}
        canShare={canShare}
        onRequestDelete={() => setConfirmDelete(true)}
        onEdit={() => setEditing(true)}
        onShare={() => setSharing(true)}
      />
      <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        {isLoading && <LoadingNoteDetails />}

        {!isLoading && (isError || !note) && (
          <div className="mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center py-12 text-center">
            <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <FiArrowLeft className="rotate-180 text-xl" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">Note not found</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              The note you&apos;re looking for doesn&apos;t exist or may have
              been deleted.
            </p>
            <Link
              to="/notes"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <FiArrowLeft />
              Back to Notes
            </Link>
          </div>
        )}

        {remoteUpdate && note && (
          <div
            role="status"
            className="mx-auto mb-6 flex max-w-4xl flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          >
            <span>
              A collaborator saved a newer version. Saving your open edits will
              overwrite it.
            </span>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setRemoteUpdate(false);
                refetch();
              }}
              className="font-semibold underline underline-offset-2"
            >
              Load latest
            </button>
          </div>
        )}
        {saveError && note && (
          <p
            role="alert"
            className="mx-auto mb-6 max-w-4xl rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {saveError}
          </p>
        )}
        {isError && note && (
          <div
            role="alert"
            className="mx-auto mb-6 flex max-w-4xl flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <span>
              This note may be unavailable or your access may have changed.
            </span>
            <button
              type="button"
              onClick={() => refetch()}
              className="font-semibold underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        )}

        {!isLoading && note && (
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 xl:grid-cols-[minmax(0,800px)_190px] xl:justify-center xl:gap-16">
            <article className="min-w-0">
              <div className="border-b border-slate-200 pb-7 sm:pb-9">
                <span className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                  Personal Knowledge
                </span>
                <h1 className="mt-5 wrap-break-word text-3xl font-bold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
                  {note.title}
                </h1>
                <MetaInfo note={note} readingMinutes={readingMinutes} />
              </div>

              <div
                className="prose prose-slate mt-8 max-w-none wrap-break-word text-base leading-8 sm:mt-10 sm:text-[17px] [&_a]:font-medium [&_a]:text-indigo-600 [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:border-l-4 [&_blockquote]:border-indigo-200 [&_blockquote]:bg-slate-50 [&_blockquote]:py-1 [&_blockquote]:pl-5 [&_blockquote]:pr-4 [&_blockquote]:not-italic [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1 [&_code]:py-0.5 [&_h1]:scroll-mt-24 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:leading-tight [&_h2]:scroll-mt-24 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:leading-tight [&_h3]:scroll-mt-24 [&_h3]:text-xl [&_h3]:font-semibold [&_hr]:my-8 [&_li]:my-1 [&_ol]:pl-6 [&_p]:my-5 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-slate-200 [&_pre]:bg-slate-900 [&_pre]:p-4 [&_pre]:text-slate-100 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_ul]:pl-6"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />

              <footer className="mt-12 flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-400">
                  Updated {new Date(note.updated_at).toLocaleString()}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to="/notes"
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                  >
                    <FiArrowLeft /> Back to Notes
                  </Link>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => setEditing(true)}
                      className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      <FiEdit3 /> Edit Note
                    </button>
                  )}
                  {note.role === "owner" && (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <FiTrash2 /> Delete Note
                    </button>
                  )}
                </div>
              </footer>
            </article>

            {headings.length > 0 && (
              <aside className="hidden xl:block">
                <nav
                  aria-label="On this page"
                  className="sticky top-28 border-l border-slate-200 pl-4"
                >
                  <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                    On this page
                  </h2>
                  <ul className="space-y-2">
                    {headings.map((heading) => (
                      <li key={heading.id}>
                        <a
                          href={`#${heading.id}`}
                          className={`block text-sm leading-5 text-slate-500 transition hover:text-indigo-600 ${heading.level > 1 ? "pl-3" : ""} ${heading.level > 2 ? "pl-6" : ""}`}
                        >
                          {heading.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </aside>
            )}
          </div>
        )}
      </section>
      {editing && note && (
        <EditNoteModal
          note={note}
          saving={saving}
          error={saveError}
          remoteUpdate={remoteUpdate}
          onClose={() => setEditing(false)}
          onLoadLatest={() => {
            setEditing(false);
            setRemoteUpdate(false);
            refetch();
          }}
          onSave={handleSave}
        />
      )}
      {sharing && note && canShare && (
        <ShareCollaboratePanel note={note} onClose={() => setSharing(false)} />
      )}
      {confirmDelete && note && (
        <DeleteNoteModal
          noteTitle={note.title}
          deleting={deleting}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={handleDeleteNote}
        />
      )}
    </main>
  );
};

export default NoteDetails;
