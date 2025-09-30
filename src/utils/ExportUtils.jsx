// Export utilities for LaTeX and SVG

export class ExportAsLaTeX {
  constructor() {
    this._points = [];
    this._texData = "";
    this._scale = 0.08; // Better scale for academic papers
    this.strokeStyle = "black";
    this.fillStyle = "black";
    this._nodeCounter = 0;
    this._linkCounter = 0;
    this._colors = {
      blue: "#3b82f6",
      red: "#ef4444",
      green: "#10b981",
      purple: "#8b5cf6",
      orange: "#f59e0b",
      gray: "#6b7280",
    };
  }

  toLaTeX(
    title = "Finite State Machine",
    author = "FSM Designer",
    includeStandalone = true
  ) {
    const header = includeStandalone
      ? this._generateDocumentHeader(title, author)
      : "";
    const footer = includeStandalone ? this._generateDocumentFooter() : "";

    return (
      header +
      "\\begin{center}\n" +
      "\\begin{tikzpicture}[\n" +
      "  scale=0.15,\n" +
      "  every node/.style={font=\\small},\n" +
      "  state/.style={circle, draw, minimum size=1.2cm, thick},\n" +
      "  accept/.style={circle, draw, minimum size=1.2cm, thick, double},\n" +
      "  transition/.style={->, >=stealth, thick},\n" +
      "  selfloop/.style={->, >=stealth, thick, out=45, in=135, looseness=8}\n" +
      "]\n" +
      this._texData +
      "\\end{tikzpicture}\n" +
      "\\end{center}\n" +
      footer
    );
  }

  _generateDocumentHeader(title, author) {
    return (
      "\\documentclass[11pt,a4paper]{article}\n" +
      "\\usepackage[utf8]{inputenc}\n" +
      "\\usepackage[T1]{fontenc}\n" +
      "\\usepackage{tikz}\n" +
      "\\usepackage{amsmath}\n" +
      "\\usepackage{amsfonts}\n" +
      "\\usepackage{amssymb}\n" +
      "\\usepackage{geometry}\n" +
      "\\usepackage{xcolor}\n" +
      "\\usepackage{graphicx}\n" +
      "\\usepackage{float}\n" +
      "\n" +
      "\\geometry{margin=2cm}\n" +
      "\n" +
      "\\definecolor{fsmblue}{RGB}{59,130,246}\n" +
      "\\definecolor{fsmred}{RGB}{239,68,68}\n" +
      "\\definecolor{fsmgreen}{RGB}{16,185,129}\n" +
      "\\definecolor{fsmpurple}{RGB}{139,92,246}\n" +
      "\\definecolor{fsmorange}{RGB}{245,158,11}\n" +
      "\\definecolor{fsmgray}{RGB}{107,114,128}\n" +
      "\n" +
      "\\title{" +
      title +
      "}\n" +
      "\\author{" +
      author +
      "}\n" +
      "\\date{\\today}\n" +
      "\n" +
      "\\begin{document}\n" +
      "\n" +
      "\\maketitle\n" +
      "\n" +
      "\\section{State Transition Diagram}\n" +
      "\n"
    );
  }

  _generateDocumentFooter() {
    return "\n\\end{document}\n";
  }

  beginPath() {
    this._points = [];
  }

  arc(x, y, radius, startAngle, endAngle, isReversed) {
    x *= this._scale;
    y *= this._scale;
    radius *= this._scale;

    if (endAngle - startAngle === Math.PI * 2) {
      // Full circle - draw as a node
      this._texData += `\\node[state] (node${
        this._nodeCounter
      }) at (${this.fixed(x, 2)},${this.fixed(-y, 2)}) {};\n`;
      this._nodeCounter++;
    } else {
      // Arc for transitions
      if (isReversed) {
        [startAngle, endAngle] = [endAngle, startAngle];
      }
      if (endAngle < startAngle) {
        endAngle += Math.PI * 2;
      }
      // TikZ needs the angles to be in between -2pi and 2pi or it breaks
      if (Math.min(startAngle, endAngle) < -2 * Math.PI) {
        startAngle += 2 * Math.PI;
        endAngle += 2 * Math.PI;
      } else if (Math.max(startAngle, endAngle) > 2 * Math.PI) {
        startAngle -= 2 * Math.PI;
        endAngle -= 2 * Math.PI;
      }
      startAngle = -startAngle;
      endAngle = -endAngle;

      const colorName = this._getColorName(this.strokeStyle);
      this._texData += `\\draw[transition, ${colorName}] (${this.fixed(
        x + radius * Math.cos(startAngle),
        2
      )},${this.fixed(
        -y + radius * Math.sin(startAngle),
        2
      )}) arc (${this.fixed((startAngle * 180) / Math.PI, 1)}:${this.fixed(
        (endAngle * 180) / Math.PI,
        1
      )}:${this.fixed(radius, 2)});\n`;
    }
  }

