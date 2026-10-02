import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { FiAlertCircle, FiLoader, FiLock } from "react-icons/fi";
import api from "../lib/api";
import { noteApi } from "../lib/features/noteApi";
import { createVault, setVaultKey, unlockVault } from "../lib/vaultCrypto";

const MIN_PIN_LENGTH = 8;

const VaultGate = ({ children }) => {
  const dispatch = useDispatch();
  const [vault, setVault] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    api
      .get("/api/vault")
      .then(({ data }) => {
        if (active) setVault(data);
      })
      .catch(() => {
        if (active) setError("Could not load your encryption vault. Reload to try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (pin.length < MIN_PIN_LENGTH) {
      setError(`Use at least ${MIN_PIN_LENGTH} characters for your PIN or passphrase.`);
      return;
    }

    if (!vault?.configured && pin !== confirmation) {
      setError("The PIN entries do not match.");
      return;
    }

    setSaving(true);

    try {
      let key;

      if (vault?.configured) {
        key = await unlockVault(pin, vault);
      } else {
        const created = await createVault(pin);
        await api.put("/api/vault", created.metadata);
        key = created.key;
      }

      setVaultKey(key);
      dispatch(noteApi.util.resetApiState());
      const migration = dispatch(
        noteApi.endpoints.migrateLegacyNotes.initiate(),
      );
      migration
        .unwrap()
        .catch((migrationError) => {
          console.error("Legacy note migration failed:", migrationError);
        })
        .finally(() => migration.unsubscribe());
      setUnlocked(true);
      setPin("");
      setConfirmation("");
    } catch (unlockError) {
      setError(
        unlockError?.response?.data?.detail ||
          unlockError?.message ||
          "Could not unlock the note vault.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (unlocked) return children;

  const supported = Boolean(globalThis.crypto?.subtle);
  const configured = vault?.configured;

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-4 py-10 text-slate-900">
      <section className="w-full max-w-md border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-900 text-white">
          {loading ? <FiLoader className="animate-spin text-xl" /> : <FiLock className="text-xl" />}
        </div>

        <h1 className="text-2xl font-bold">
          {loading ? "Checking vault" : configured ? "Unlock your notes" : "Create your note PIN"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {configured
            ? "Your notes are encrypted on this device. Enter your PIN or passphrase to decrypt them."
            : "Choose a PIN or passphrase to encrypt your notes in this browser."}
        </p>

        {error && (
          <div role="alert" className="mt-5 flex gap-2 border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <FiAlertCircle className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error.includes("Could not load") && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              PIN or passphrase
              <input
                type="password"
                value={pin}
                onChange={(event) => setPin(event.target.value)}
                minLength={MIN_PIN_LENGTH}
                maxLength={128}
                autoComplete={configured ? "current-password" : "new-password"}
                autoFocus
                required
                className="mt-1.5 w-full border border-slate-300 bg-white px-3 py-3 text-base outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </label>

            {!configured && (
              <label className="block text-sm font-medium text-slate-700">
                Confirm PIN or passphrase
                <input
                  type="password"
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  minLength={MIN_PIN_LENGTH}
                  maxLength={128}
                  autoComplete="new-password"
                  required
                  className="mt-1.5 w-full border border-slate-300 bg-white px-3 py-3 text-base outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </label>
            )}

            {!configured && (
              <p className="border-l-2 border-amber-500 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
                There is no PIN reset. If you forget it, your notes cannot be recovered.
              </p>
            )}

            {!supported && (
              <p role="alert" className="text-sm text-red-700">
                Secure browser encryption is unavailable. Use a modern browser over HTTPS.
              </p>
            )}

            <button
              type="submit"
              disabled={saving || !supported}
              className="flex w-full items-center justify-center gap-2 bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving && <FiLoader className="animate-spin" />}
              {saving ? "Securing vault..." : configured ? "Unlock notes" : "Create encrypted vault"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
};

export default VaultGate;