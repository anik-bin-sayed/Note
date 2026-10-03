import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";
import { SpreadsheetProvider } from "../context/SpreadsheetContext";
import "../styles/application-layout.css";

const getPageTitle = (pathname) => {
  if (pathname.startsWith("/notes")) return "Notes";
  if (pathname.startsWith("/spreadsheets")) return "Spreadsheets";
  if (pathname === "/settings") return "Settings";
  if (pathname === "/profile") return "Profile";
  return "Home";
};

const ApplicationLayout = () => {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const authenticated = Boolean(user);

  return (
    <SpreadsheetProvider>
      <div
        className="application-layout"
        onKeyDown={(event) => {
          if (event.key === "Escape") setMobileOpen(false);
        }}
      >
        {authenticated && <Navbar user={user} logout={logout} />}

        <div
          className={`application-layout-body ${authenticated ? "has-navbar" : ""}`}
        >
          <Sidebar
            mobileOpen={mobileOpen}
            onNavigate={() => setMobileOpen(false)}
          />
          {mobileOpen && (
            <button
              type="button"
              className="application-sidebar-backdrop"
              aria-label="Close navigation"
              onClick={() => setMobileOpen(false)}
            />
          )}

          <div className="application-layout-main">
            <div className="application-mobile-bar">
              <button
                type="button"
                className="application-mobile-menu-button"
                aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((open) => !open)}
              >
                {mobileOpen ? <FiX /> : <FiMenu />}
              </button>
              <span>{getPageTitle(pathname)}</span>
            </div>
            <div className="application-route-content">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </SpreadsheetProvider>
  );
};

export default ApplicationLayout;
