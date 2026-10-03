import { useState } from "react";

const FormulaBar = ({ address, value, onNavigate, onCommit }) => {
  const [addressDraft, setAddressDraft] = useState(address);
  const [formulaDraft, setFormulaDraft] = useState(value);

  const navigateToAddress = () => {
    onNavigate(addressDraft);
    setAddressDraft(address);
  };

  const commitFormula = () => onCommit(formulaDraft);

  return (
    <div className="spreadsheet-formula-bar">
      <input
        className="spreadsheet-name-box"
        aria-label="Cell reference"
        value={addressDraft}
        onChange={(event) => setAddressDraft(event.target.value.toUpperCase())}
        onBlur={navigateToAddress}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
          if (event.key === "Escape") setAddressDraft(address);
        }}
      />
      <span className="spreadsheet-formula-divider" />
      <span className="spreadsheet-fx" aria-hidden="true">
        fx
      </span>
      <input
        className="spreadsheet-formula-input"
        aria-label="Formula bar"
        value={formulaDraft}
        onChange={(event) => setFormulaDraft(event.target.value)}
        onBlur={commitFormula}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            commitFormula();
            event.currentTarget.blur();
          }
          if (event.key === "Escape") setFormulaDraft(value);
        }}
      />
    </div>
  );
};

export default FormulaBar;
