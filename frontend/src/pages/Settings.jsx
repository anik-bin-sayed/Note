import { useEffect, useState } from "react";
import { FiArrowLeft, FiLoader, FiMoon, FiSun } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { useTheme } from "../context/ThemeContext";
import {
  clearVaultKey,
  createVault,
  isVaultPinRequired,
  removeDeviceVaultKey,
  saveDeviceVaultKey,
  setVaultKey,
  setVaultPinRequired,
  unlockVault,
} from "../lib/vaultCrypto";

const MIN_PIN_LENGTH = 8;

const getErrorMessage = (error) => {
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (typeof error?.message === "string") return error.message;
  return "Could not update vault settings. Please try again.";
};

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [vault, setVault] = useState(null);
  const [loadingVault, setLoadingVault] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pinRequired, setPinRequired] = useState(() =>
    isVaultPinRequired(user?.id),
  );
  const [pin, setPin] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    api
      .get("/api/vault")
      .then(({ data }) => {
        if (!active) return;
        setVault(data);
        setPinRequired(isVaultPinRequired(user.id));
      })
      .catch((vaultError) => {
        if (active) setError(getErrorMessage(vaultError));
      })
      .finally(() => {
        if (active) setLoadingVault(false);
      });

    return () => {
      active = false;
    };
  }, [user.id]);

  const createVaultPin = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (pin.length < MIN_PIN_LENGTH) {
      setError(
        `Use at least ${MIN_PIN_LENGTH} characters for your PIN or passphrase.`,
      );
      return;
    }
    if (pin !== confirmation) {
      setError("The PIN entries do not match.");
      return;
    }

    setSaving(true);
    try {
      const created = await createVault(pin);
      await api.put("/api/vault", created.metadata);
      setVault({ configured: true, ...created.metadata });
      setVaultKey(created.key);
      setVaultPinRequired(user.id, true);
      setPinRequired(true);

      if (!pinRequired) {
        await saveDeviceVaultKey(user.id, created.key);
        setVaultPinRequired(user.id, false);
        setPinRequired(false);
      }

      setPin("");
      setConfirmation("");
      setMessage("Your encrypted vault is ready.");
    } catch (setupError) {
      setError(getErrorMessage(setupError));
    } finally {
      setSaving(false);
    }
  };

  const updatePinRequirement = async (event) => {
    const nextRequired = event.target.checked;
    if (nextRequired === pinRequired) return;

    setError("");
    setMessage("");
    if (!pin) {
      setError("Enter your current PIN to change this setting.");
      return;
    }

    setSaving(true);
    try {
      const key = await unlockVault(pin, vault);
      setVaultKey(key);

      if (nextRequired) {
        await removeDeviceVaultKey(user.id);
        setVaultPinRequired(user.id, true);
        clearVaultKey();
      } else {
        await saveDeviceVaultKey(user.id, key);
        setVaultPinRequired(user.id, false);
      }

      setPinRequired(nextRequired);
      setPin("");
      setMessage(
        nextRequired
          ? "PIN will be required the next time you open notes."
          : "This browser will now open notes without asking for your PIN.",
      );
    } catch (settingError) {
      setError(getErrorMessage(settingError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar user={user} logout={logout} />
      <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          <FiArrowLeft aria-hidden="true" /> Back
        </button>

        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>

        {error && (
          <p
            role="alert"
            className="mt-5 border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}
        {message && (
          <p
            role="status"
            className="mt-5 border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
          >
            {message}
          </p>
        )}

        <section className="mt-6 border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-slate-900">Appearance</h2>
          <p className="mt-1 text-sm text-slate-500">
            Choose your display theme.
          </p>
          <div
            className="mt-4 inline-flex border border-slate-200 p-1"
            role="group"
            aria-label="Color theme"
          >
            <button
              type="button"
              aria-pressed={theme === "light"}
              onClick={() => setTheme("light")}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium ${theme === "light" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
            >
              <FiSun aria-hidden="true" /> Light
            </button>
            <button
              type="button"
              aria-pressed={theme === "dark"}
              onClick={() => setTheme("dark")}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium ${theme === "dark" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
            >
              <FiMoon aria-hidden="true" /> Dark
            </button>
          </div>
        </section>

        <section className="mt-5 border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-semibold text-slate-900">
                Encrypted vault
              </h2>
              <p className="mt-1 text-sm leading-5 text-slate-500">
                {loadingVault
                  ? "Checking vault status..."
                  : vault?.configured
                    ? "Your notes stay encrypted. Manage the PIN prompt for this browser."
                    : "Create a vault PIN to encrypt your notes and enable note sharing."}
              </p>
            </div>
            {loadingVault && (
              <FiLoader className="animate-spin text-slate-400" />
            )}
          </div>

          {!loadingVault && !vault?.configured && (
            <form onSubmit={createVaultPin} className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                New PIN or passphrase
                <input
                  type="password"
                  value={pin}
                  onChange={(event) => setPin(event.target.value)}
                  minLength={MIN_PIN_LENGTH}
                  maxLength={128}
                  autoComplete="new-password"
                  required
                  className="mt-1.5 w-full border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-900"
                />
              </label>
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
                  className="mt-1.5 w-full border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-900"
                />
              </label>
              <label className="flex items-start gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={pinRequired}
                  onChange={(event) => setPinRequired(event.target.checked)}
                  className="mt-1 accent-slate-900"
                />
                <span>Ask for my PIN when opening notes in this browser</span>
              </label>
              {!pinRequired && (
                <p className="border-l-2 border-amber-500 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
                  This browser will keep a device key for automatic access. Keep
                  your PIN to open the vault on other browsers or after clearing
                  this browser&apos;s data.
                </p>
              )}
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saving && <FiLoader className="animate-spin" />}
                Create encrypted vault
              </button>
            </form>
          )}

          {!loadingVault && vault?.configured && (
            <div className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Current PIN or passphrase
                <input
                  type="password"
                  value={pin}
                  onChange={(event) => setPin(event.target.value)}
                  maxLength={128}
                  autoComplete="current-password"
                  className="mt-1.5 w-full border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-900"
                />
              </label>
              <label className="flex items-center justify-between gap-4 border-t border-slate-100 pt-4 text-sm">
                <span>
                  <span className="block font-semibold text-slate-800">
                    Require PIN on this browser
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    {pinRequired
                      ? "Notes ask for your PIN when opened."
                      : "Notes open automatically on this browser."}
                  </span>
                </span>
                <input
                  type="checkbox"
                  role="switch"
                  aria-label="Require PIN on this browser"
                  checked={pinRequired}
                  disabled={saving}
                  onChange={updatePinRequirement}
                  className="h-5 w-5 shrink-0 accent-slate-900"
                />
              </label>
              <p className="border-l-2 border-amber-500 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
                When off, this browser stores a non-exportable device key.
                Anyone with access to this browser profile can open your notes.
                Other browsers still require your PIN; clearing site data
                removes the device key.
              </p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
};

export default Settings;
