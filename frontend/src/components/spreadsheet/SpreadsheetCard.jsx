import { useRef } from "react";
import { Link } from "react-router-dom";
import {
  FiClock,
  FiFileText,
  FiMoreVertical,
  FiStar,
  FiTrash2,
  FiCopy,
} from "react-icons/fi";

const formatModified = (value) => {
  const minutes = Math.max(
    0,
    Math.floor((Date.now() - Date.parse(value)) / 60_000),
  );
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
};

const SpreadsheetCard = ({
  spreadsheet,
  view,
  onFavorite,
  onRename,
  onDuplicate,
  onDelete,
}) => {
  const menuRef = useRef(null);

  const closeMenu = () => {
    if (menuRef.current) menuRef.current.open = false;
  };

  return (
    <article className={`spreadsheet-card spreadsheet-card-${view}`}>
      <Link
        to={`/spreadsheets/${spreadsheet.id}`}
        className="spreadsheet-card-main"
      >
        <span className="spreadsheet-card-icon" aria-hidden="true">
          <FiFileText />
        </span>
        <span className="spreadsheet-card-copy">
          <span className="spreadsheet-card-title">{spreadsheet.name}</span>
          <span className="spreadsheet-card-description">
            {spreadsheet.description}
          </span>
        </span>
      </Link>

      <div className="spreadsheet-card-meta">
        <span className="spreadsheet-meta-item">
          <FiClock aria-hidden="true" /> {formatModified(spreadsheet.updatedAt)}
        </span>
        <span>
          {spreadsheet.columnCount} columns · {spreadsheet.rowCount} rows
        </span>
      </div>

      <div className="spreadsheet-card-actions">
        <button
          type="button"
          title={spreadsheet.favorite ? "Remove favorite" : "Add favorite"}
          aria-label={spreadsheet.favorite ? "Remove favorite" : "Add favorite"}
          aria-pressed={spreadsheet.favorite}
          onClick={() => onFavorite(spreadsheet.id)}
          className={`spreadsheet-icon-button ${spreadsheet.favorite ? "is-favorite" : ""}`}
        >
          <FiStar aria-hidden="true" />
        </button>
        <details className="spreadsheet-menu" ref={menuRef}>
          <summary
            className="spreadsheet-icon-button"
            title="More actions"
            aria-label={`More actions for ${spreadsheet.name}`}
          >
            <FiMoreVertical aria-hidden="true" />
          </summary>
          <div className="spreadsheet-menu-popover">
            <button
              type="button"
              onClick={() => {
                onRename(spreadsheet);
                closeMenu();
              }}
            >
              Rename
            </button>
            <button
              type="button"
              onClick={() => {
                onDuplicate(spreadsheet.id);
                closeMenu();
              }}
            >
              <FiCopy aria-hidden="true" /> Make a copy
            </button>
            <button
              type="button"
              className="is-danger"
              onClick={() => {
                onDelete(spreadsheet);
                closeMenu();
              }}
            >
              <FiTrash2 aria-hidden="true" /> Delete
            </button>
          </div>
        </details>
      </div>
    </article>
  );
};

export default SpreadsheetCard;
