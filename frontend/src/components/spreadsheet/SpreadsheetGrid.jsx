import { useEffect, useRef } from "react";
import SpreadsheetCell from "./SpreadsheetCell";
import {
  cellAddress,
  columnLabel,
  formatCellValue,
  getCellValue,
  rawCellValue,
  selectionBounds,
} from "../../lib/spreadsheetEngine";

const SpreadsheetGrid = ({
  sheet,
  selection,
  editingAddress,
  editValue,
  onSelect,
  onStartEdit,
  onEditChange,
  onCommit,
  onCancel,
  onMove,
  onClear,
  onPaste,
}) => {
  const gridRef = useRef(null);
  const bounds = selectionBounds(selection);
  const activeAddress = cellAddress(
    selection.focus.row,
    selection.focus.column,
  );

  useEffect(() => {
    if (editingAddress) {
      gridRef.current
        ?.querySelector(`[data-address="${editingAddress}"] input`)
        ?.focus();
      return;
    }
    const selectedCell = gridRef.current?.querySelector(
      `[data-address="${activeAddress}"]`,
    );
    selectedCell?.focus({ preventScroll: true });
    if (!selectedCell || !gridRef.current) return;

    const viewport = gridRef.current;
    const cellRect = selectedCell.getBoundingClientRect();
    const viewportRect = viewport.getBoundingClientRect();
    const visibleLeft = viewportRect.left + 48;
    const visibleTop = viewportRect.top + 27;

    if (cellRect.left < visibleLeft) {
      viewport.scrollLeft -= visibleLeft - cellRect.left;
    } else if (cellRect.right > viewportRect.right) {
      viewport.scrollLeft += cellRect.right - viewportRect.right;
    }
    if (cellRect.top < visibleTop) {
      viewport.scrollTop -= visibleTop - cellRect.top;
    } else if (cellRect.bottom > viewportRect.bottom) {
      viewport.scrollTop += cellRect.bottom - viewportRect.bottom;
    }
  }, [activeAddress, editingAddress]);

  const isInSelection = (row, column) =>
    row >= bounds.top &&
    row <= bounds.bottom &&
    column >= bounds.left &&
    column <= bounds.right;

  const handleKeyDown = (event) => {
    if (event.target instanceof HTMLInputElement) return;

    const movements = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
      Tab: [0, event.shiftKey ? -1 : 1],
      Enter: [event.shiftKey ? -1 : 1, 0],
    };
    if (movements[event.key]) {
      event.preventDefault();
      if (event.key === "Enter") onStartEdit(activeAddress);
      else onMove(...movements[event.key], event.shiftKey);
      return;
    }

    if (event.key === "F2") {
      event.preventDefault();
      onStartEdit(activeAddress);
      return;
    }
    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      onClear();
      return;
    }
    if (
      event.key.length === 1 &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      event.preventDefault();
      onStartEdit(activeAddress, event.key);
    }
  };

  const handleCopy = (event) => {
    const rows = [];
    for (let row = bounds.top; row <= bounds.bottom; row += 1) {
      const values = [];
      for (let column = bounds.left; column <= bounds.right; column += 1) {
        values.push(rawCellValue(sheet, cellAddress(row, column)));
      }
      rows.push(values.join("\t"));
    }
    event.clipboardData.setData("text/plain", rows.join("\n"));
    event.preventDefault();
  };

  const handlePaste = (event) => {
    const text = event.clipboardData.getData("text/plain");
    if (!text) return;
    event.preventDefault();
    onPaste(text);
  };

  return (
    <div className="spreadsheet-grid-viewport" ref={gridRef}>
      <div
        className="spreadsheet-grid"
        role="grid"
        aria-label={`${sheet.name} spreadsheet`}
        aria-rowcount={sheet.rows + 1}
        aria-colcount={sheet.columns + 1}
        tabIndex={0}
        style={{
          gridTemplateColumns: `48px repeat(${sheet.columns}, minmax(108px, 138px))`,
        }}
        onKeyDown={handleKeyDown}
        onCopy={handleCopy}
        onPaste={handlePaste}
      >
        <div className="spreadsheet-corner-cell" role="columnheader" />
        {Array.from({ length: sheet.columns }, (_, column) => (
          <div
            className="spreadsheet-column-heading"
            role="columnheader"
            key={column}
          >
            {columnLabel(column)}
          </div>
        ))}

        {Array.from({ length: sheet.rows }, (_, row) => (
          <SpreadsheetRow
            key={row}
            row={row}
            sheet={sheet}
            isInSelection={isInSelection}
            activeAddress={activeAddress}
            editingAddress={editingAddress}
            editValue={editValue}
            onSelect={onSelect}
            onStartEdit={onStartEdit}
            onEditChange={onEditChange}
            onCommit={onCommit}
            onCancel={onCancel}
            onMove={onMove}
          />
        ))}
      </div>
    </div>
  );
};

const SpreadsheetRow = ({
  row,
  sheet,
  isInSelection,
  activeAddress,
  editingAddress,
  editValue,
  onSelect,
  onStartEdit,
  onEditChange,
  onCommit,
  onCancel,
  onMove,
}) => (
  <>
    <div className="spreadsheet-row-heading" role="rowheader">
      {row + 1}
    </div>
    {Array.from({ length: sheet.columns }, (_, column) => {
      const address = cellAddress(row, column);
      const raw = rawCellValue(sheet, address);
      const value = formatCellValue(
        getCellValue(sheet, address),
        sheet.styles[address]?.numberFormat,
      );
      const isActive = address === activeAddress;

      return (
        <SpreadsheetCell
          key={address}
          address={address}
          value={value}
          style={sheet.styles[address]}
          selected={isInSelection(row, column)}
          active={isActive}
          editing={editingAddress === address}
          editValue={editValue}
          onSelect={(extend) => onSelect({ row, column }, extend)}
          onStartEdit={(initialValue = raw) =>
            onStartEdit(address, initialValue)
          }
          onChange={onEditChange}
          onCommit={onCommit}
          onCancel={onCancel}
          onMove={onMove}
        />
      );
    })}
  </>
);

export default SpreadsheetGrid;
