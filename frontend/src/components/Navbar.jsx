import { FiBookOpen, FiLogOut, FiUser, FiChevronDown } from "react-icons/fi";
import { Link } from "react-router-dom";

const Navbar = ({ user, logout }) => {
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
          {/* User Info */}
          <Link
            to="/profile"
            className="hidden items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 sm:flex"
          >
            {/* Profile Picture */}
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user?.name || "User"}
                referrerPolicy="no-referrer"
                className="h-9 w-9 rounded-full border border-slate-200 object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                <FiUser className="text-lg" />
              </div>
            )}
            {/* Name & Email */}
            <div className="max-w-[150px]">
              <p className="truncate text-sm font-semibold text-slate-800">
                {user?.name || "User"}
              </p>

              <p className="truncate text-xs text-slate-500">
                {user?.email || "Account"}
              </p>
            </div>
            <FiChevronDown className="text-sm text-slate-400" />
          </Link>

          {/* Mobile Avatar */}
          <Link to="/profile" className="sm:hidden">
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user?.name || "User"}
                referrerPolicy="no-referrer"
                className="h-9 w-9 rounded-full border border-slate-200 object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <FiUser />
              </div>
            )}
          </Link>

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
