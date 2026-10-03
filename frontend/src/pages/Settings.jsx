import { FiArrowLeft, FiMoon, FiSun } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

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

        <section className="mt-6 border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-slate-900">Appearance</h2>
          <p className="mt-1 text-sm text-slate-500">Choose your display theme.</p>
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
      </section>
    </main>
  );
};

export default Settings;