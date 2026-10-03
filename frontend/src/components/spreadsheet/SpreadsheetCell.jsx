const SpreadsheetCell = ({
  address,
  value,
  style = {},
  selected,
  active,
  editing,
  editValue,
  inputRef,
  onSelect,
  onStartEdit,
  onChange,
  onCommit,
  onCancel,
  onMove,
}) => {
  const cellStyle = {
    textAlign: style.align || "left",
    fontWeight: style.bold ? 700 : 400,
    fontStyle: style.italic ? "italic" : "normal",
    textDecoration: style.underline ? "underline" : "none",
    color: style.color || undefined,
    backgroundColor: style.background || undefined,
    fontSize: style.fontSize ? `${style.fontSize}px` : undefined,
    boxShadow: style.border
      ? "inset 0 0 0 1px var(--sp-line-strong)"
      : undefined,
  };

  return (
    <div
      role="gridcell"
      data-address={address}
      aria-label={`${address}: ${value}`}
      aria-selected={selected}
      tabIndex={active && !editing ? 0 : -1}
      className={`spreadsheet-cell ${selected ? "is-selected" : ""} ${active ? "is-active" : ""}`}
      style={cellStyle}
      onClick={(event) => {
        onSelect(event.shiftKey);
        event.currentTarget.focus();
      }}
      onDoubleClick={() => onStartEdit()}
    >
      {editing ? (
        <input
          ref={inputRef}
          className="spreadsheet-cell-input"
          aria-label={`Edit ${address}`}
          value={editValue}
          onChange={(event) => onChange(event.target.value)}
          onBlur={() => onCommit(editValue)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onCommit(editValue);
              onMove(1, 0, false);
            }
            if (event.key === "Tab") {
              event.preventDefault();
              onCommit(editValue);
              onMove(0, event.shiftKey ? -1 : 1, false);
            }
            if (event.key === "Escape") {
              event.preventDefault();
              onCancel();
            }
          }}
        />
      ) : (
        <span className="spreadsheet-cell-value">{value}</span>
      )}
    </div>
  );
};

export default SpreadsheetCell;
