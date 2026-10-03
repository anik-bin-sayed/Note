import { useState } from "react";
import {
  FiCopy,
  FiLink,
  FiLoader,
  FiTrash2,
  FiUserPlus,
  FiX,
} from "react-icons/fi";
import {
  useCreateShareLinkMutation,
  useGetCollaboratorsQuery,
  useGetShareLinksQuery,
  useInviteCollaboratorMutation,
  useRemoveCollaboratorMutation,
  useRevokeShareLinkMutation,
} from "../../../lib/features/noteApi";
import api from "../../../lib/api";
import {
  encodeSharedNoteKey,
  encryptNoteKeyForRecipient,
} from "../../../lib/vaultCrypto";

const ShareCollaboratePanel = ({ note, onClose }) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const [createShare, { isLoading: creatingShare }] =
    useCreateShareLinkMutation();
  const [invite, { isLoading: inviting }] = useInviteCollaboratorMutation();
  const [revoke, { isLoading: revoking }] = useRevokeShareLinkMutation();
  const [remove, { isLoading: removing }] = useRemoveCollaboratorMutation();
  const { data: shares = [], isLoading: loadingShares } = useGetShareLinksQuery(
    note.id,
    { skip: note.role !== "owner" },
  );
  const { data: collaborators = [], isLoading: loadingCollaborators } =
    useGetCollaboratorsQuery(note.id, { skip: note.role !== "owner" });

  const copyLink = async (nextLink) => {
    setLink(nextLink);
    try {
      await navigator.clipboard.writeText(nextLink);
    } catch {
      setError("Link created. Copy it from the field below.");
    }
  };

  const createPublicLink = async () => {
    setError("");
    try {
      const result = await createShare({
        id: note.id,
        expires_in_days: 30,
      }).unwrap();
      const key = await encodeSharedNoteKey(note);
      const url = new URL(`/s/${result.token}`, window.location.origin);
      url.hash = new URLSearchParams({ key }).toString();
      await copyLink(url.toString());
    } catch (shareError) {
      setError(
        shareError?.data?.detail ||
          shareError.message ||
          "Could not create share link.",
      );
    }
  };

  const addCollaborator = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const { data } = await api.get("/api/vault/public-key", {
        params: { email },
      });
      const keyEnvelope = await encryptNoteKeyForRecipient(
        note,
        data.public_key,
      );
      await invite({
        id: note.id,
        email,
        role,
        key_envelope: keyEnvelope,
      }).unwrap();
      const key = await encodeSharedNoteKey(note);
      const url = new URL(`/notes/${note.id}`, window.location.origin);
      url.hash = new URLSearchParams({ key }).toString();
      await copyLink(url.toString());
      setEmail("");
    } catch (inviteError) {
      setError(
        inviteError?.data?.detail ||
          inviteError.message ||
          "Could not add collaborator.",
      );
    }
  };

  const handleRevoke = async (token) => {
    try {
      await revoke({ id: note.id, token }).unwrap();
    } catch (revokeError) {
      setError(revokeError?.data?.detail || "Could not revoke the link.");
    }
  };

  const handleRemove = async (collaboratorId) => {
    try {
      await remove({ id: note.id, collaboratorId }).unwrap();
    } catch (removeError) {
      setError(removeError?.data?.detail || "Could not remove collaborator.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="sharing-title"
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto border border-slate-200 bg-white p-6 shadow-2xl sm:p-8"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id="sharing-title" className="text-xl font-bold text-slate-900">
              Share note
            </h2>
            <p className="mt-1 line-clamp-1 text-sm text-slate-500">
              {note.title}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sharing"
            className="rounded p-2 text-slate-500 hover:bg-slate-100"
          >
            <FiX />
          </button>
        </header>

        {error && (
          <p
            role="alert"
            className="mb-4 border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <section className="border-b border-slate-200 pb-6">
          <h3 className="text-sm font-semibold text-slate-900">
            Public read-only link
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Expires in 30 days. Anyone with the link can read this note.
          </p>
          <button
            type="button"
            onClick={createPublicLink}
            disabled={creatingShare}
            className="mt-3 inline-flex items-center gap-2 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {creatingShare ? <FiLoader className="animate-spin" /> : <FiLink />}
            Create public link
          </button>
          {!loadingShares &&
            shares.filter((share) => share.active).length > 0 && (
              <ul className="mt-3 divide-y divide-slate-100 border-t border-slate-100">
                {shares
                  .filter((share) => share.active)
                  .map((share) => (
                    <li
                      key={share.token}
                      className="flex items-center justify-between gap-3 py-3 text-xs"
                    >
                      <span className="text-slate-500">
                        Expires{" "}
                        {new Date(share.expires_at).toLocaleDateString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRevoke(share.token)}
                        disabled={revoking}
                        className="inline-flex items-center gap-1 text-red-700 hover:text-red-900"
                      >
                        <FiTrash2 /> Revoke
                      </button>
                    </li>
                  ))}
              </ul>
            )}
        </section>

        <section className="pt-6">
          <h3 className="text-sm font-semibold text-slate-900">
            Invite a collaborator
          </h3>
          <form
            onSubmit={addCollaborator}
            className="mt-3 grid gap-3 sm:grid-cols-[1fr_8rem_auto]"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Account email"
              className="min-w-0 border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-900"
            />
            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
              aria-label="Collaborator role"
              className="border border-slate-300 bg-white px-3 py-2.5 text-sm"
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
            </select>
            <button
              type="submit"
              disabled={inviting}
              aria-label="Invite collaborator"
              className="inline-flex items-center justify-center gap-2 bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {inviting ? (
                <FiLoader className="animate-spin" />
              ) : (
                <FiUserPlus />
              )}
              Invite
            </button>
          </form>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            The recipient must already have enabled an encrypted vault. They
            will see an in-app notification; the copied link remains a fallback.
          </p>
          {!loadingCollaborators && collaborators.length > 0 && (
            <ul className="mt-4 divide-y divide-slate-100 border-t border-slate-100">
              {collaborators.map((collaborator) => (
                <li
                  key={collaborator.user_id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {collaborator.name || collaborator.email}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {collaborator.email} · {collaborator.role}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${collaborator.email}`}
                    onClick={() => handleRemove(collaborator.user_id)}
                    disabled={removing}
                    className="rounded p-2 text-slate-400 hover:bg-red-50 hover:text-red-700"
                  >
                    <FiTrash2 />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {link && (
          <div className="mt-6 flex gap-2 border-t border-slate-200 pt-5">
            <input
              aria-label="Share URL"
              readOnly
              value={link}
              onFocus={(event) => event.target.select()}
              className="min-w-0 flex-1 border border-slate-300 px-3 py-2 text-xs text-slate-600"
            />
            <button
              type="button"
              aria-label="Copy share URL"
              onClick={() => copyLink(link)}
              className="border border-slate-300 px-3 text-slate-700 hover:bg-slate-50"
            >
              <FiCopy />
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default ShareCollaboratePanel;