  _getColorName(hexColor) {
    const colorMap = {
      "#3b82f6": "fsmblue",
      "#ef4444": "fsmred",
      "#10b981": "fsmgreen",
      "#8b5cf6": "fsmpurple",
      "#f59e0b": "fsmorange",
      "#6b7280": "fsmgray",
      "#000000": "black",
      "#ffffff": "white",
    };
    return colorMap[hexColor] || "black";
  }

  moveTo(x, y) {
    x *= this._scale;
    y *= this._scale;
    this._points.push({ x, y });
  }

  lineTo(x, y) {
    this.moveTo(x, y);
  }

  stroke() {
    if (this._points.length === 0) return;
    const colorName = this._getColorName(this.strokeStyle);
    this._texData += `\\draw[transition, ${colorName}]`;
    for (let i = 0; i < this._points.length; i++) {
      const p = this._points[i];
      this._texData +=
        (i > 0 ? " --" : "") +
        ` (${this.fixed(p.x, 2)},${this.fixed(-p.y, 2)})`;
    }
    this._texData += ";\n";
  }

  fill() {
    if (this._points.length === 0) return;
    const colorName = this._getColorName(this.fillStyle);
    this._texData += `\\fill[${colorName}]`;
    for (let i = 0; i < this._points.length; i++) {
      const p = this._points[i];
      this._texData +=
        (i > 0 ? " --" : "") +
        ` (${this.fixed(p.x, 2)},${this.fixed(-p.y, 2)})`;
    }
    this._texData += ";\n";
  }

  measureText(text) {
    // Create a temporary canvas to measure text
    const canvas = document.createElement("canvas");
    const c = canvas.getContext("2d");
    c.font = '20px "Times New Roman", serif';
    return c.measureText(text);
  }

  advancedFillText(text, originalText, x, y, angleOrNull) {
    if (text.replace(" ", "").length > 0) {
      let nodeParams = "";
      // x and y start off as the center of the text, but will be moved to one side of the box when angleOrNull != null
      if (angleOrNull != null) {
        const width = this.measureText(text).width;
        const dx = Math.cos(angleOrNull);
        const dy = Math.sin(angleOrNull);
        if (Math.abs(dx) > Math.abs(dy)) {
          if (dx > 0) {
            nodeParams = "[right] ";
            x -= width / 2;
          } else {
            nodeParams = "[left] ";
            x += width / 2;
          }
        } else {
          if (dy > 0) {
            nodeParams = "[below] ";
            y -= 10;
          } else {
            nodeParams = "[above] ";
            y += 10;
          }
        }
      }
      x *= this._scale;
      y *= this._scale;
      this._texData += `\\node[font=\\small] at (${this.fixed(
        x,
        2
      )},${this.fixed(-y, 2)}) {${this.textToLaTeX(originalText)}};\n`;
    }
  }

  translate() {}
  save() {}
  restore() {}
  clearRect() {}

  textToLaTeX(text) {
    if (!text) return "";
    // Escape LaTeX special characters
    return text
      .replace(/\\/g, "\\textbackslash{}")
      .replace(/\{/g, "\\{")
      .replace(/\}/g, "\\}")
      .replace(/\$/g, "\\$")
      .replace(/&/g, "\\&")
      .replace(/%/g, "\\%")
      .replace(/#/g, "\\#")
      .replace(/\^/g, "\\textasciicircum{}")
      .replace(/_/g, "\\_")
      .replace(/~/g, "\\textasciitilde{}");
  }

  fixed(number, digits) {
    return number.toFixed(digits).replace(/0+$/, "").replace(/\.$/, "");
  }
}

export class ExportAsSVG {
  constructor() {
    this.fillStyle = "black";
    this.strokeStyle = "black";
    this.lineWidth = 1;
    this.font = "12px Arial, sans-serif";
    this._points = [];
    this._svgData = "";
    this._transX = 0;
    this._transY = 0;
  }

  toSVG() {
    // Calculate bounds from the SVG data
    const bounds = this.calculateBounds();

    const padding = 50; // Add padding around the content
    const contentWidth = bounds.maxX - bounds.minX;
    const contentHeight = bounds.maxY - bounds.minY;
    const width = Math.max(800, contentWidth + 2 * padding);
    const height = Math.max(600, contentHeight + 2 * padding);

    // Create viewBox for proper scaling - viewBox defines the coordinate system
    const viewBox = `${bounds.minX - padding} ${bounds.minY - padding} ${
      contentWidth + 2 * padding
    } ${contentHeight + 2 * padding}`;

    return (
      '<?xml version="1.0" standalone="no"?>\n<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n\n<svg width="' +
      width +
      '" height="' +
      height +
      '" viewBox="' +
      viewBox +
      '" version="1.1" xmlns="http://www.w3.org/2000/svg">\n' +
      this._svgData +
      "</svg>\n"
    );
  }

