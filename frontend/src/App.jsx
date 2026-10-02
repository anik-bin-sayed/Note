import { useEffect, useState } from "react";
import { FiMoon, FiSun } from "react-icons/fi";
import Index from "./Index";

const getInitialTheme = () => {
  try {
    const savedTheme = window.localStorage.getItem("note-theme");
    if (savedTheme === "dark" || savedTheme === "light") return savedTheme;
  } catch {
    // Storage can be unavailable in restricted browser contexts.
  }

  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches
    ? "dark"
    : "light";
};

const App = () => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;

    try {
      window.localStorage.setItem("note-theme", theme);
    } catch {
      // Keep the selected theme for this session when storage is unavailable.
    }
  }, [theme]);

  const isDark = theme === "dark";

  return (
    <>
      <Index />
      <button
        type="button"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="theme-toggle fixed bottom-5 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border shadow-lg transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2"
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        title={`Switch to ${isDark ? "light" : "dark"} mode`}
      >
        {isDark ? <FiSun aria-hidden="true" /> : <FiMoon aria-hidden="true" />}
      </button>
    </>
  );
};

export default App;
