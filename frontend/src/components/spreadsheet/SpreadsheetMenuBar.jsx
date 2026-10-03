const MENUS = [
  [
    "File",
    [
      ["Rename spreadsheet", "rename"],
      ["Download CSV", "export"],
      ["Make a copy", "duplicate"],
      ["Delete spreadsheet", "delete"],
    ],
  ],
  [
    "Edit",
    [
      ["Undo", "undo"],
      ["Redo", "redo"],
      ["Clear selected cells", "clear"],
    ],
  ],
  ["View", [["Toggle gridlines", "gridlines"]]],
  [
    "Insert",
    [
      ["Row below", "add-row"],
      ["Column right", "add-column"],
      ["New sheet", "add-sheet"],
    ],
  ],
  [
    "Format",
    [
      ["Bold", "bold"],
      ["Italic", "italic"],
      ["Underline", "underline"],
      ["Currency format", "currency"],
      ["Percentage format", "percentage"],
    ],
  ],
  ["Data", [["Show selection summary", "summary"]]],
  ["Tools", [["Keyboard shortcuts", "shortcuts"]]],
];

const SpreadsheetMenuBar = ({ onAction }) => (
  <nav className="spreadsheet-menu-bar" aria-label="Spreadsheet menus">
    {MENUS.map(([name, items]) => (
      <details
        className="spreadsheet-menu spreadsheet-menu-bar-item"
        key={name}
      >
        <summary>{name}</summary>
        <div className="spreadsheet-menu-popover">
          {items.map(([label, action]) => (
            <button
              type="button"
              key={action}
              onClick={(event) => {
                onAction(action);
                event.currentTarget.closest("details").open = false;
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </details>
    ))}
  </nav>
);

export default SpreadsheetMenuBar;
