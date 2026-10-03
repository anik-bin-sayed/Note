import { useState } from "react";
import {
  FiBookOpen,
  FiChevronDown,
  FiLogOut,
  FiMoon,
  FiSettings,
  FiSun,
  FiUser,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import NotificationCenter from "./NotificationCenter";
import { useTheme } from "../context/ThemeContext";

const Navbar = ({ user, logout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          to={"/dashboard"}
          className="border px-2 py-1 rounded-xl bg-gray-300/40 border-gray-300/50"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
              <FiBookOpen className="text-xl" />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                Note
              </h1>

              <p className="hidden text-xs text-slate-500 sm:block">
                Your personal knowledge space
              </p>
            </div>
          </div>
        </Link>
        {/* User Section */}
        <div className="flex items-center gap-3">
          <div
            className="relative"
            onMouseEnter={() => setMenuOpen(true)}
            onMouseLeave={() => setMenuOpen(false)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setMenuOpen(false);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") setMenuOpen(false);
            }}
          >
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              onFocus={() => setMenuOpen(true)}
              className="flex items-center gap-3 border border-slate-200 bg-slate-50 px-2 py-1.5 text-left hover:bg-slate-100 sm:px-3"
            >
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="h-9 w-9 rounded-full border border-slate-200 object-cover"
                />
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                  <FiUser className="text-lg" aria-hidden="true" />
                </span>
              )}
              <span className="hidden max-w-[150px] sm:block">
                <span className="block truncate text-sm font-semibold text-slate-800">
                  {user?.name || "User"}
                </span>
                <span className="block truncate text-xs text-slate-500">
                  {user?.email || "Account"}
                </span>
              </span>
              <FiChevronDown
                className="hidden text-sm text-slate-400 sm:block"
                aria-hidden="true"
              />
            </button>

            {menuOpen && (
              <div
                role="menu"
                aria-label="Account menu"
                className="absolute right-0 top-full z-50 mt-1 w-64 border border-slate-200 bg-white p-2 shadow-xl"
              >
                <Link
                  role="menuitem"
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <FiUser aria-hidden="true" /> Profile
                </Link>
                <Link
                  role="menuitem"
                  to="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <FiSettings aria-hidden="true" /> Settings
                </Link>
                <div className="mt-2 border-t border-slate-200 px-2 pt-3">
                  <p className="px-1 pb-2 text-xs font-semibold text-slate-500">
                    Appearance
                  </p>
                  <div
                    className="grid grid-cols-2 border border-slate-200 p-1"
                    role="group"
                    aria-label="Color theme"
                  >
                    <button
                      type="button"
                      aria-pressed={theme === "light"}
                      onClick={() => setTheme("light")}
                      className={`flex items-center justify-center gap-2 px-2 py-2 text-xs font-semibold ${theme === "light" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
                    >
                      <FiSun aria-hidden="true" /> Light
                    </button>
                    <button
                      type="button"
                      aria-pressed={theme === "dark"}
                      onClick={() => setTheme("dark")}
                      className={`flex items-center justify-center gap-2 px-2 py-2 text-xs font-semibold ${theme === "dark" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
                    >
                      <FiMoon aria-hidden="true" /> Dark
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <NotificationCenter />

          {/* Logout */}
          <button
            type="button"
            onClick={logout}
            className="group flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-95"
          >
            <FiLogOut className="text-base transition-transform duration-200 group-hover:-translate-x-0.5" />

            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
