import {
  FiAlignCenter,
  FiAlignLeft,
  FiAlignRight,
  FiBold,
  FiColumns,
  FiItalic,
  FiMinus,
  FiPlus,
  FiRotateCcw,
  FiRotateCw,
  FiTrash2,
  FiUnderline,
} from "react-icons/fi";

const ToolButton = ({
  title,
  active = false,
  disabled = false,
  onClick,
  children,
}) => (
  <button
    type="button"
    className={`spreadsheet-tool-button ${active ? "is-active" : ""}`}
    title={title}
    aria-label={title}
    aria-pressed={active}
    disabled={disabled}
    onClick={onClick}
  >
    {children}
  </button>
);

const SpreadsheetToolbar = ({
  style = {},
  onStyle,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onAddRow,
  onDeleteRow,
  onAddColumn,
  onDeleteColumn,
}) => (
  <div
    className="spreadsheet-toolbar"
    role="toolbar"
    aria-label="Cell formatting"
  >
    <div className="spreadsheet-toolbar-group">
      <ToolButton title="Undo" onClick={onUndo} disabled={!canUndo}>
        <FiRotateCcw />
      </ToolButton>
      <ToolButton title="Redo" onClick={onRedo} disabled={!canRedo}>
        <FiRotateCw />
      </ToolButton>
    </div>
    <span className="spreadsheet-toolbar-divider" />
    <div className="spreadsheet-toolbar-group">
      <ToolButton title="Add row" onClick={onAddRow}>
        <FiPlus /> <span>Row</span>
      </ToolButton>
      <ToolButton title="Delete selected row" onClick={onDeleteRow}>
        <FiTrash2 /> <span>Row</span>
      </ToolButton>
      <ToolButton title="Add column" onClick={onAddColumn}>
        <FiPlus /> <FiColumns />
      </ToolButton>
      <ToolButton title="Delete selected column" onClick={onDeleteColumn}>
        <FiTrash2 /> <FiColumns />
      </ToolButton>
    </div>
    <span className="spreadsheet-toolbar-divider" />
    <div className="spreadsheet-toolbar-group">
      <ToolButton
        title="Bold"
        active={style.bold}
        onClick={() => onStyle("bold", !style.bold)}
      >
        <FiBold />
      </ToolButton>
      <ToolButton
        title="Italic"
        active={style.italic}
        onClick={() => onStyle("italic", !style.italic)}
      >
        <FiItalic />
      </ToolButton>
      <ToolButton
        title="Underline"
        active={style.underline}
        onClick={() => onStyle("underline", !style.underline)}
      >
        <FiUnderline />
      </ToolButton>
      <label className="spreadsheet-color-control" title="Text color">
        <span className="spreadsheet-color-symbol">A</span>
        <input
          type="color"
          aria-label="Text color"
          value={style.color || "#17241d"}
          onChange={(event) => onStyle("color", event.target.value)}
        />
      </label>
      <label
        className="spreadsheet-color-control"
        title="Cell background color"
      >
        <span className="spreadsheet-fill-symbol">▰</span>
        <input
          type="color"
          aria-label="Cell background color"
          value={style.background || "#ffffff"}
          onChange={(event) => onStyle("background", event.target.value)}
        />
      </label>
      <ToolButton
        title="Borders"
        active={style.border}
        onClick={() => onStyle("border", !style.border)}
      >
        <FiMinus />
      </ToolButton>
    </div>
    <span className="spreadsheet-toolbar-divider" />
    <label className="spreadsheet-select-control" title="Text alignment">
      <span className="sr-only">Text alignment</span>
      <select
        value={style.align || "left"}
        onChange={(event) => onStyle("align", event.target.value)}
        aria-label="Text alignment"
      >
        <option value="left">Left align</option>
        <option value="center">Center align</option>
        <option value="right">Right align</option>
      </select>
      {style.align === "center" ? (
        <FiAlignCenter />
      ) : style.align === "right" ? (
        <FiAlignRight />
      ) : (
        <FiAlignLeft />
      )}
    </label>
    <label
      className="spreadsheet-select-control number-format-control"
      title="Number format"
    >
      <span className="sr-only">Number format</span>
      <select
        value={style.numberFormat || "automatic"}
        onChange={(event) => onStyle("numberFormat", event.target.value)}
        aria-label="Number format"
      >
        <option value="automatic">Automatic</option>
        <option value="number">Number</option>
        <option value="currency">BDT currency</option>
        <option value="percentage">Percentage</option>
      </select>
    </label>
    <label
      className="spreadsheet-select-control font-size-control"
      title="Font size"
    >
      <span className="sr-only">Font size</span>
      <select
        value={style.fontSize || 13}
        onChange={(event) => onStyle("fontSize", Number(event.target.value))}
        aria-label="Font size"
      >
        {[11, 12, 13, 14, 16, 18, 24].map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    </label>
  </div>
);

export default SpreadsheetToolbar;
