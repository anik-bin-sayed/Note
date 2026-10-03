import { FiMoon, FiSun } from "react-icons/fi";

const Appearance = ({ theme, setTheme }) => {
  return (
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
          className={` navbar-menu-item inline-flex items-center gap-2 px-4 py-2 text-sm font-medium ${theme === "light" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
        >
          <FiSun aria-hidden="true" /> Light
        </button>
        <button
          type="button"
          aria-pressed={theme === "dark"}
          onClick={() => setTheme("dark")}
          className={`navbar-menu-item-dark inline-flex items-center gap-2 px-4 py-2 text-sm font-medium ${theme === "dark" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
        >
          <FiMoon aria-hidden="true" /> Dark
        </button>
      </div>
    </section>
  );
};

export default Appearance;