  calculateBounds() {
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    // Parse SVG data to find coordinates from various SVG elements
    const patterns = [
      // Circle coordinates: cx="123.45" cy="67.89"
      /cx="([\d.-]+)"\s+cy="([\d.-]+)"/g,
      // Ellipse coordinates: cx="123.45" cy="67.89" rx="20" ry="20"
      /cx="([\d.-]+)"\s+cy="([\d.-]+)"\s+rx="([\d.-]+)"/g,
      // Path coordinates: M 123.45,67.89 or A 20,20 0 0 1 123.45,67.89
      /[MA]\s+([\d.-]+),([\d.-]+)/g,
      // Polygon points: points="123.45,67.89 234.56,78.90"
      /points="([^"]+)"/g,
      // Text coordinates: x="123.45" y="67.89"
      /x="([\d.-]+)"\s+y="([\d.-]+)"/g,
    ];

    patterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(this._svgData)) !== null) {
        if (pattern.source.includes("points=")) {
          // Handle polygon points
          const points = match[1].split(/[\s,]+/).filter((p) => p.trim());
          for (let i = 0; i < points.length; i += 2) {
            if (i + 1 < points.length) {
              const x = parseFloat(points[i]);
              const y = parseFloat(points[i + 1]);
              if (!isNaN(x) && !isNaN(y)) {
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
              }
            }
          }
        } else if (pattern.source.includes("rx=")) {
          // Handle ellipse with radius
          const x = parseFloat(match[1]);
          const y = parseFloat(match[2]);
          const rx = parseFloat(match[3]);
          if (!isNaN(x) && !isNaN(y) && !isNaN(rx)) {
            minX = Math.min(minX, x - rx);
            minY = Math.min(minY, y - rx);
            maxX = Math.max(maxX, x + rx);
            maxY = Math.max(maxY, y + rx);
          }
        } else {
          // Handle regular coordinates
          const x = parseFloat(match[1]);
          const y = parseFloat(match[2]);
          if (!isNaN(x) && !isNaN(y)) {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        }
      }
    });

    // If no coordinates found, return default bounds
    if (minX === Infinity) {
      return { minX: 0, minY: 0, maxX: 800, maxY: 600 };
    }

    return { minX, minY, maxX, maxY };
  }

  beginPath() {
    this._points = [];
  }

  arc(x, y, radius, startAngle, endAngle, isReversed) {
    x += this._transX;
    y += this._transY;
    const style = `stroke="${this.strokeStyle}" stroke-width="${this.lineWidth}" fill="${this.fillStyle}"`;

    if (endAngle - startAngle === Math.PI * 2) {
      this._svgData += `\t<ellipse ${style} cx="${this.fixed(
        x,
        3
      )}" cy="${this.fixed(y, 3)}" rx="${this.fixed(
        radius,
        3
      )}" ry="${this.fixed(radius, 3)}"/>\n`;
    } else {
      if (isReversed) {
        [startAngle, endAngle] = [endAngle, startAngle];
      }

      if (endAngle < startAngle) {
        endAngle += Math.PI * 2;
      }

      const startX = x + radius * Math.cos(startAngle);
      const startY = y + radius * Math.sin(startAngle);
      const endX = x + radius * Math.cos(endAngle);
      const endY = y + radius * Math.sin(endAngle);
      const useGreaterThan180 = Math.abs(endAngle - startAngle) > Math.PI;
      const goInPositiveDirection = 1;

      this._svgData += `\t<path ${style} d="`;
      this._svgData += `M ${this.fixed(startX, 3)},${this.fixed(startY, 3)} `; // startPoint(startX, startY)
      this._svgData += `A ${this.fixed(radius, 3)},${this.fixed(radius, 3)} `; // radii(radius, radius)
      this._svgData += "0 "; // value of 0 means perfect circle, others mean ellipse
      this._svgData += `${+useGreaterThan180} `;
      this._svgData += `${+goInPositiveDirection} `;
      this._svgData += `${this.fixed(endX, 3)},${this.fixed(endY, 3)}`; // endPoint(endX, endY)
      this._svgData += '"/>\n';
    }
  }

  moveTo(x, y) {
    x += this._transX;
    y += this._transY;
    this._points.push({ x, y });
  }

  lineTo(x, y) {
    this.moveTo(x, y);
  }

  stroke() {
    if (this._points.length === 0) return;
    this._svgData += `\t<polygon stroke="${this.strokeStyle}" stroke-width="${this.lineWidth}" points="`;
    for (let i = 0; i < this._points.length; i++) {
      this._svgData +=
        (i > 0 ? " " : "") +
        `${this.fixed(this._points[i].x, 3)},${this.fixed(
          this._points[i].y,
          3
        )}`;
    }
    this._svgData += '"/>\n';
  }

  fill() {
    if (this._points.length === 0) return;
    this._svgData += `\t<polygon fill="${this.fillStyle}" stroke="${this.strokeStyle}" stroke-width="${this.lineWidth}" points="`;
    for (let i = 0; i < this._points.length; i++) {
      this._svgData +=
        (i > 0 ? " " : "") +
        `${this.fixed(this._points[i].x, 3)},${this.fixed(
          this._points[i].y,
          3
        )}`;
    }
    this._svgData += '"/>\n';
  }

  measureText(text) {
    const canvas = document.createElement("canvas");
    const c = canvas.getContext("2d");
    c.font = '20px "Times New Roman", serif';
    return c.measureText(text);
  }

  fillText(text, x, y) {
    x += this._transX;
    y += this._transY;
    if (text.replace(" ", "").length > 0) {
      this._svgData += `\t<text x="${this.fixed(x, 3)}" y="${this.fixed(
        y,
        3
      )}" font-family="Times New Roman" font-size="20">${this.textToXML(
        text
      )}</text>\n`;
    }
  }

  translate(x, y) {
    this._transX = x;
    this._transY = y;
  }

  save() {}
  restore() {}
  clearRect() {}

  fixed(number, digits) {
    return number.toFixed(digits).replace(/0+$/, "").replace(/\.$/, "");
  }

  textToXML(text) {
    // Handle LaTeX commands first
    text = text
      .replace(/\\alpha/g, "α")
      .replace(/\\beta/g, "β")
      .replace(/\\gamma/g, "γ")
      .replace(/\\delta/g, "δ")
      .replace(/\\epsilon/g, "ε")
      .replace(/\\zeta/g, "ζ")
      .replace(/\\eta/g, "η")
      .replace(/\\theta/g, "θ")
      .replace(/\\iota/g, "ι")
      .replace(/\\kappa/g, "κ")
      .replace(/\\lambda/g, "λ")
      .replace(/\\mu/g, "μ")
      .replace(/\\nu/g, "ν")
      .replace(/\\xi/g, "ξ")
      .replace(/\\omicron/g, "ο")
      .replace(/\\pi/g, "π")
      .replace(/\\rho/g, "ρ")
      .replace(/\\sigma/g, "σ")
      .replace(/\\tau/g, "τ")
      .replace(/\\upsilon/g, "υ")
      .replace(/\\phi/g, "φ")
      .replace(/\\chi/g, "χ")
      .replace(/\\psi/g, "ψ")
      .replace(/\\omega/g, "ω")
      .replace(/\\Gamma/g, "Γ")
      .replace(/\\Delta/g, "Δ")
      .replace(/\\Theta/g, "Θ")
      .replace(/\\Lambda/g, "Λ")
      .replace(/\\Xi/g, "Ξ")
      .replace(/\\Pi/g, "Π")
      .replace(/\\Sigma/g, "Σ")
      .replace(/\\Upsilon/g, "Υ")
      .replace(/\\Phi/g, "Φ")
      .replace(/\\Psi/g, "Ψ")
      .replace(/\\Omega/g, "Ω")
      .replace(/\\infty/g, "∞")
      .replace(/\\emptyset/g, "∅")
      .replace(/\\in/g, "∈")
      .replace(/\\notin/g, "∉")
      .replace(/\\subset/g, "⊂")
      .replace(/\\supset/g, "⊃")
      .replace(/\\cup/g, "∪")
      .replace(/\\cap/g, "∩")
      .replace(/\\wedge/g, "∧")
      .replace(/\\vee/g, "∨")
      .replace(/\\neg/g, "¬")
      .replace(/\\rightarrow/g, "→")
      .replace(/\\leftarrow/g, "←")
      .replace(/\\leftrightarrow/g, "↔")
      .replace(/\\Rightarrow/g, "⇒")
      .replace(/\\Leftarrow/g, "⇐")
      .replace(/\\Leftrightarrow/g, "⇔")
      .replace(/\\forall/g, "∀")
      .replace(/\\exists/g, "∃")
      .replace(/\\sum/g, "∑")
      .replace(/\\prod/g, "∏")
      .replace(/\\int/g, "∫")
      .replace(/\\partial/g, "∂")
      .replace(/\\nabla/g, "∇")
      .replace(/\\pm/g, "±")
      .replace(/\\mp/g, "∓")
      .replace(/\\times/g, "×")
      .replace(/\\div/g, "÷")
      .replace(/\\leq/g, "≤")
      .replace(/\\geq/g, "≥")
      .replace(/\\neq/g, "≠")
      .replace(/\\approx/g, "≈")
      .replace(/\\equiv/g, "≡")
      .replace(/\\propto/g, "∝")
      .replace(/\\sim/g, "∼")
      .replace(/\\simeq/g, "≃")
      .replace(/\\cong/g, "≅")
      .replace(/\\perp/g, "⊥")
      .replace(/\\parallel/g, "∥")
      .replace(/\\angle/g, "∠")
      .replace(/\\triangle/g, "△")
      .replace(/\\square/g, "□")
      .replace(/\\diamond/g, "◇")
      .replace(/\\bullet/g, "•")
      .replace(/\\cdot/g, "·")
      .replace(/\\ldots/g, "…")
      .replace(/\\cdots/g, "⋯")
      .replace(/\\vdots/g, "⋮")
      .replace(/\\ddots/g, "⋱")
      .replace(/\\hbar/g, "ℏ")
      .replace(/\\ell/g, "ℓ")
      .replace(/\\Re/g, "ℜ")
      .replace(/\\Im/g, "ℑ")
      .replace(/\\aleph/g, "ℵ")
      .replace(/\\wp/g, "℘")
      .replace(/\\otimes/g, "⊗")
      .replace(/\\oplus/g, "⊕")
      .replace(/\\ominus/g, "⊖")
      .replace(/\\odot/g, "⊙")
      .replace(/\\oslash/g, "⊘")
      .replace(/\\bigcirc/g, "○")
      .replace(/\\triangleleft/g, "◁")
      .replace(/\\triangleright/g, "▷")
      .replace(/\\bigtriangleup/g, "△")
      .replace(/\\bigtriangledown/g, "▽")
      .replace(/\\lozenge/g, "◊")
      .replace(/\\blacksquare/g, "■")
      .replace(/\\blacktriangle/g, "▲")
      .replace(/\\blacktriangledown/g, "▼")
      .replace(/\\blacktriangleleft/g, "◀")
      .replace(/\\blacktriangleright/g, "▶")
      .replace(/\\star/g, "★")
      .replace(/\\ast/g, "∗")
      .replace(/\\circ/g, "∘")
      .replace(/\\bullet/g, "•")
      .replace(/\\cdot/g, "·")
      .replace(/\\ldots/g, "…")
      .replace(/\\cdots/g, "⋯")
      .replace(/\\vdots/g, "⋮")
      .replace(/\\ddots/g, "⋱")
      .replace(/\\hbar/g, "ℏ")
      .replace(/\\ell/g, "ℓ")
      .replace(/\\Re/g, "ℜ")
      .replace(/\\Im/g, "ℑ")
      .replace(/\\aleph/g, "ℵ")
      .replace(/\\wp/g, "℘")
      .replace(/\\otimes/g, "⊗")
      .replace(/\\oplus/g, "⊕")
      .replace(/\\ominus/g, "⊖")
      .replace(/\\odot/g, "⊙")
      .replace(/\\oslash/g, "⊘")
      .replace(/\\bigcirc/g, "○")
      .replace(/\\triangleleft/g, "◁")
      .replace(/\\triangleright/g, "▷")
      .replace(/\\bigtriangleup/g, "△")
      .replace(/\\bigtriangledown/g, "▽")
      .replace(/\\lozenge/g, "◊")
      .replace(/\\blacksquare/g, "■")
      .replace(/\\blacktriangle/g, "▲")
      .replace(/\\blacktriangledown/g, "▼")
      .replace(/\\blacktriangleleft/g, "◀")
      .replace(/\\blacktriangleright/g, "▶")
      .replace(/\\star/g, "★")
      .replace(/\\ast/g, "∗")
      .replace(/\\circ/g, "∘");

    // Then handle XML escaping
    text = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    let result = "";
    for (let i = 0; i < text.length; i++) {
      const c = text.charCodeAt(i);
      if (c >= 0x20 && c <= 0x7e) {
        result += text[i];
      } else {
        result += "&#" + c + ";";
      }
    }
    return result;
  }
}

