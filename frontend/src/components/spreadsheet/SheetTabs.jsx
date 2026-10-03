import { useState } from "react";
import { FiCopy, FiMoreVertical, FiPlus, FiTrash2 } from "react-icons/fi";

const SheetTabs = ({
  sheets,
  activeSheetId,
  onSelect,
  onAdd,
  onRename,
  onDuplicate,
  onDelete,
}) => {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState("");

  const beginRename = (sheet) => {
    setEditingId(sheet.id);
    setDraft(sheet.name);
  };

  const commitRename = (id) => {
    if (draft.trim()) onRename(id, draft.trim());
    setEditingId(null);
  };

  return (
    <div className="spreadsheet-sheet-tabs" role="tablist" aria-label="Sheets">
      <button
        type="button"
        className="spreadsheet-add-sheet"
        title="Add sheet"
        aria-label="Add sheet"
        onClick={onAdd}
      >
        <FiPlus />
      </button>
      <div className="spreadsheet-sheet-tab-list">
        {sheets.map((sheet) => (
          <div
            className={`spreadsheet-sheet-tab ${activeSheetId === sheet.id ? "is-active" : ""}`}
            key={sheet.id}
            role="presentation"
          >
            {editingId === sheet.id ? (
              <input
                autoFocus
                value={draft}
                maxLength={40}
                aria-label="Sheet name"
                onChange={(event) => setDraft(event.target.value)}
                onBlur={() => commitRename(sheet.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") commitRename(sheet.id);
                  if (event.key === "Escape") setEditingId(null);
                }}
              />
            ) : (
              <button
                type="button"
                role="tab"
                aria-selected={activeSheetId === sheet.id}
                className="spreadsheet-sheet-tab-name"
                onClick={() => onSelect(sheet.id)}
                onDoubleClick={() => beginRename(sheet)}
              >
                {sheet.name}
              </button>
            )}
            <details className="spreadsheet-menu spreadsheet-sheet-menu">
              <summary
                className="spreadsheet-icon-button"
                title={`Actions for ${sheet.name}`}
                aria-label={`Actions for ${sheet.name}`}
              >
                <FiMoreVertical />
              </summary>
              <div className="spreadsheet-menu-popover">
                <button type="button" onClick={() => beginRename(sheet)}>
                  Rename sheet
                </button>
                <button type="button" onClick={() => onDuplicate(sheet.id)}>
                  <FiCopy aria-hidden="true" /> Duplicate sheet
                </button>
                <button
                  type="button"
                  className="is-danger"
                  disabled={sheets.length < 2}
                  onClick={() => onDelete(sheet.id)}
                >
                  <FiTrash2 aria-hidden="true" /> Delete sheet
                </button>
              </div>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SheetTabs;
