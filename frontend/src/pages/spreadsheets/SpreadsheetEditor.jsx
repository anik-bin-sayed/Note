import { useMemo, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import FormulaBar from "../../components/spreadsheet/FormulaBar";
import SheetTabs from "../../components/spreadsheet/SheetTabs";
import SpreadsheetGrid from "../../components/spreadsheet/SpreadsheetGrid";
import SpreadsheetHeader from "../../components/spreadsheet/SpreadsheetHeader";
import SpreadsheetMenuBar from "../../components/spreadsheet/SpreadsheetMenuBar";
import SpreadsheetToolbar from "../../components/spreadsheet/SpreadsheetToolbar";
import { createBlankSheet } from "../../data/spreadsheetDemoData";
import { useSpreadsheets } from "../../context/SpreadsheetContext";
import {
  cellAddress,
  getCellValue,
  rawCellValue,
  selectionBounds,
} from "../../lib/spreadsheetEngine";
import "../../styles/spreadsheet.css";

const initialSelection = {
  anchor: { row: 0, column: 0 },
  focus: { row: 0, column: 0 },
};

const clone = (value) => JSON.parse(JSON.stringify(value));

const parseAddress = (address) => {
  const match = /^([A-Z]+)(\d+)$/i.exec(address.trim());
  if (!match) return null;
  let column = 0;
  for (const character of match[1].toUpperCase()) {
    column = column * 26 + character.charCodeAt(0) - 64;
  }
  return { row: Number(match[2]) - 1, column: column - 1 };
};

const shiftEntries = (source, axis, removedIndex) => {
  const result = {};
  Object.entries(source).forEach(([address, value]) => {
    const point = parseAddress(address);
    if (!point) return;
    const current = axis === "row" ? point.row : point.column;
    if (current === removedIndex) return;
    if (current > removedIndex) {
      if (axis === "row") point.row -= 1;
      else point.column -= 1;
    }
    result[cellAddress(point.row, point.column)] = value;
  });
  return result;
};

const SpreadsheetEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    workbooks,
    updateSpreadsheet,
    updateSheet,
    deleteSpreadsheet,
    duplicateSpreadsheet,
  } = useSpreadsheets();
  const workbook = workbooks.find((item) => item.id === id);
  const activeSheet =
    workbook?.sheets.find((item) => item.id === workbook.activeSheetId) ??
    workbook?.sheets[0];
  const [selection, setSelection] = useState(initialSelection);
  const [editingAddress, setEditingAddress] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [gridlines, setGridlines] = useState(true);
  const [toast, setToast] = useState("");
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [historyState, setHistoryState] = useState({});
  const historyRef = useRef({});

  const activeAddress = activeSheet
    ? cellAddress(selection.focus.row, selection.focus.column)
    : "A1";
  const activeStyle = activeSheet?.styles[activeAddress] ?? {};

  const announce = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  };

  const remember = () => {
    if (!activeSheet) return;
    const stack = historyRef.current[activeSheet.id] ?? {
      past: [],
      future: [],
    };
    const nextStack = {
      past: [...stack.past, clone(activeSheet)].slice(-50),
      future: [],
    };
    historyRef.current[activeSheet.id] = nextStack;
    setHistoryState((current) => ({
      ...current,
      [activeSheet.id]: { canUndo: true, canRedo: false },
    }));
  };

  const updateCurrentSheet = (updater, record = true) => {
    if (!activeSheet || !workbook) return;
    if (record) remember();
    updateSheet(workbook.id, activeSheet.id, updater);
  };

  const writeCell = (address, value) => {
    updateCurrentSheet((sheet) => {
      const cells = { ...sheet.cells };
      if (value === "") delete cells[address];
      else cells[address] = value;
      return { ...sheet, cells };
    });
  };

  const handleSelect = (point, extend) => {
    setSelection((current) => ({
      anchor: extend ? current.anchor : point,
      focus: point,
    }));
  };

  const moveSelection = (rowDelta, columnDelta, extend = false) => {
    if (!activeSheet) return;
    const focus = {
      row: Math.max(
        0,
        Math.min(activeSheet.rows - 1, selection.focus.row + rowDelta),
      ),
      column: Math.max(
        0,
        Math.min(activeSheet.columns - 1, selection.focus.column + columnDelta),
      ),
    };
    setSelection({ anchor: extend ? selection.anchor : focus, focus });
  };

  const startEdit = (address = activeAddress, initialValue) => {
    if (!activeSheet) return;
    setEditingAddress(address);
    setEditValue(initialValue ?? rawCellValue(activeSheet, address));
  };

  const commitEdit = (value) => {
    if (!editingAddress) return;
    writeCell(editingAddress, value);
    setEditingAddress(null);
  };

  const clearSelection = () => {
    if (!activeSheet) return;
    const bounds = selectionBounds(selection);
    updateCurrentSheet((sheet) => {
      const cells = { ...sheet.cells };
      for (let row = bounds.top; row <= bounds.bottom; row += 1) {
        for (let column = bounds.left; column <= bounds.right; column += 1) {
          delete cells[cellAddress(row, column)];
        }
      }
      return { ...sheet, cells };
    });
  };

  const pasteCells = (text) => {
    if (!activeSheet) return;
    const rows = text.replace(/\r/g, "").replace(/\n$/, "").split("\n");
    const values = rows.map((row) => row.split("\t"));
    const start = selection.focus;
    updateCurrentSheet((sheet) => {
      const cells = { ...sheet.cells };
      values.forEach((row, rowOffset) =>
        row.forEach((value, columnOffset) => {
          const address = cellAddress(
            start.row + rowOffset,
            start.column + columnOffset,
          );
          if (value === "") delete cells[address];
          else cells[address] = value;
        }),
      );
      return {
        ...sheet,
        rows: Math.max(sheet.rows, start.row + values.length),
        columns: Math.max(
          sheet.columns,
          start.column + Math.max(...values.map((row) => row.length)),
        ),
        cells,
      };
    });
  };

  const applyStyle = (property, value) => {
    if (!activeSheet) return;
    const bounds = selectionBounds(selection);
    updateCurrentSheet((sheet) => {
      const styles = { ...sheet.styles };
      for (let row = bounds.top; row <= bounds.bottom; row += 1) {
        for (let column = bounds.left; column <= bounds.right; column += 1) {
          const address = cellAddress(row, column);
          styles[address] = { ...styles[address], [property]: value };
        }
      }
      return { ...sheet, styles };
    });
  };

  const undo = () => {
    if (!activeSheet) return;
    const stack = historyRef.current[activeSheet.id];
    if (!stack?.past.length) return;
    const previous = stack.past[stack.past.length - 1];
    const nextStack = {
      past: stack.past.slice(0, -1),
      future: [clone(activeSheet), ...stack.future],
    };
    historyRef.current[activeSheet.id] = nextStack;
    setHistoryState((current) => ({
      ...current,
      [activeSheet.id]: {
        canUndo: nextStack.past.length > 0,
        canRedo: nextStack.future.length > 0,
      },
    }));
    updateCurrentSheet(() => previous, false);
  };

  const redo = () => {
    if (!activeSheet) return;
    const stack = historyRef.current[activeSheet.id];
    if (!stack?.future.length) return;
    const next = stack.future[0];
    const nextStack = {
      past: [...stack.past, clone(activeSheet)],
      future: stack.future.slice(1),
    };
    historyRef.current[activeSheet.id] = nextStack;
    setHistoryState((current) => ({
      ...current,
      [activeSheet.id]: {
        canUndo: nextStack.past.length > 0,
        canRedo: nextStack.future.length > 0,
      },
    }));
    updateCurrentSheet(() => next, false);
  };

  const addRow = () =>
    updateCurrentSheet((sheet) => ({ ...sheet, rows: sheet.rows + 1 }));
  const addColumn = () =>
    updateCurrentSheet((sheet) => ({ ...sheet, columns: sheet.columns + 1 }));

  const deleteRow = () => {
    if (!activeSheet || activeSheet.rows <= 1) return;
    const row = selection.focus.row;
    updateCurrentSheet((sheet) => ({
      ...sheet,
      rows: sheet.rows - 1,
      cells: shiftEntries(sheet.cells, "row", row),
      styles: shiftEntries(sheet.styles, "row", row),
    }));
    moveSelection(-1, 0);
  };

  const deleteColumn = () => {
    if (!activeSheet || activeSheet.columns <= 1) return;
    const column = selection.focus.column;
    updateCurrentSheet((sheet) => ({
      ...sheet,
      columns: sheet.columns - 1,
      cells: shiftEntries(sheet.cells, "column", column),
      styles: shiftEntries(sheet.styles, "column", column),
    }));
    moveSelection(0, -1);
  };

  const addSheet = () => {
    if (!workbook) return;
    const sheet = createBlankSheet(`Sheet ${workbook.sheets.length + 1}`);
    updateSpreadsheet(workbook.id, (current) => ({
      sheets: [...current.sheets, sheet],
      activeSheetId: sheet.id,
      rowCount: Math.max(
        ...current.sheets.map((item) => item.rows),
        sheet.rows,
      ),
      columnCount: Math.max(
        ...current.sheets.map((item) => item.columns),
        sheet.columns,
      ),
    }));
    setSelection(initialSelection);
    setEditingAddress(null);
  };

  const selectSheet = (sheetId) => {
    if (!workbook) return;
    updateSpreadsheet(workbook.id, { activeSheetId: sheetId });
    setSelection(initialSelection);
    setEditingAddress(null);
  };

  const renameSheet = (sheetId, name) =>
    updateSheet(workbook.id, sheetId, (sheet) => ({ ...sheet, name }));

  const duplicateSheet = (sheetId) => {
    const source = workbook.sheets.find((sheet) => sheet.id === sheetId);
    if (!source) return;
    const duplicate = clone(source);
    duplicate.id = `sheet-${Math.random().toString(36).slice(2, 10)}`;
    duplicate.name = `${source.name} copy`;
    updateSpreadsheet(workbook.id, (current) => ({
      sheets: [
        ...current.sheets.slice(0, current.sheets.indexOf(source) + 1),
        duplicate,
        ...current.sheets.slice(current.sheets.indexOf(source) + 1),
      ],
      activeSheetId: duplicate.id,
    }));
    setSelection(initialSelection);
  };

  const deleteSheet = (sheetId) => {
    if (!workbook || workbook.sheets.length <= 1) return;
    const target = workbook.sheets.find((sheet) => sheet.id === sheetId);
    if (!window.confirm(`Delete sheet “${target?.name}”?`)) return;
    const sheets = workbook.sheets.filter((sheet) => sheet.id !== sheetId);
    updateSpreadsheet(workbook.id, {
      sheets,
      activeSheetId:
        workbook.activeSheetId === sheetId
          ? sheets[0].id
          : workbook.activeSheetId,
      rowCount: Math.max(...sheets.map((sheet) => sheet.rows)),
      columnCount: Math.max(...sheets.map((sheet) => sheet.columns)),
    });
    setSelection(initialSelection);
  };

  const exportCsv = () => {
    if (!activeSheet) return;
    const csv = Array.from({ length: activeSheet.rows }, (_, row) =>
      Array.from({ length: activeSheet.columns }, (_, column) => {
        const value = getCellValue(activeSheet, cellAddress(row, column));
        return `"${String(value ?? "").replace(/"/g, '""')}"`;
      }).join(","),
    ).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${workbook.name}-${activeSheet.name}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const duplicateWorkbook = () => {
    const duplicate = duplicateSpreadsheet(workbook.id);
    if (duplicate) navigate(`/spreadsheets/${duplicate.id}`);
  };

  const deleteWorkbook = () => {
    if (window.confirm(`Delete “${workbook.name}”? This cannot be undone.`)) {
      deleteSpreadsheet(workbook.id);
      navigate("/spreadsheets");
    }
  };

  const renameWorkbook = (name) => updateSpreadsheet(workbook.id, { name });

  const navigateToCell = (address) => {
    const point = parseAddress(address);
    if (!point || !activeSheet) return;
    setSelection({ anchor: point, focus: point });
  };

  const showSelectionSummary = () => {
    if (!activeSheet) return;
    const bounds = selectionBounds(selection);
    const values = [];
    for (let row = bounds.top; row <= bounds.bottom; row += 1) {
      for (let column = bounds.left; column <= bounds.right; column += 1) {
        const value = getCellValue(activeSheet, cellAddress(row, column));
        if (value !== "" && Number.isFinite(Number(value)))
          values.push(Number(value));
      }
    }
    const sum = values.reduce((total, value) => total + value, 0);
    announce(`${values.length} numbers · Sum ${sum.toLocaleString()}`);
  };

  const handleMenuAction = (action) => {
    switch (action) {
      case "rename": {
        const name = window.prompt("Rename spreadsheet", workbook.name);
        if (name?.trim()) renameWorkbook(name.trim());
        break;
      }
      case "export":
        exportCsv();
        break;
      case "duplicate":
        duplicateWorkbook();
        break;
      case "delete":
        deleteWorkbook();
        break;
      case "undo":
        undo();
        break;
      case "redo":
        redo();
        break;
      case "clear":
        clearSelection();
        break;
      case "gridlines":
        setGridlines((visible) => !visible);
        break;
      case "add-row":
        addRow();
        break;
      case "add-column":
        addColumn();
        break;
      case "add-sheet":
        addSheet();
        break;
      case "bold":
        applyStyle("bold", !activeStyle.bold);
        break;
      case "italic":
        applyStyle("italic", !activeStyle.italic);
        break;
      case "underline":
        applyStyle("underline", !activeStyle.underline);
        break;
      case "currency":
        applyStyle("numberFormat", "currency");
        break;
      case "percentage":
        applyStyle("numberFormat", "percentage");
        break;
      case "summary":
        showSelectionSummary();
        break;
      case "shortcuts":
        setShowShortcuts(true);
        break;
      default:
        break;
    }
  };

  const selectedStats = useMemo(() => {
    if (!activeSheet) return { count: 0, sum: 0 };
    const bounds = selectionBounds(selection);
    const values = [];
    for (let row = bounds.top; row <= bounds.bottom; row += 1) {
      for (let column = bounds.left; column <= bounds.right; column += 1) {
        const value = getCellValue(activeSheet, cellAddress(row, column));
        if (value !== "" && Number.isFinite(Number(value)))
          values.push(Number(value));
      }
    }
    return {
      count: values.length,
      sum: values.reduce((total, value) => total + value, 0),
    };
  }, [activeSheet, selection]);

  if (!workbook) return <Navigate to="/spreadsheets" replace />;
  if (!activeSheet) return <Navigate to="/spreadsheets" replace />;

  return (
    <main
      className={`spreadsheet-shell spreadsheet-editor min-h-screen ${gridlines ? "" : "hide-gridlines"}`}
    >
      <SpreadsheetHeader
        workbook={workbook}
        onRename={renameWorkbook}
        onDuplicate={duplicateWorkbook}
        onDelete={deleteWorkbook}
        onExport={exportCsv}
      />
      <SpreadsheetMenuBar onAction={handleMenuAction} />
      <SpreadsheetToolbar
        style={activeStyle}
        onStyle={applyStyle}
        onUndo={undo}
        onRedo={redo}
        canUndo={Boolean(historyState[activeSheet.id]?.canUndo)}
        canRedo={Boolean(historyState[activeSheet.id]?.canRedo)}
        onAddRow={addRow}
        onDeleteRow={deleteRow}
        onAddColumn={addColumn}
        onDeleteColumn={deleteColumn}
      />
      <FormulaBar
        key={activeAddress}
        address={activeAddress}
        value={rawCellValue(activeSheet, activeAddress)}
        onNavigate={navigateToCell}
        onCommit={(value) => writeCell(activeAddress, value)}
      />
      <SpreadsheetGrid
        sheet={activeSheet}
        selection={selection}
        editingAddress={editingAddress}
        editValue={editValue}
        onSelect={handleSelect}
        onStartEdit={startEdit}
        onEditChange={setEditValue}
        onCommit={commitEdit}
        onCancel={() => setEditingAddress(null)}
        onMove={moveSelection}
        onClear={clearSelection}
        onPaste={pasteCells}
      />
      <SheetTabs
        sheets={workbook.sheets}
        activeSheetId={activeSheet.id}
        onSelect={selectSheet}
        onAdd={addSheet}
        onRename={renameSheet}
        onDuplicate={duplicateSheet}
        onDelete={deleteSheet}
      />
      <footer className="spreadsheet-status-bar">
        <span>
          <FiCheck aria-hidden="true" /> All changes saved locally
        </span>
        <span>
          {activeSheet.rows} rows × {activeSheet.columns} columns
        </span>
        {selectedStats.count > 1 && (
          <span>
            Count: {selectedStats.count} · Sum:{" "}
            {selectedStats.sum.toLocaleString()}
          </span>
        )}
        {toast && <span role="status">{toast}</span>}
      </footer>

      {showShortcuts && (
        <div
          className="spreadsheet-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowShortcuts(false);
          }}
        >
          <section className="spreadsheet-modal spreadsheet-shortcuts">
            <h2>Keyboard shortcuts</h2>
            <p>
              <kbd>Enter</kbd> Edit the selected cell
            </p>
            <p>
              <kbd>Arrow keys</kbd> Move between cells
            </p>
            <p>
              <kbd>Tab</kbd> Move one cell right
            </p>
            <p>
              <kbd>Delete</kbd> Clear selected cells
            </p>
            <p>
              <kbd>Ctrl/Cmd + C / V</kbd> Copy and paste cells
            </p>
            <div className="spreadsheet-modal-actions">
              <button
                type="button"
                className="spreadsheet-primary-button"
                onClick={() => setShowShortcuts(false)}
              >
                Done
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};

export default SpreadsheetEditor;
