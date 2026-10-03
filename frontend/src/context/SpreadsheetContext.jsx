import { createContext, useContext, useEffect, useState } from "react";
import {
  createBlankSpreadsheet,
  createSpreadsheetDemoData,
} from "../data/spreadsheetDemoData";

const SpreadsheetContext = createContext(null);
const STORAGE_KEY = "workspace-spreadsheets-v1";

const loadWorkbooks = () => {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Keep the demo available when browser storage is unavailable.
  }

  return createSpreadsheetDemoData();
};

const clone = (value) => JSON.parse(JSON.stringify(value));

export const SpreadsheetProvider = ({ children }) => {
  const [workbooks, setWorkbooks] = useState(loadWorkbooks);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workbooks));
    } catch {
      // Spreadsheet edits remain available for the current session.
    }
  }, [workbooks]);

  const createSpreadsheet = (name) => {
    const workbook = createBlankSpreadsheet(name);
    setWorkbooks((current) => [workbook, ...current]);
    return workbook;
  };

  const updateSpreadsheet = (id, updater) => {
    setWorkbooks((current) =>
      current.map((workbook) => {
        if (workbook.id !== id) return workbook;
        const changes =
          typeof updater === "function" ? updater(workbook) : updater;
        return { ...workbook, ...changes, updatedAt: new Date().toISOString() };
      }),
    );
  };

  const updateSheet = (workbookId, sheetId, updater) => {
    setWorkbooks((current) =>
      current.map((workbook) => {
        if (workbook.id !== workbookId) return workbook;
        const sheets = workbook.sheets.map((sheet) =>
          sheet.id === sheetId ? updater(sheet) : sheet,
        );
        return {
          ...workbook,
          sheets,
          rowCount: Math.max(...sheets.map((sheet) => sheet.rows)),
          columnCount: Math.max(...sheets.map((sheet) => sheet.columns)),
          updatedAt: new Date().toISOString(),
        };
      }),
    );
  };

  const deleteSpreadsheet = (id) => {
    setWorkbooks((current) => current.filter((workbook) => workbook.id !== id));
  };

  const duplicateSpreadsheet = (id) => {
    const original = workbooks.find((workbook) => workbook.id === id);
    if (!original) return null;

    const duplicate = clone(original);
    duplicate.id = `spreadsheet-${Math.random().toString(36).slice(2, 10)}`;
    duplicate.name = `${original.name} copy`;
    duplicate.createdAt = new Date().toISOString();
    duplicate.updatedAt = duplicate.createdAt;
    duplicate.favorite = false;
    duplicate.sheets = duplicate.sheets.map((sheet) => ({
      ...sheet,
      id: `sheet-${Math.random().toString(36).slice(2, 10)}`,
    }));
    duplicate.activeSheetId = duplicate.sheets[0]?.id ?? null;
    setWorkbooks((current) => [duplicate, ...current]);
    return duplicate;
  };

  return (
    <SpreadsheetContext.Provider
      value={{
        workbooks,
        createSpreadsheet,
        updateSpreadsheet,
        updateSheet,
        deleteSpreadsheet,
        duplicateSpreadsheet,
      }}
    >
      {children}
    </SpreadsheetContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSpreadsheets = () => {
  const context = useContext(SpreadsheetContext);
  if (!context) {
    throw new Error("useSpreadsheets must be used inside SpreadsheetProvider.");
  }
  return context;
};
