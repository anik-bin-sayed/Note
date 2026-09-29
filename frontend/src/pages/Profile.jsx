import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiHash,
  FiLogOut,
  FiMail,
  FiShield,
  FiUser,
} from "react-icons/fi";

const Profile = () => {
  const navigate = useNavigate();

  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <main className="h-screen overflow-y-auto bg-slate-50 text-slate-900">
      <div className="flex min-h-full w-full items-center justify-center px-0 py-0 sm:px-6 sm:py-6">
        <div className="flex min-h-full w-full max-w-2xl flex-col justify-center border border-slate-200 bg-white shadow-sm sm:min-h-0 rounded">
          <div className="px-5 py-6 sm:px-8 sm:py-7">
            {/* Profile */}
            <div className=" flex flex-col gap-5 lg:flex-row items-center ">
              {/* Profile Image */}
              <div className="rounded-full border border-slate-200 bg-white p-1 shadow-sm">
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt={user?.name || "User"}
                    referrerPolicy="no-referrer"
                    className="h-24 w-24 rounded-full object-cover sm:h-28 sm:w-28"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-900 text-3xl font-bold text-white sm:h-28 sm:w-28">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}
              </div>

              {/* Name */}
              <div className="mt-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    {user?.name || "User"}
                  </h1>

                  <FiCheckCircle className="text-indigo-500" />
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {user?.email || "No email available"}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="my-5 h-px bg-slate-100" />

            {/* Account Information */}
            <div className="mb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <FiShield />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Account Information
                  </h2>

                  <p className="text-xs text-slate-400">
                    Your personal account details
                  </p>
                </div>
              </div>
            </div>

            {/* Information */}
            <div className="space-y-2.5">
              {/* Name */}
              <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-3.5 transition hover:border-slate-300">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <FiUser />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-400">
                    Full Name
                  </p>

                  <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                    {user?.name || "N/A"}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-3.5 transition hover:border-slate-300">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                  <FiMail />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-400">
                    Email Address
                  </p>

                  <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                    {user?.email || "N/A"}
                  </p>
                </div>
              </div>

              {/* User ID */}
              <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-3.5 transition hover:border-slate-300">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-pink-50 text-pink-600">
                  <FiHash />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-400">User ID</p>

                  <p className="mt-1 break-all text-sm font-semibold text-slate-700">
                    {user?.id || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Google Authentication */}
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm">
                <FiCheckCircle />
              </div>

              <div>
                <p className="text-sm font-semibold text-emerald-800">
                  Google Account Connected
                </p>

                <p className="mt-0.5 text-xs text-emerald-700/70">
                  Your account is authenticated with Google.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
              >
                <FiArrowLeft />
                Back to Dashboard
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 active:scale-[0.98]"
              >
                <FiLogOut />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Profile;