// Utility functions for export
export const saveAsPNG = (canvas, quality = 1.0) => {
  if (!canvas) {
    console.error("Canvas is null or undefined");
    alert("Error: Canvas not found. Please try again.");
    return;
  }

  try {
    const pngData = canvas.toDataURL("image/png", quality);
    const link = document.createElement("a");
    link.download = "fsm-diagram.png";
    link.href = pngData;
    link.click();
  } catch (error) {
    console.error("PNG export failed:", error);
    alert("Error exporting PNG: " + error.message);
  }
};

export const saveAsHighResPNG = (canvas, scale = 2.0) => {
  if (!canvas) {
    console.error("Canvas is null or undefined");
    alert("Error: Canvas not found. Please try again.");
    return;
  }

  try {
    // Create a high-resolution canvas
    const highResCanvas = document.createElement("canvas");
    const ctx = highResCanvas.getContext("2d");

    // Set high-resolution dimensions
    highResCanvas.width = canvas.width * scale;
    highResCanvas.height = canvas.height * scale;

    // Scale the context
    ctx.scale(scale, scale);

    // Draw the original canvas onto the high-res canvas
    ctx.drawImage(canvas, 0, 0);

    // Export the high-resolution image
    const pngData = highResCanvas.toDataURL("image/png", 1.0);
    const link = document.createElement("a");
    link.download = "fsm-diagram-hd.png";
    link.href = pngData;
    link.click();
  } catch (error) {
    console.error("High-res PNG export failed:", error);
    alert("Error exporting high-res PNG: " + error.message);
  }
};

