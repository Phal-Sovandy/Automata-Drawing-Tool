import React from "react";

const SpecialCharactersModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const specialCharacters = [
    // Greek letters
    {
      symbol: "α",
      command: "\\alpha",
      name: "alpha",
      description: "Greek letter alpha",
    },
    {
      symbol: "β",
      command: "\\beta",
      name: "beta",
      description: "Greek letter beta",
    },
    {
      symbol: "γ",
      command: "\\gamma",
      name: "gamma",
      description: "Greek letter gamma",
    },
    {
      symbol: "δ",
      command: "\\delta",
      name: "delta",
      description: "Greek letter delta",
    },
    {
      symbol: "ε",
      command: "\\epsilon",
      name: "epsilon",
      description: "Greek letter epsilon",
    },
    {
      symbol: "ζ",
      command: "\\zeta",
      name: "zeta",
      description: "Greek letter zeta",
    },
    {
      symbol: "η",
      command: "\\eta",
      name: "eta",
      description: "Greek letter eta",
    },
    {
      symbol: "θ",
      command: "\\theta",
      name: "theta",
      description: "Greek letter theta",
    },
    {
      symbol: "ι",
      command: "\\iota",
      name: "iota",
      description: "Greek letter iota",
    },
    {
      symbol: "κ",
      command: "\\kappa",
      name: "kappa",
      description: "Greek letter kappa",
    },
    {
      symbol: "λ",
      command: "\\lambda",
      name: "lambda",
      description: "Greek letter lambda",
    },
    {
      symbol: "μ",
      command: "\\mu",
      name: "mu",
      description: "Greek letter mu",
    },
    {
      symbol: "ν",
      command: "\\nu",
      name: "nu",
      description: "Greek letter nu",
    },
    {
      symbol: "ξ",
      command: "\\xi",
      name: "xi",
      description: "Greek letter xi",
    },
    {
      symbol: "ο",
      command: "\\omicron",
      name: "omicron",
      description: "Greek letter omicron",
    },
    {
      symbol: "π",
      command: "\\pi",
      name: "pi",
      description: "Greek letter pi",
    },
    {
      symbol: "ρ",
      command: "\\rho",
      name: "rho",
      description: "Greek letter rho",
    },
    {
      symbol: "σ",
      command: "\\sigma",
      name: "sigma",
      description: "Greek letter sigma",
    },
    {
      symbol: "τ",
      command: "\\tau",
      name: "tau",
      description: "Greek letter tau",
    },
    {
      symbol: "υ",
      command: "\\upsilon",
      name: "upsilon",
      description: "Greek letter upsilon",
    },
    {
      symbol: "φ",
      command: "\\phi",
      name: "phi",
      description: "Greek letter phi",
    },
    {
      symbol: "χ",
      command: "\\chi",
      name: "chi",
      description: "Greek letter chi",
    },
    {
      symbol: "ψ",
      command: "\\psi",
      name: "psi",
      description: "Greek letter psi",
    },
    {
      symbol: "ω",
      command: "\\omega",
      name: "omega",
      description: "Greek letter omega",
    },

    // Mathematical symbols
    {
      symbol: "∈",
      command: "\\in",
      name: "element of",
      description: "Set membership",
    },
    {
      symbol: "∉",
      command: "\\notin",
      name: "not element of",
      description: "Not set membership",
    },
    {
      symbol: "⊂",
      command: "\\subset",
      name: "subset",
      description: "Proper subset",
    },
    {
      symbol: "⊆",
      command: "\\subseteq",
      name: "subset or equal",
      description: "Subset or equal",
    },
    {
      symbol: "⊃",
      command: "\\supset",
      name: "superset",
      description: "Proper superset",
    },
    {
      symbol: "⊇",
      command: "\\supseteq",
      name: "superset or equal",
      description: "Superset or equal",
    },
    { symbol: "∪", command: "\\cup", name: "union", description: "Set union" },
    {
      symbol: "∩",
      command: "\\cap",
      name: "intersection",
      description: "Set intersection",
    },
    {
      symbol: "∅",
      command: "\\emptyset",
      name: "empty set",
      description: "Empty set",
    },
    {
      symbol: "∞",
      command: "\\infty",
      name: "infinity",
      description: "Infinity symbol",
    },
    {
      symbol: "∀",
      command: "\\forall",
      name: "for all",
      description: "Universal quantifier",
    },
    {
      symbol: "∃",
      command: "\\exists",
      name: "there exists",
      description: "Existential quantifier",
    },
    {
      symbol: "¬",
      command: "\\neg",
      name: "not",
      description: "Logical negation",
    },
    {
      symbol: "∧",
      command: "\\land",
      name: "and",
      description: "Logical conjunction",
    },
    {
      symbol: "∨",
      command: "\\lor",
      name: "or",
      description: "Logical disjunction",
    },
    {
      symbol: "→",
      command: "\\rightarrow",
      name: "implies",
      description: "Logical implication",
    },
    {
      symbol: "↔",
      command: "\\leftrightarrow",
      name: "iff",
      description: "If and only if",
    },
    {
      symbol: "≡",
      command: "\\equiv",
      name: "equivalent",
      description: "Logical equivalence",
    },

    // Arrows
    {
      symbol: "←",
      command: "\\leftarrow",
      name: "left arrow",
      description: "Left arrow",
    },
    {
      symbol: "→",
      command: "\\rightarrow",
      name: "right arrow",
      description: "Right arrow",
    },
    {
      symbol: "↑",
      command: "\\uparrow",
      name: "up arrow",
      description: "Up arrow",
    },
    {
      symbol: "↓",
      command: "\\downarrow",
      name: "down arrow",
      description: "Down arrow",
    },
    {
      symbol: "↖",
      command: "\\nwarrow",
      name: "northwest arrow",
      description: "Northwest arrow",
    },
    {
      symbol: "↗",
      command: "\\nearrow",
      name: "northeast arrow",
      description: "Northeast arrow",
    },
    {
      symbol: "↙",
      command: "\\swarrow",
      name: "southwest arrow",
      description: "Southwest arrow",
    },
    {
      symbol: "↘",
      command: "\\searrow",
      name: "southeast arrow",
      description: "Southeast arrow",
    },
    {
      symbol: "⇐",
      command: "\\Leftarrow",
      name: "double left arrow",
      description: "Double left arrow",
    },
    {
      symbol: "⇒",
      command: "\\Rightarrow",
      name: "double right arrow",
      description: "Double right arrow",
    },
    {
      symbol: "⇑",
      command: "\\Uparrow",
      name: "double up arrow",
      description: "Double up arrow",
    },
    {
      symbol: "⇓",
      command: "\\Downarrow",
      name: "double down arrow",
      description: "Double down arrow",
    },

    // Other useful symbols
    {
      symbol: "•",
      command: "\\bullet",
      name: "bullet",
      description: "Bullet point",
    },
    {
      symbol: "◦",
      command: "\\circbullet",
      name: "white bullet",
      description: "White bullet point",
    },
    {
      symbol: "∗",
      command: "\\ast",
      name: "asterisk",
      description: "Asterisk operator",
    },
    {
      symbol: "∘",
      command: "\\circ",
      name: "compose",
      description: "Function composition",
    },
    {
      symbol: "×",
      command: "\\times",
      name: "times",
      description: "Multiplication or cross product",
    },
    { symbol: "÷", command: "\\div", name: "divide", description: "Division" },
    {
      symbol: "±",
      command: "\\pm",
      name: "plus minus",
      description: "Plus or minus",
    },
    {
      symbol: "≤",
      command: "\\leq",
      name: "less than or equal",
      description: "Less than or equal to",
    },
    {
      symbol: "≥",
      command: "\\geq",
      name: "greater than or equal",
      description: "Greater than or equal to",
    },
    {
      symbol: "≠",
      command: "\\neq",
      name: "not equal",
      description: "Not equal to",
    },
    {
      symbol: "≈",
      command: "\\approx",
      name: "approximately equal",
      description: "Approximately equal to",
    },
    {
      symbol: "≅",
      command: "\\cong",
      name: "congruent",
      description: "Congruent to",
    },
    {
      symbol: "∼",
      command: "\\sim",
      name: "similar",
      description: "Similar to",
    },
    {
      symbol: "∝",
      command: "\\propto",
      name: "proportional",
      description: "Proportional to",
    },
  ];

  const handleCharacterClick = (character) => {
    // Copy backslash command to clipboard
    navigator.clipboard
      .writeText(character.command)
      .then(() => {})
      .catch((err) => {
        console.error("Failed to copy command: ", err);
      });
  };

  const handleSymbolClick = (character) => {
    // Copy the actual symbol to clipboard
    navigator.clipboard
      .writeText(character.symbol)
      .then(() => {})
      .catch((err) => {
        console.error("Failed to copy symbol: ", err);
      });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Special Characters</h2>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-subtitle">
            Click on the symbol to copy the character, or click on the command
            to copy the backslash command. You can then paste either into state
            or transition labels using Ctrl+V.
          </p>

          {/* Subscript Feature */}
          <div className="subscript-feature">
            <div className="subscript-header">
              <h3>Subscript Feature</h3>
            </div>
            <div className="subscript-content">
              <div className="subscript-example">
                <span className="subscript-input">a_1</span>
                <span className="subscript-arrow">→</span>
                <span className="subscript-symbol">a₁</span>
              </div>
              <p className="subscript-description">
                Type any letter followed by underscore and number to create
                subscripts (e.g., a_1, x_2, q_0)
              </p>
            </div>
          </div>

          <div className="special-characters-grid">
            {specialCharacters.map((char, index) => (
              <div
                key={index}
                className="character-item"
                title={`${char.name} - ${char.description} - Command: ${char.command}`}
              >
                <div
                  className="character-symbol clickable"
                  onClick={() => handleSymbolClick(char)}
                  title="Click to copy symbol"
                >
                  {char.symbol}
                </div>
                <div
                  className="character-command clickable"
                  onClick={() => handleCharacterClick(char)}
                  title="Click to copy command"
                >
                  {char.command}
                </div>
                <div className="character-name">{char.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialCharactersModal;
