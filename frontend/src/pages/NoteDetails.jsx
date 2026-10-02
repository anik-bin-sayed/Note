// react icons
import { useEffect, useState } from "react";
import { FiArrowLeft, FiBookOpen } from "react-icons/fi";

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
import Breadcrumb from "../components/Note/NoteDetails/Breadcrumb";
import LoadingNoteDetails from "../components/Note/NoteDetails/LoadingNoteDetails";
import EditNoteModal from "../components/Note/NoteDetails/EditNoteModal";
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

  const handleDeleteNote = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this entry?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteEntry(id).unwrap();
      navigate(-1);
    } catch (error) {
      console.error(error);
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

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <Header
        handleDeleteNote={handleDeleteNote}
        deleting={deleting}
        canDelete={note?.role === "owner"}
        canEdit={canEdit}
        canShare={canShare}
        onEdit={() => setEditing(true)}
        onShare={() => setSharing(true)}
      />
      {/* Main Content */}

      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {isLoading && <LoadingNoteDetails />}
        {isError && (
          <p
            role="alert"
            className="border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            This note is unavailable or your access has been removed.
          </p>
        )}
        {remoteUpdate && (
          <div
            role="status"
            className="mb-5 flex flex-wrap items-center justify-between gap-3 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
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
              className="font-semibold underline"
            >
              Load latest
            </button>
          </div>
        )}
        {saveError && (
          <p
            role="alert"
            className="mb-5 border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {saveError}
          </p>
        )}
        {!isLoading && note && (
          <>
            {/* Breadcrumb */}
            <Breadcrumb note={note} />
            {/* Note Card */}
            <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              {/* Note Header */}
              <div className="border-b border-slate-100 px-6 py-7 sm:px-8 sm:py-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                      <FiBookOpen className="text-2xl" />
                    </div>

                    <div>
                      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        {note?.title}
                      </h1>

                      <p className="mt-2 text-sm text-slate-500">
                        Personal knowledge note
                      </p>
                    </div>
                  </div>
                </div>

                {/* Meta Information */}
                <MetaInfo note={note} />
              </div>

              {/* Note Content */}
              <div className="px-6 py-8 sm:px-8 sm:py-10">
                <div
                  className="
    prose prose-slate max-w-none
    [&_p]:mb-4
    [&_p:last-child]:mb-0
    [&_br]:content-['']
  "
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(note.text),
                  }}
                />
              </div>

              {/* Footer */}
              <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-5 sm:px-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-400">
                    This note belongs to your personal knowledge base.
                  </p>

                  <Link
                    to="/notes"
                    className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
                  >
                    <FiArrowLeft />
                    All Notes
                  </Link>
                </div>
              </div>
            </article>
          </>
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
    </main>
  );
};

export default NoteDetails;