export const saveAsSVG = (
  nodes,
  links,
  nodeRadius = 20,
  stateColor = "#3b82f6",
  transitionColor = "#000000",
  stateFilled = false
) => {
  if (!nodes || !links) {
    console.error("Nodes or links are null or undefined");
    alert("Error: No diagram data found. Please create a diagram first.");
    return;
  }

  try {
    const exporter = new ExportAsSVG();
    exporter.strokeStyle = stateColor;
    exporter.fillStyle = stateFilled ? stateColor : "none";

    // Draw nodes
    nodes.forEach((node) => {
      // Draw the main state circle
      exporter.beginPath();
      exporter.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI, false);
      // No need to call fill() or stroke() separately - arc() handles both

      // Draw accept state inner circle if needed
      if (node.isAcceptState) {
        exporter.beginPath();
        exporter.arc(node.x, node.y, nodeRadius * 0.7, 0, 2 * Math.PI, false);
        // No need to call stroke() separately - arc() handles it
      }

      // Draw node text
      if (node.text) {
        exporter.fillText(node.text, node.x, node.y);
      }
    });

    // Draw links/transitions
    exporter.strokeStyle = transitionColor;
    links.forEach((link) => {
      if (link.constructor.name === "Link") {
        // Regular link between two nodes
        const stuff = link.getEndPointsAndCircle(nodeRadius);

        if (stuff.hasCircle) {
          // Curved transition
          exporter.beginPath();
          exporter.arc(
            stuff.circleX,
            stuff.circleY,
            stuff.circleRadius,
            stuff.startAngle,
            stuff.endAngle,
            stuff.isReversed
          );
          exporter.stroke();

          // Draw arrowhead
          const arrowAngle =
            stuff.endAngle - stuff.reverseScale * (Math.PI / 2);
          const arrowX = stuff.endX;
          const arrowY = stuff.endY;
          const arrowSize = 8;

          exporter.beginPath();
          exporter.moveTo(arrowX, arrowY);
          exporter.lineTo(
            arrowX -
              arrowSize * Math.cos(arrowAngle) +
              5 * Math.sin(arrowAngle),
            arrowY - arrowSize * Math.sin(arrowAngle) - 5 * Math.cos(arrowAngle)
          );
          exporter.lineTo(
            arrowX -
              arrowSize * Math.cos(arrowAngle) -
              5 * Math.sin(arrowAngle),
            arrowY - arrowSize * Math.sin(arrowAngle) + 5 * Math.cos(arrowAngle)
          );
          exporter.fillStyle = transitionColor; // Set fill color for arrowhead
          exporter.fill();
        } else {
          // Straight transition
          exporter.beginPath();
          exporter.moveTo(stuff.startX, stuff.startY);
          exporter.lineTo(stuff.endX, stuff.endY);
          exporter.stroke();

          // Draw arrowhead
          const angle = Math.atan2(
            stuff.endY - stuff.startY,
            stuff.endX - stuff.startX
          );
          const arrowSize = 8;

          exporter.beginPath();
          exporter.moveTo(stuff.endX, stuff.endY);
          exporter.lineTo(
            stuff.endX - arrowSize * Math.cos(angle) + 5 * Math.sin(angle),
            stuff.endY - arrowSize * Math.sin(angle) - 5 * Math.cos(angle)
          );
          exporter.lineTo(
            stuff.endX - arrowSize * Math.cos(angle) - 5 * Math.sin(angle),
            stuff.endY - arrowSize * Math.sin(angle) + 5 * Math.cos(angle)
          );
          exporter.fillStyle = transitionColor; // Set fill color for arrowhead
          exporter.fill();
        }

        // Draw transition text
        if (link.text) {
          let textX, textY;
          if (stuff.hasCircle) {
            const textAngle =
              (stuff.startAngle + stuff.endAngle) / 2 +
              stuff.isReversed * Math.PI;
            textX =
              stuff.circleX + (stuff.circleRadius + 30) * Math.cos(textAngle);
            textY =
              stuff.circleY + (stuff.circleRadius + 30) * Math.sin(textAngle);
          } else {
            textX = (stuff.startX + stuff.endX) / 2;
            textY = (stuff.startY + stuff.endY) / 2 - 20;
          }
          exporter.fillText(link.text, textX, textY);
        }
      } else if (link.constructor.name === "SelfLink") {
        // Self-loop transition
        const stuff = link.getEndPointsAndCircle(nodeRadius);

        exporter.beginPath();
        exporter.arc(
          stuff.circleX,
          stuff.circleY,
          stuff.circleRadius,
          stuff.startAngle,
          stuff.endAngle,
          false
        );
        exporter.stroke();

        // Draw arrowhead
        const arrowAngle = stuff.endAngle + Math.PI * 0.4;
        const arrowX = stuff.endX;
        const arrowY = stuff.endY;
        const arrowSize = 8;

        exporter.beginPath();
        exporter.moveTo(arrowX, arrowY);
        exporter.lineTo(
          arrowX - arrowSize * Math.cos(arrowAngle) + 5 * Math.sin(arrowAngle),
          arrowY - arrowSize * Math.sin(arrowAngle) - 5 * Math.cos(arrowAngle)
        );
        exporter.lineTo(
          arrowX - arrowSize * Math.cos(arrowAngle) - 5 * Math.sin(arrowAngle),
          arrowY - arrowSize * Math.sin(arrowAngle) + 5 * Math.cos(arrowAngle)
        );
        exporter.fillStyle = transitionColor; // Set fill color for arrowhead
        exporter.fill();

        // Draw transition text
        if (link.text) {
          const centerAngle = (stuff.startAngle + stuff.endAngle) / 2;
          const textX =
            stuff.circleX + (stuff.circleRadius + 15) * Math.cos(centerAngle);
          const textY =
            stuff.circleY + (stuff.circleRadius + 15) * Math.sin(centerAngle);
          exporter.fillText(link.text, textX, textY);
        }
      } else if (link.constructor.name === "StartLink") {
        // Start transition
        const stuff = link.getEndPoints(nodeRadius);

        exporter.beginPath();
        exporter.moveTo(stuff.startX, stuff.startY);
        exporter.lineTo(stuff.endX, stuff.endY);
        exporter.stroke();

        // Draw arrowhead
        const angle = Math.atan2(-link.deltaY, -link.deltaX);
        const arrowSize = 8;

        exporter.beginPath();
        exporter.moveTo(stuff.endX, stuff.endY);
        exporter.lineTo(
          stuff.endX - arrowSize * Math.cos(angle) + 5 * Math.sin(angle),
          stuff.endY - arrowSize * Math.sin(angle) - 5 * Math.cos(angle)
        );
        exporter.lineTo(
          stuff.endX - arrowSize * Math.cos(angle) - 5 * Math.sin(angle),
          stuff.endY - arrowSize * Math.sin(angle) + 5 * Math.cos(angle)
        );
        exporter.fillStyle = transitionColor; // Set fill color for arrowhead
        exporter.fill();

        // Draw transition text
        if (link.text) {
          const textAngle = Math.atan2(
            stuff.startY - stuff.endY,
            stuff.startX - stuff.endX
          );
          exporter.fillText(link.text, stuff.startX, stuff.startY);
        }
      }
    });

    const svgData = exporter.toSVG();
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "fsm-diagram.svg";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("SVG export failed:", error);
    alert("Error exporting SVG: " + error.message);
  }
};

