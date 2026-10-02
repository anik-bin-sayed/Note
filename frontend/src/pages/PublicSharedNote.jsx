import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DOMPurify from "dompurify";
import { FiBookOpen, FiLock } from "react-icons/fi";
import api from "../lib/api";
import { decryptNoteWithKey, importSharedNoteKey } from "../lib/vaultCrypto";

const PublicSharedNote = () => {
  const { token } = useParams();
  const [note, setNote] = useState(null);
  const [state, setState] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    const loadNote = async () => {
      try {
        const encodedKey = new URLSearchParams(
          window.location.hash.slice(1),
        ).get("key");
        if (!encodedKey) throw new Error("This share link is missing its key.");

        const { data } = await api.get(`/api/shares/${token}`);
        const key = await importSharedNoteKey(encodedKey);
        const decryptedNote = await decryptNoteWithKey(data, key);

        if (active) {
          setNote({ ...data, ...decryptedNote });
          setState("ready");
        }
      } catch (error) {
        if (active) {
          setErrorMessage(
            error?.response?.data?.detail ||
              error?.message ||
              "Could not load this share.",
          );
          setState(error?.response?.status === 404 ? "expired" : "invalid");
        }
      }
    };

    loadNote();
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900 sm:py-16">
      <section className="mx-auto max-w-3xl border border-slate-200 bg-white shadow-sm">
        <header className="flex items-center gap-3 border-b border-slate-200 px-6 py-5 sm:px-8">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
            <FiBookOpen />
          </span>
          <div>
            <p className="text-sm font-bold">Note</p>
            <p className="text-xs text-slate-500">Shared read-only</p>
          </div>
          <FiLock
            className="ml-auto text-slate-400"
            aria-label="End-to-end encrypted"
          />
        </header>

        {state === "loading" && (
          <p className="px-6 py-12 text-sm text-slate-500 sm:px-8">
            Decrypting shared note...
          </p>
        )}
        {state !== "loading" && state !== "ready" && (
          <div className="px-6 py-12 sm:px-8">
            <h1 className="text-xl font-bold">Share unavailable</h1>
            <p className="mt-2 text-sm text-slate-600">
              This link may have expired, been revoked, or be missing its
              decryption key.
            </p>
            <p className="mt-3 text-xs text-slate-500">{errorMessage}</p>
          </div>
        )}
        {state === "ready" && note && (
          <article>
            <div className="border-b border-slate-100 px-6 py-7 sm:px-8">
              <h1 className="break-words text-2xl font-bold sm:text-3xl">
                {note.title}
              </h1>
              <p className="mt-3 text-xs text-slate-500">
                Updated {new Date(note.updated_at).toLocaleDateString()}
              </p>
            </div>
            <div
              className="prose prose-slate max-w-none px-6 py-8 sm:px-8 sm:py-10"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(note.text),
              }}
            />
          </article>
        )}
      </section>
    </main>
  );
};

export default PublicSharedNote;
