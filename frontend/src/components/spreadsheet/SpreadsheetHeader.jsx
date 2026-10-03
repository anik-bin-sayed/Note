import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiCheck,
  FiChevronDown,
  FiCopy,
  FiDownload,
  FiMoreVertical,
  FiMoon,
  FiShare2,
  FiSun,
  FiTrash2,
} from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";

const SpreadsheetHeader = ({
  workbook,
  onRename,
  onDuplicate,
  onDelete,
  onExport,
}) => {
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(workbook.name);
  const [toast, setToast] = useState("");
  const { theme, setTheme } = useTheme();

  const commitName = () => {
    const name = nameDraft.trim();
    if (name) onRename(name);
    else setNameDraft(workbook.name);
    setEditingName(false);
  };

  const shareDemo = () => {
    setToast("This demo is saved only in this browser");
    window.setTimeout(() => setToast(""), 2200);
  };

  return (
    <header className="spreadsheet-editor-header">
      <div className="spreadsheet-editor-identity">
        <Link
          to="/spreadsheets"
          className="spreadsheet-icon-button"
          aria-label="Back to spreadsheets"
          title="Back to spreadsheets"
        >
          <FiArrowLeft />
        </Link>
        <div className="spreadsheet-editor-title-wrap">
          {editingName ? (
            <input
              autoFocus
              className="spreadsheet-title-input"
              value={nameDraft}
              maxLength={80}
              onChange={(event) => setNameDraft(event.target.value)}
              onBlur={commitName}
              onKeyDown={(event) => {
                if (event.key === "Enter") commitName();
                if (event.key === "Escape") {
                  setNameDraft(workbook.name);
                  setEditingName(false);
                }
              }}
              aria-label="Spreadsheet name"
            />
          ) : (
            <button
              type="button"
              className="spreadsheet-title-button"
              onClick={() => {
                setNameDraft(workbook.name);
                setEditingName(true);
              }}
              title="Rename spreadsheet"
            >
              <span>{workbook.name}</span>
              <FiChevronDown aria-hidden="true" />
            </button>
          )}
          <span className="spreadsheet-save-status">
            <FiCheck aria-hidden="true" /> Saved on this device
          </span>
        </div>
      </div>

      <div className="spreadsheet-editor-header-actions">
        {toast && (
          <span className="spreadsheet-toast" role="status">
            {toast}
          </span>
        )}
        <button
          type="button"
          className="spreadsheet-share-button"
          onClick={shareDemo}
          title="Copy spreadsheet link"
        >
          <FiShare2 aria-hidden="true" /> Share
        </button>
        <button
          type="button"
          className="spreadsheet-icon-button"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <FiSun /> : <FiMoon />}
        </button>
        <details className="spreadsheet-menu">
          <summary
            className="spreadsheet-icon-button"
            title="More spreadsheet actions"
            aria-label="More spreadsheet actions"
          >
            <FiMoreVertical />
          </summary>
          <div className="spreadsheet-menu-popover">
            <button type="button" onClick={onExport}>
              <FiDownload aria-hidden="true" /> Download CSV
            </button>
            <button type="button" onClick={onDuplicate}>
              <FiCopy aria-hidden="true" /> Make a copy
            </button>
            <button type="button" className="is-danger" onClick={onDelete}>
              <FiTrash2 aria-hidden="true" /> Delete spreadsheet
            </button>
          </div>
        </details>
      </div>
    </header>
  );
};

export default SpreadsheetHeader;
