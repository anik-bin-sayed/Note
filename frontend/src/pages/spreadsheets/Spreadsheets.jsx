import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FiGrid,
  FiList,
  FiMoon,
  FiPlus,
  FiSearch,
  FiSun,
} from "react-icons/fi";
import SpreadsheetCard from "../../components/spreadsheet/SpreadsheetCard";
import { useSpreadsheets } from "../../context/SpreadsheetContext";
import { useTheme } from "../../context/ThemeContext";
import "../../styles/spreadsheet.css";

const Spreadsheets = () => {
  const navigate = useNavigate();
  const {
    workbooks,
    createSpreadsheet,
    updateSpreadsheet,
    deleteSpreadsheet,
    duplicateSpreadsheet,
  } = useSpreadsheets();
  const { theme, setTheme } = useTheme();
  const [search, setSearch] = useState("");
  const [searchParams] = useSearchParams();
  const [view, setView] = useState("grid");
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const filter = searchParams.get("filter") || "recent";

  const recent = useMemo(() => {
    const query = search.trim().toLowerCase();
    return [...workbooks]
      .filter((workbook) => filter !== "favorites" || workbook.favorite)
      .filter((workbook) =>
        `${workbook.name} ${workbook.description}`
          .toLowerCase()
          .includes(query),
      )
      .sort(
        (left, right) =>
          Date.parse(right.updatedAt) - Date.parse(left.updatedAt),
      );
  }, [workbooks, search, filter]);

  const submitCreate = (event) => {
    event.preventDefault();
    const workbook = createSpreadsheet(
      newName.trim() || "Untitled spreadsheet",
    );
    setShowCreate(false);
    setNewName("");
    navigate(`/spreadsheets/${workbook.id}`);
  };

  const renameSpreadsheet = (spreadsheet) => {
    const name = window.prompt("Rename spreadsheet", spreadsheet.name);
    if (name?.trim()) updateSpreadsheet(spreadsheet.id, { name: name.trim() });
  };

  const confirmDelete = (spreadsheet) => {
    if (
      window.confirm(`Delete “${spreadsheet.name}”? This cannot be undone.`)
    ) {
      deleteSpreadsheet(spreadsheet.id);
    }
  };

  return (
    <main className="spreadsheet-shell spreadsheet-home min-h-screen">
      <header className="spreadsheet-home-header">
        <div className="spreadsheet-home-brand">
          <span className="spreadsheet-brand-mark" aria-hidden="true">
            <FiGrid />
          </span>
          <span>Gridworks</span>
          <span className="spreadsheet-brand-divider">/</span>
          <span className="spreadsheet-brand-section">Workspace</span>
        </div>
        <button
          type="button"
          className="spreadsheet-icon-button"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <FiSun /> : <FiMoon />}
        </button>
      </header>

      <section className="spreadsheet-home-content">
        <div className="spreadsheet-page-heading">
          <div>
            <p className="spreadsheet-eyebrow">YOUR WORKSPACE</p>
            <h1>Spreadsheets</h1>
            <p className="spreadsheet-page-subtitle">
              Keep plans, numbers, and projects in one clear place.
            </p>
          </div>
          <button
            type="button"
            className="spreadsheet-primary-button"
            onClick={() => setShowCreate(true)}
          >
            <FiPlus aria-hidden="true" /> New spreadsheet
          </button>
        </div>

        <div className="spreadsheet-list-controls">
          <label className="spreadsheet-search">
            <FiSearch aria-hidden="true" />
            <input
              type="search"
              placeholder="Search spreadsheets"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <span className="sr-only">Search spreadsheets</span>
          </label>
          <div
            className="spreadsheet-view-toggle"
            role="group"
            aria-label="Spreadsheet view"
          >
            <button
              type="button"
              aria-label="Grid view"
              aria-pressed={view === "grid"}
              onClick={() => setView("grid")}
            >
              <FiGrid />
            </button>
            <button
              type="button"
              aria-label="List view"
              aria-pressed={view === "list"}
              onClick={() => setView("list")}
            >
              <FiList />
            </button>
          </div>
        </div>

        <div className="spreadsheet-section-heading">
          <h2>
            {search
              ? "Search results"
              : filter === "favorites"
                ? "Favorites"
                : "Recent spreadsheets"}
          </h2>
          <span>{recent.length} files</span>
        </div>

        {recent.length ? (
          <div
            className={`spreadsheet-card-list spreadsheet-card-list-${view}`}
          >
            {recent.map((spreadsheet) => (
              <SpreadsheetCard
                key={spreadsheet.id}
                spreadsheet={spreadsheet}
                view={view}
                onFavorite={(id) => {
                  const current = workbooks.find((item) => item.id === id);
                  updateSpreadsheet(id, { favorite: !current?.favorite });
                }}
                onRename={renameSpreadsheet}
                onDuplicate={duplicateSpreadsheet}
                onDelete={confirmDelete}
              />
            ))}
          </div>
        ) : (
          <div className="spreadsheet-empty-state">
            <FiSearch aria-hidden="true" />
            <h2>No spreadsheets found</h2>
            <p>Try a different search, or create a new spreadsheet.</p>
          </div>
        )}
      </section>

      {showCreate && (
        <div
          className="spreadsheet-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowCreate(false);
          }}
        >
          <form className="spreadsheet-modal" onSubmit={submitCreate}>
            <p className="spreadsheet-eyebrow">NEW FILE</p>
            <h2>Create a spreadsheet</h2>
            <label>
              Name
              <input
                autoFocus
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                placeholder="Untitled spreadsheet"
                maxLength={80}
              />
            </label>
            <div className="spreadsheet-modal-actions">
              <button
                type="button"
                className="spreadsheet-secondary-button"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </button>
              <button type="submit" className="spreadsheet-primary-button">
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
};

export default Spreadsheets;
