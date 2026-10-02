// react
import { useState } from "react";
import { useLocation } from "react-router-dom";

// react icons
import { FcGoogle } from "react-icons/fc";
import { FiFileText, FiShield } from "react-icons/fi";

const Login = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    setLoading(true);

    try {
      const returnPath = location.state?.from;
      if (returnPath?.startsWith("/") && !returnPath.startsWith("//")) {
        sessionStorage.setItem("postLoginPath", returnPath);
      }
      window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 py-10">
      {/* Background decoration */}
      <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 rounded-full bg-indigo-100/50 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-purple-100/50 blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-7 flex gap-4 items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-600 to-purple-600 shadow-xl shadow-indigo-200">
            <FiFileText className="text-3xl text-white" />
          </div>

          <div>
            <h1 className=" text-2xl font-bold tracking-tight text-slate-900">
              Note
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Your thoughts, organized beautifully. (Don't use AI)
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-6 shadow-xl shadow-slate-200/60 backdrop-blur sm:p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Sign in to continue to your Note account
            </p>
          </div>

          {/* Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <FcGoogle className="text-xl" />
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="my-7 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-medium text-slate-400">
              SECURE LOGIN
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* Security Info */}
          <div className="flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50/70 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm">
              <FiShield className="text-lg" />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-800">
                Safe & Secure
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Your account is securely authenticated through Google.
              </p>
            </div>
          </div>

          {/* Terms */}
          <p className="mt-6 text-center text-xs leading-5 text-slate-400">
            By continuing, you agree to our{" "}
            <button
              type="button"
              className="font-medium text-slate-600 hover:text-indigo-600"
            >
              Terms of Service
            </button>{" "}
            and{" "}
            <button
              type="button"
              className="font-medium text-slate-600 hover:text-indigo-600"
            >
              Privacy Policy
            </button>
            .
          </p>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Note. All rights reserved.
        </p>
      </div>
    </main>
  );
};

export default Login;
