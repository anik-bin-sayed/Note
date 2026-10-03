import { FiLoader } from "react-icons/fi";

const EncryptedVault = ({
  loadingVault,
  vault,
  pin,
  confirmation,
  pinRequired,
  saving,
  createVaultPin,
  updatePinRequirement,
  setPin,
  setConfirmation,
  setPinRequired,
  MIN_PIN_LENGTH,
}) => {
  return (
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
        {loadingVault && <FiLoader className="animate-spin text-slate-400" />}
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
            When off, this browser stores a non-exportable device key. Anyone
            with access to this browser profile can open your notes. Other
            browsers still require your PIN; clearing site data removes the
            device key.
          </p>
        </div>
      )}
    </section>
  );
};

export default EncryptedVault;
