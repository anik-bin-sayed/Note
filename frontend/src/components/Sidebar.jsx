import { NavLink, useLocation } from "react-router-dom";
import {
  FiBookOpen,
  FiClock,
  FiGrid,
  FiHome,
  FiSettings,
  FiStar,
} from "react-icons/fi";

const Sidebar = ({ mobileOpen, onNavigate }) => {
  const { pathname, search } = useLocation();
  const filter = new URLSearchParams(search).get("filter");
  const spreadsheetRoute = pathname.startsWith("/spreadsheets");
  const homeActive = pathname === "/dashboard";
  const notesActive = pathname === "/notes" || pathname.startsWith("/notes/");
  const recentActive = pathname === "/spreadsheets" && filter === "recent";
  const favoritesActive =
    pathname === "/spreadsheets" && filter === "favorites";
  const spreadsheetsActive =
    spreadsheetRoute && !recentActive && !favoritesActive;
  const settingsActive = pathname === "/settings";

  const navItemClass = (active) =>
    `application-nav-item ${active ? "is-active" : ""}`;

  return (
    <aside
      className={`application-sidebar ${mobileOpen ? "is-open" : ""}`}
      aria-label="Workspace navigation"
    >
      <nav className="application-sidebar-nav">
        <NavLink
          to="/dashboard"
          className={navItemClass(homeActive)}
          aria-current={homeActive ? "page" : undefined}
          onClick={onNavigate}
        >
          <FiHome aria-hidden="true" /> <span>Home</span>
        </NavLink>

        <p className="application-sidebar-label">Workspace</p>
        <NavLink
          to="/notes"
          className={navItemClass(notesActive)}
          aria-current={notesActive ? "page" : undefined}
          onClick={onNavigate}
        >
          <FiBookOpen aria-hidden="true" /> <span>Notes</span>
        </NavLink>
        <NavLink
          to="/spreadsheets"
          className={navItemClass(spreadsheetsActive)}
          aria-current={spreadsheetsActive ? "page" : undefined}
          onClick={onNavigate}
        >
          <FiGrid aria-hidden="true" /> <span>Spreadsheets</span>
        </NavLink>

        <p className="application-sidebar-label">Browse</p>
        <NavLink
          to="/spreadsheets?filter=recent"
          className={navItemClass(recentActive)}
          aria-current={recentActive ? "page" : undefined}
          onClick={onNavigate}
        >
          <FiClock aria-hidden="true" /> <span>Recent</span>
        </NavLink>
        <NavLink
          to="/spreadsheets?filter=favorites"
          className={navItemClass(favoritesActive)}
          aria-current={favoritesActive ? "page" : undefined}
          onClick={onNavigate}
        >
          <FiStar aria-hidden="true" /> <span>Favorites</span>
        </NavLink>
      </nav>

      <div className="application-sidebar-footer">
        <NavLink
          to="/settings"
          className={navItemClass(settingsActive)}
          aria-current={settingsActive ? "page" : undefined}
          onClick={onNavigate}
        >
          <FiSettings aria-hidden="true" /> <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