// Helper function to get a color name from hex color
const getColorName = (hexColor) => {
  const colorMap = {
    "#3b82f6": "blue500",
    "#ef4444": "red500",
    "#10b981": "green500",
    "#8b5cf6": "purple500",
    "#f59e0b": "orange500",
    "#6b7280": "gray500",
    "#000000": "black",
    "#ffffff": "white",
  };

  return (
    colorMap[hexColor.toLowerCase()] || "custom" + hexColor.replace("#", "")
  );
};

export const saveAsLaTeX = (
  nodes,
  links,
  nodeRadius = 20,
  stateColor = "#3b82f6",
  transitionColor = "#000000",
  stateFilled = false,
  title = "Finite State Machine",
  author = "FSM Designer"
) => {
  try {
    let texData = "";

    // Simple document structure matching your format
    texData += "\\documentclass[12pt]{article}\n";
    texData += "\\usepackage{xcolor}      % <-- for HTML color codes\n";
    texData += "\\usepackage{tikz}\n\n";

    // Define colors based on the actual colors used
    const stateColorName = getColorName(stateColor);
    const transitionColorName = getColorName(transitionColor);

    texData += `% define reusable color names\n`;
    texData += `\\definecolor{${stateColorName}}{HTML}{${stateColor
      .replace("#", "")
      .toUpperCase()}}\n`;
    if (transitionColorName !== stateColorName) {
      texData += `\\definecolor{${transitionColorName}}{HTML}{${transitionColor
        .replace("#", "")
        .toUpperCase()}}\n`;
    }
    texData += "\n";

    texData += "\\begin{document}\n\n";
    texData += "\\begin{center}\n";
    texData += "\\begin{tikzpicture}[scale=0.2]\n";
    texData += "\\tikzstyle{every node}+=[inner sep=0pt]\n";

    // Draw nodes as circles
    nodes.forEach((node, index) => {
      const x = (node.x * 0.2).toFixed(1);
      const y = (-node.y * 0.2).toFixed(1);

      if (stateFilled) {
        // Filled state - draw filled circle
        texData += `\\fill [${stateColorName}] (${x},${y}) circle (2);\n`;
        texData += `\\draw [${stateColorName}] (${x},${y}) circle (2);\n`;
      } else {
        // Unfilled state - just draw circle outline
        texData += `\\draw [${stateColorName}] (${x},${y}) circle (2);\n`;
      }

      if (node.text) {
        texData += `\\draw (${x},${y}) node {$${node.text}$};\n`;
      }
    });

    // Draw transitions
    links.forEach((link, index) => {
      if (link.constructor.name === "Link") {
        const x1 = (link.nodeA.x * 0.2).toFixed(1);
        const y1 = (-link.nodeA.y * 0.2).toFixed(1);
        const x2 = (link.nodeB.x * 0.2).toFixed(1);
        const y2 = (-link.nodeB.y * 0.2).toFixed(1);

        texData += `\\draw [${transitionColorName}] (${x1},${y1}) -- (${x2},${y2});\n`;
        texData += `\\fill [${transitionColorName}] (${x2},${y2}) -- (${(
          parseFloat(x2) - 0.5
        ).toFixed(1)},${(parseFloat(y2) - 0.5).toFixed(1)}) -- (${(
          parseFloat(x2) - 0.5
        ).toFixed(1)},${(parseFloat(y2) + 0.5).toFixed(1)});\n`;

        if (link.text) {
          const midX = ((parseFloat(x1) + parseFloat(x2)) / 2).toFixed(1);
          const midY = ((parseFloat(y1) + parseFloat(y2)) / 2).toFixed(1);
          texData += `\\draw (${midX},${midY}) node [right] {$${link.text}$};\n`;
        }
      } else if (link.constructor.name === "SelfLink") {
        const x = (link.node.x * 0.2).toFixed(1);
        const y = (-link.node.y * 0.2).toFixed(1);

        // Simple self-loop
        texData += `\\draw [${transitionColorName}] (${x},${y}) to [out=45,in=135,looseness=8] (${x},${y});\n`;

        if (link.text) {
          texData += `\\draw (${(parseFloat(x) + 1).toFixed(
            1
          )},${y}) node [right] {$${link.text}$};\n`;
        }
      } else if (link.constructor.name === "StartLink") {
        const x = (link.node.x * 0.2).toFixed(1);
        const y = (-link.node.y * 0.2).toFixed(1);
        const startX = (parseFloat(x) - 3).toFixed(1);

        texData += `\\draw [${transitionColorName}] (${startX},${y}) -- (${x},${y});\n`;
        texData += `\\fill [${transitionColorName}] (${x},${y}) -- (${(
          parseFloat(x) - 0.5
        ).toFixed(1)},${(parseFloat(y) - 0.5).toFixed(1)}) -- (${(
          parseFloat(x) - 0.5
        ).toFixed(1)},${(parseFloat(y) + 0.5).toFixed(1)});\n`;
        texData += `\\draw (${startX},${y}) node [above left] {start};\n`;
      }
    });

    // Close document
    texData += "\\end{tikzpicture}\n";
    texData += "\\end{center}\n";
    texData += "\\end{document}\n";

    // Download the file

    const blob = new Blob([texData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "fsm-diagram.tex";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("LaTeX Export - Error occurred:", error);
    alert("Error exporting LaTeX: " + error.message);
  }
};
