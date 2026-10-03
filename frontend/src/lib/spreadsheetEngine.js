export const columnLabel = (index) => {
  let number = index + 1;
  let label = "";

  while (number > 0) {
    const remainder = (number - 1) % 26;
    label = String.fromCharCode(65 + remainder) + label;
    number = Math.floor((number - 1) / 26);
  }

  return label;
};

export const cellAddress = (row, column) => `${columnLabel(column)}${row + 1}`;

const columnIndex = (label) => {
  let index = 0;
  for (const character of label.toUpperCase()) {
    index = index * 26 + character.charCodeAt(0) - 64;
  }
  return index - 1;
};

const parseAddress = (address) => {
  const match = /^([A-Z]+)(\d+)$/i.exec(address);
  if (!match) throw new Error(`Invalid cell reference: ${address}`);
  return { row: Number(match[2]) - 1, column: columnIndex(match[1]) };
};

const tokenize = (formula) => {
  const tokens = [];
  const pattern = /\s+|\d+(?:\.\d+)?|[A-Z]+\d+|[A-Z]+|[()+\-*/,:]/iy;
  let index = 0;

  while (index < formula.length) {
    pattern.lastIndex = index;
    const match = pattern.exec(formula);
    if (!match) throw new Error("Unsupported formula syntax.");
    index = pattern.lastIndex;
    if (!/^\s+$/.test(match[0])) tokens.push(match[0]);
  }

  return tokens;
};

const numericValue = (value) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value !== "string" || value.trim() === "") return 0;
  const parsed = Number(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const evaluateCellInternal = (sheet, address, visiting) => {
  if (visiting.has(address)) return "#CYCLE!";

  const raw = String(sheet.cells[address] ?? "");
  if (!raw.startsWith("=")) return raw;

  visiting.add(address);
  try {
    return parseFormula(raw.slice(1), sheet, visiting);
  } catch {
    return "#ERROR!";
  } finally {
    visiting.delete(address);
  }
};

const expandRange = (start, end, sheet, visiting) => {
  const first = parseAddress(start);
  const last = parseAddress(end);
  const top = Math.min(first.row, last.row);
  const bottom = Math.max(first.row, last.row);
  const left = Math.min(first.column, last.column);
  const right = Math.max(first.column, last.column);
  const values = [];

  for (let row = top; row <= bottom; row += 1) {
    for (let column = left; column <= right; column += 1) {
      values.push(
        evaluateCellInternal(sheet, cellAddress(row, column), visiting),
      );
    }
  }

  return values;
};

const parseFormula = (formula, sheet, visiting) => {
  const tokens = tokenize(formula);
  let position = 0;

  const peek = () => tokens[position];
  const consume = () => tokens[position++];

  const parsePrimary = () => {
    const token = consume();
    if (!token) throw new Error("Incomplete formula.");

    if (token === "+") return parsePrimary();
    if (token === "-") return -numericValue(parsePrimary());
    if (token === "(") {
      const value = parseExpression();
      if (consume() !== ")") throw new Error("Missing closing parenthesis.");
      return value;
    }
    if (/^\d/.test(token)) return Number(token);

    if (/^[A-Z]+\d+$/i.test(token)) {
      if (peek() === ":") {
        consume();
        const end = consume();
        if (!/^[A-Z]+\d+$/i.test(end || "")) {
          throw new Error("Invalid cell range.");
        }
        return expandRange(token, end, sheet, visiting);
      }
      return evaluateCellInternal(sheet, token.toUpperCase(), visiting);
    }

    if (/^[A-Z]+$/i.test(token) && peek() === "(") {
      const name = token.toUpperCase();
      consume();
      const args = [];
      if (peek() !== ")") {
        do {
          args.push(parseExpression());
          if (peek() !== ",") break;
          consume();
        } while (position < tokens.length);
      }
      if (consume() !== ")") throw new Error("Missing closing parenthesis.");
      const values = args.flat(Infinity);
      const numbers = values.map(numericValue);

      if (name === "SUM") return numbers.reduce((sum, value) => sum + value, 0);
      if (name === "AVERAGE") {
        return numbers.length
          ? numbers.reduce((sum, value) => sum + value, 0) / numbers.length
          : "#DIV/0!";
      }
      if (name === "MIN") return numbers.length ? Math.min(...numbers) : 0;
      if (name === "MAX") return numbers.length ? Math.max(...numbers) : 0;
      if (name === "COUNT") {
        return values.filter(
          (value) => value !== "" && Number.isFinite(Number(value)),
        ).length;
      }
      throw new Error(`Unknown function: ${name}`);
    }

    throw new Error("Unsupported formula value.");
  };

  const parseTerm = () => {
    let value = parsePrimary();
    while (peek() === "*" || peek() === "/") {
      const operator = consume();
      const right = numericValue(parsePrimary());
      if (operator === "/" && right === 0) return "#DIV/0!";
      value =
        operator === "*"
          ? numericValue(value) * right
          : numericValue(value) / right;
    }
    return value;
  };

  const parseExpression = () => {
    let value = parseTerm();
    while (peek() === "+" || peek() === "-") {
      const operator = consume();
      const right = numericValue(parseTerm());
      value =
        operator === "+"
          ? numericValue(value) + right
          : numericValue(value) - right;
    }
    return value;
  };

  const result = parseExpression();
  if (position < tokens.length) throw new Error("Unexpected formula input.");
  return result;
};

export const getCellValue = (sheet, address) =>
  evaluateCellInternal(sheet, address, new Set());

export const formatCellValue = (value, format = "automatic") => {
  if (typeof value !== "number" || !Number.isFinite(value)) return value ?? "";
  if (format === "currency") {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      maximumFractionDigits: 2,
    }).format(value);
  }
  if (format === "percentage") {
    return new Intl.NumberFormat("en", {
      style: "percent",
      maximumFractionDigits: 2,
    }).format(value);
  }
  return new Intl.NumberFormat("en", { maximumFractionDigits: 8 }).format(
    value,
  );
};

export const rawCellValue = (sheet, address) =>
  String(sheet.cells[address] ?? "");

export const selectionBounds = (selection) => ({
  top: Math.min(selection.anchor.row, selection.focus.row),
  bottom: Math.max(selection.anchor.row, selection.focus.row),
  left: Math.min(selection.anchor.column, selection.focus.column),
  right: Math.max(selection.anchor.column, selection.focus.column),
});
