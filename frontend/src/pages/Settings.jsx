import { useEffect, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
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
import Appearance from "../components/Settings/Appearance";
import EncryptedVault from "../components/Settings/EncryptedVault";

const MIN_PIN_LENGTH = 8;

const getErrorMessage = (error) => {
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (typeof error?.message === "string") return error.message;
  return "Could not update vault settings. Please try again.";
};

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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

        <Appearance theme={theme} setTheme={setTheme} />

        <EncryptedVault
          loadingVault={loadingVault}
          vault={vault}
          pin={pin}
          confirmation={confirmation}
          pinRequired={pinRequired}
          saving={saving}
          createVaultPin={createVaultPin}
          updatePinRequirement={updatePinRequirement}
          setPin={setPin}
          setConfirmation={setConfirmation}
          setPinRequired={setPinRequired}
          MIN_PIN_LENGTH={MIN_PIN_LENGTH}
        />
      </section>
    </main>
  );
};

export default Settings;
