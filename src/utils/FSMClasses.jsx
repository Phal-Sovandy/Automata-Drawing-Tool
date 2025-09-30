// FSM Classes - Converted from original JavaScript

// Comprehensive LaTeX shortcuts conversion function
export function convertLatexShortcuts(text) {
  if (!text) return text;

  // Greek letters (uppercase and lowercase)
  const greekLetterNames = [
    "Alpha",
    "Beta",
    "Gamma",
    "Delta",
    "Epsilon",
    "Zeta",
    "Eta",
    "Theta",
    "Iota",
    "Kappa",
    "Lambda",
    "Mu",
    "Nu",
    "Xi",
    "Omicron",
    "Pi",
    "Rho",
    "Sigma",
    "Tau",
    "Upsilon",
    "Phi",
    "Chi",
    "Psi",
    "Omega",
  ];

  // Convert Greek letters
  for (let i = 0; i < greekLetterNames.length; i++) {
    const name = greekLetterNames[i];
    text = text.replace(
      new RegExp("\\\\" + name, "g"),
      String.fromCharCode(913 + i + (i > 16))
    );
    text = text.replace(
      new RegExp("\\\\" + name.toLowerCase(), "g"),
      String.fromCharCode(945 + i + (i > 16))
    );
  }

  // Mathematical symbols
  text = text
    .replace(/\\in/g, "∈")
    .replace(/\\notin/g, "∉")
    .replace(/\\subset/g, "⊂")
    .replace(/\\subseteq/g, "⊆")
    .replace(/\\supset/g, "⊃")
    .replace(/\\supseteq/g, "⊇")
    .replace(/\\cup/g, "∪")
    .replace(/\\cap/g, "∩")
    .replace(/\\emptyset/g, "∅")
    .replace(/\\infty/g, "∞")
    .replace(/\\forall/g, "∀")
    .replace(/\\exists/g, "∃")
    .replace(/\\neg/g, "¬")
    .replace(/\\land/g, "∧")
    .replace(/\\lor/g, "∨")
    .replace(/\\rightarrow/g, "→")
    .replace(/\\leftrightarrow/g, "↔")
    .replace(/\\equiv/g, "≡")
    .replace(/\\bullet/g, "•")
    .replace(/\\circbullet/g, "◦")
    .replace(/\\circ/g, "∘")
    .replace(/\\ast/g, "∗")
    .replace(/\\times/g, "×")
    .replace(/\\div/g, "÷")
    .replace(/\\pm/g, "±")
    .replace(/\\leq/g, "≤")
    .replace(/\\geq/g, "≥")
    .replace(/\\neq/g, "≠")
    .replace(/\\approx/g, "≈")
    .replace(/\\cong/g, "≅")
    .replace(/\\sim/g, "∼")
    .replace(/\\propto/g, "∝");

  // Arrows
  text = text
    .replace(/\\leftarrow/g, "←")
    .replace(/\\rightarrow/g, "→")
    .replace(/\\uparrow/g, "↑")
    .replace(/\\downarrow/g, "↓")
    .replace(/\\nwarrow/g, "↖")
    .replace(/\\nearrow/g, "↗")
    .replace(/\\swarrow/g, "↙")
    .replace(/\\searrow/g, "↘")
    .replace(/\\Leftarrow/g, "⇐")
    .replace(/\\Rightarrow/g, "⇒")
    .replace(/\\Uparrow/g, "⇑")
    .replace(/\\Downarrow/g, "⇓");

  // Subscripts
  for (let i = 0; i < 10; i++) {
    text = text.replace(
      new RegExp("_" + i, "g"),
      String.fromCharCode(8320 + i)
    );
  }

  return text;
}

export class Node {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.mouseOffsetX = 0;
    this.mouseOffsetY = 0;
    this.isAcceptState = false;
    this.text = "";
  }

  setMouseStart(x, y) {
    this.mouseOffsetX = this.x - x;
    this.mouseOffsetY = this.y - y;
  }

  setAnchorPoint(x, y) {
    this.x = x + this.mouseOffsetX;
    this.y = y + this.mouseOffsetY;
  }

  draw(c, nodeRadius, selectedObject, textSettings = {}) {
    // draw the circle
    c.beginPath();
    c.arc(this.x, this.y, nodeRadius, 0, 2 * Math.PI, false);
    c.fill();
    c.stroke();

    // draw the text
    this.drawText(
      c,
      this.text,
      this.x,
      this.y,
      null,
      selectedObject === this,
      textSettings
    );

    // draw a double circle for an accept state
    if (this.isAcceptState) {
      c.beginPath();
      c.arc(this.x, this.y, nodeRadius + 6, 0, 2 * Math.PI, false);
      c.stroke();
    }
  }

  closestPointOnCircle(x, y, nodeRadius) {
    const dx = x - this.x;
    const dy = y - this.y;
    const scale = Math.sqrt(dx * dx + dy * dy);
    return {
      x: this.x + (dx * nodeRadius) / scale,
      y: this.y + (dy * nodeRadius) / scale,
    };
  }

  containsPoint(x, y, nodeRadius) {
    return (
      (x - this.x) * (x - this.x) + (y - this.y) * (y - this.y) <
      nodeRadius * nodeRadius
    );
  }

  drawText(c, originalText, x, y, angleOrNull, isSelected, textSettings = {}) {
    if (!originalText) return;

    const text = this.convertLatexShortcuts(originalText);
    const fontSize = textSettings.stateTextSize || 20;
    const fontFamily = textSettings.fontFamily || '"Times New Roman", serif';
    c.font = `${fontSize}px ${fontFamily}`;
    c.textAlign = "center";
    c.textBaseline = "middle";

    if (isSelected) {
      c.fillStyle = "#007bff";
    } else {
      c.fillStyle = textSettings.stateTextColor || "#000";
    }

    // For nodes, just center the text at the position (no offset)
    c.fillText(text, Math.round(x), Math.round(y));
  }

  convertLatexShortcuts(text) {
    return convertLatexShortcuts(text);
  }
}

export class StandaloneArrow {
  constructor(startX, startY, endX, endY) {
    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;
    this.text = "";
    this.lineAngleAdjust = 0;

    // make anchor point relative to the start and end coordinates
    this.parallelPart = 0.5; // percentage from start to end
    this.perpendicularPart = 0; // pixels from line between start and end
  }

  getAnchorPoint() {
    const dx = this.endX - this.startX;
    const dy = this.endY - this.startY;
    const scale = Math.sqrt(dx * dx + dy * dy);
    return {
      x:
        this.startX +
        dx * this.parallelPart -
        (dy * this.perpendicularPart) / scale,
      y:
        this.startY +
        dy * this.parallelPart +
        (dx * this.perpendicularPart) / scale,
    };
  }

  setAnchorPoint(x, y) {
    const dx = this.endX - this.startX;
    const dy = this.endY - this.startY;
    const scale = Math.sqrt(dx * dx + dy * dy);
    if (scale === 0) {
      this.parallelPart = 0.5;
      this.perpendicularPart = 0;
      return;
    }

    // compute new parallel and perpendicular parts
    const newDx = x - this.startX;
    const newDy = y - this.startY;
    this.parallelPart = (dx * newDx + dy * newDy) / (scale * scale);
    this.perpendicularPart = (dx * newDy - dy * newDx) / scale;

    // restrict parallelPart to be between 0 and 1
    if (this.parallelPart < 0) {
      this.parallelPart = 0;
    } else if (this.parallelPart > 1) {
      this.parallelPart = 1;
    }
  }

  draw(c, nodeRadius, selectedObject, textSettings = {}) {
    // Set stroke style
    c.strokeStyle = selectedObject === this ? "#007bff" : "#000";

    // Calculate arrow direction and properties
    const dx = this.endX - this.startX;
    const dy = this.endY - this.startY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return; // Don't draw if no distance

    const unitX = dx / distance;
    const unitY = dy / distance;

    // Draw the main line/body of the arrow (same style as regular Link)
    c.beginPath();
    c.moveTo(this.startX, this.startY);
    c.lineTo(this.endX, this.endY);
    c.stroke();

    // Draw the arrowhead (same style as regular Link)
    const angle = Math.atan2(dy, dx);
    const dx_arrow = Math.cos(angle);
    const dy_arrow = Math.sin(angle);
    c.beginPath();
    c.moveTo(this.endX, this.endY);
    c.lineTo(
      this.endX - 8 * dx_arrow + 5 * dy_arrow,
      this.endY - 8 * dy_arrow - 5 * dx_arrow
    );
    c.lineTo(
      this.endX - 8 * dx_arrow - 5 * dy_arrow,
      this.endY - 8 * dy_arrow + 5 * dx_arrow
    );
    c.fill();

    // Draw the text
    const anchorPoint = this.getAnchorPoint();
    this.drawText(
      c,
      this.text,
      anchorPoint.x,
      anchorPoint.y,
      null,
      selectedObject === this,
      textSettings
    );
  }

  drawText(c, originalText, x, y, angleOrNull, isSelected, textSettings = {}) {
    if (!originalText) return;

    const text = this.convertLatexShortcuts(originalText);
    const fontSize = textSettings.textSize || 20;
    const fontFamily = textSettings.fontFamily || '"Times New Roman", serif';
    c.font = `${fontSize}px ${fontFamily}`;
    const width = c.measureText(text).width;

    // center the text
    x -= width / 2;

    // position the text intelligently if given an angle
    if (angleOrNull != null) {
      const cos = Math.cos(angleOrNull);
      const sin = Math.sin(angleOrNull);
      // Increased offset distances to prevent overlap with arrows
      const cornerPointX = (width / 2 + 15) * (cos > 0 ? 1 : -1);
      const cornerPointY = (25 + 15) * (sin > 0 ? 1 : -1);
      const slide =
        sin * Math.pow(Math.abs(sin), 40) * cornerPointX -
        cos * Math.pow(Math.abs(cos), 10) * cornerPointY;
      x += cornerPointX - sin * slide;
      y += cornerPointY + cos * slide;
    }

    // draw text
    x = Math.round(x);
    y = Math.round(y);

    if (isSelected) {
      c.fillStyle = "#007bff";
    } else {
      c.fillStyle = textSettings.textColor || "#000";
    }

    c.fillText(text, x, y + 6);
  }

  containsPoint(x, y, nodeRadius, hitTargetPadding) {
    // Check if the point is near the arrow line
    const tolerance = hitTargetPadding || 6;

    // Vector from start to end
    const dx = this.endX - this.startX;
    const dy = this.endY - this.startY;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length === 0) return false;

    // Unit vector along the arrow
    const ux = dx / length;
    const uy = dy / length;

    // Vector from start to point
    const px = x - this.startX;
    const py = y - this.startY;

    // Project point onto the arrow line
    const t = Math.max(0, Math.min(length, px * ux + py * uy));

    // Find the closest point on the line
    const closestX = this.startX + t * ux;
    const closestY = this.startY + t * uy;

    // Check distance from point to line
    const distX = x - closestX;
    const distY = y - closestY;
    const distance = Math.sqrt(distX * distX + distY * distY);

    return distance <= tolerance;
  }

  setMouseStart(x, y) {
    this.mouseOffsetX = 0;
    this.mouseOffsetY = 0;
  }

  getHandleAtPoint(x, y) {
    const handleRadius = 8;

    // Check start handle
    const startDist = Math.sqrt(
      (x - this.startX) ** 2 + (y - this.startY) ** 2
    );
    if (startDist <= handleRadius) {
      return "start";
    }

    // Check end handle
    const endDist = Math.sqrt((x - this.endX) ** 2 + (y - this.endY) ** 2);
    if (endDist <= handleRadius) {
      return "end";
    }

    // Check rotation handle
    const dx = this.endX - this.startX;
    const dy = this.endY - this.startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > 0) {
      const unitX = dx / distance;
      const unitY = dy / distance;
      const rotationHandleDistance = 30;
      const rotationX = this.startX + unitX * rotationHandleDistance;
      const rotationY = this.startY + unitY * rotationHandleDistance;

      const rotationDist = Math.sqrt(
        (x - rotationX) ** 2 + (y - rotationY) ** 2
      );
      if (rotationDist <= handleRadius) {
        return "rotation";
      }
    }

    return null;
  }

  updateFromHandle(handle, x, y, nodes = [], nodeRadius = 20) {
    switch (handle) {
      case "start":
        // Move the entire arrow
        const dx = x - this.startX;
        const dy = y - this.startY;
        this.startX = x;
        this.startY = y;
        this.endX += dx;
        this.endY += dy;
        break;

      case "end":
        // Change length and angle with snapping to nodes
        let endX = x;
        let endY = y;

        // Check for snapping to nodes
        const snapDistance = nodeRadius + 20; // Snap within 20 pixels of node edge
        let closestNode = null;
        let closestDistance = Infinity;

        nodes.forEach((node) => {
          const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
          if (distance < closestDistance && distance <= snapDistance) {
            closestDistance = distance;
            closestNode = node;
          }
        });

        if (closestNode) {
          // Snap to the closest point on the target node's circle
          const dx = x - closestNode.x;
          const dy = y - closestNode.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > 0) {
            endX = closestNode.x - (dx / distance) * nodeRadius;
            endY = closestNode.y - (dy / distance) * nodeRadius;
          }
        }

        this.endX = endX;
        this.endY = endY;
        break;

      case "rotation":
        // Rotate around start point
        const angle = Math.atan2(y - this.startY, x - this.startX);
        const currentLength = Math.sqrt(
          (this.endX - this.startX) ** 2 + (this.endY - this.startY) ** 2
        );
        this.endX = this.startX + Math.cos(angle) * currentLength;
        this.endY = this.startY + Math.sin(angle) * currentLength;
        break;
    }
  }

  convertLatexShortcuts(text) {
    const greekLetterNames = [
      "Alpha",
      "Beta",
      "Gamma",
      "Delta",
      "Epsilon",
      "Zeta",
      "Eta",
      "Theta",
      "Iota",
      "Kappa",
      "Lambda",
      "Mu",
      "Nu",
      "Xi",
      "Omicron",
      "Pi",
      "Rho",
      "Sigma",
      "Tau",
      "Upsilon",
      "Phi",
      "Chi",
      "Psi",
      "Omega",
    ];

    // greek letters
    for (let i = 0; i < greekLetterNames.length; i++) {
      const name = greekLetterNames[i];
      text = text.replace(
        new RegExp("\\\\" + name, "g"),
        String.fromCharCode(913 + i + (i > 16))
      );
      text = text.replace(
        new RegExp("\\\\" + name.toLowerCase(), "g"),
        String.fromCharCode(945 + i + (i > 16))
      );
    }

    // subscripts
    for (let i = 0; i <= 9; i++) {
      text = text.replace(
        new RegExp("_" + i, "g"),
        String.fromCharCode(8320 + i)
      );
    }

    return text;
  }
}

export class Link {
  constructor(a, b) {
    this.nodeA = a;
    this.nodeB = b;
    this.text = "";
    this.lineAngleAdjust = 0; // value to add to textAngle when link is straight line

    // make anchor point relative to the locations of nodeA and nodeB
    this.parallelPart = 0.5; // percentage from nodeA to nodeB
    this.perpendicularPart = 0; // pixels from line between nodeA and nodeB
  }

  getAnchorPoint() {
    const dx = this.nodeB.x - this.nodeA.x;
    const dy = this.nodeB.y - this.nodeA.y;
    const scale = Math.sqrt(dx * dx + dy * dy);
    return {
      x:
        this.nodeA.x +
        dx * this.parallelPart -
        (dy * this.perpendicularPart) / scale,
      y:
        this.nodeA.y +
        dy * this.parallelPart +
        (dx * this.perpendicularPart) / scale,
    };
  }

  setAnchorPoint(x, y, snapToPadding) {
    const dx = this.nodeB.x - this.nodeA.x;
    const dy = this.nodeB.y - this.nodeA.y;
    const scale = Math.sqrt(dx * dx + dy * dy);
    this.parallelPart =
      (dx * (x - this.nodeA.x) + dy * (y - this.nodeA.y)) / (scale * scale);
    this.perpendicularPart =
      (dx * (y - this.nodeA.y) - dy * (x - this.nodeA.x)) / scale;
    // snap to a straight line
    if (
      this.parallelPart > 0 &&
      this.parallelPart < 1 &&
      Math.abs(this.perpendicularPart) < snapToPadding
    ) {
      this.lineAngleAdjust = (this.perpendicularPart < 0) * Math.PI;
      this.perpendicularPart = 0;
    }
  }

  getEndPointsAndCircle(nodeRadius) {
    if (this.perpendicularPart === 0) {
      const midX = (this.nodeA.x + this.nodeB.x) / 2;
      const midY = (this.nodeA.y + this.nodeB.y) / 2;
      const start = this.nodeA.closestPointOnCircle(midX, midY, nodeRadius);
      const end = this.nodeB.closestPointOnCircle(midX, midY, nodeRadius);
      return {
        hasCircle: false,
        startX: start.x,
        startY: start.y,
        endX: end.x,
        endY: end.y,
      };
    }
    const anchor = this.getAnchorPoint();
    const circle = this.circleFromThreePoints(
      this.nodeA.x,
      this.nodeA.y,
      this.nodeB.x,
      this.nodeB.y,
      anchor.x,
      anchor.y
    );
    const isReversed = this.perpendicularPart > 0;
    const reverseScale = isReversed ? 1 : -1;
    const startAngle =
      Math.atan2(this.nodeA.y - circle.y, this.nodeA.x - circle.x) -
      (reverseScale * nodeRadius) / circle.radius;
    const endAngle =
      Math.atan2(this.nodeB.y - circle.y, this.nodeB.x - circle.x) +
      (reverseScale * nodeRadius) / circle.radius;
    const startX = circle.x + circle.radius * Math.cos(startAngle);
    const startY = circle.y + circle.radius * Math.sin(startAngle);
    const endX = circle.x + circle.radius * Math.cos(endAngle);
    const endY = circle.y + circle.radius * Math.sin(endAngle);
    return {
      hasCircle: true,
      startX,
      startY,
      endX,
      endY,
      startAngle,
      endAngle,
      circleX: circle.x,
      circleY: circle.y,
      circleRadius: circle.radius,
      reverseScale,
      isReversed,
    };
  }

  draw(c, nodeRadius, selectedObject, textSettings = {}) {
    const stuff = this.getEndPointsAndCircle(nodeRadius);
    // draw arc
    c.beginPath();
    if (stuff.hasCircle) {
      c.arc(
        stuff.circleX,
        stuff.circleY,
        stuff.circleRadius,
        stuff.startAngle,
        stuff.endAngle,
        stuff.isReversed
      );
    } else {
      c.moveTo(stuff.startX, stuff.startY);
      c.lineTo(stuff.endX, stuff.endY);
    }
    c.stroke();
    // draw the head of the arrow
    if (stuff.hasCircle) {
      this.drawArrow(
        c,
        stuff.endX,
        stuff.endY,
        stuff.endAngle - stuff.reverseScale * (Math.PI / 2)
      );
    } else {
      this.drawArrow(
        c,
        stuff.endX,
        stuff.endY,
        Math.atan2(stuff.endY - stuff.startY, stuff.endX - stuff.startX)
      );
    }
    // draw the text
    if (stuff.hasCircle) {
      let startAngle = stuff.startAngle;
      let endAngle = stuff.endAngle;
      if (endAngle < startAngle) {
        endAngle += Math.PI * 2;
      }
      const textAngle =
        (startAngle + endAngle) / 2 + stuff.isReversed * Math.PI;
      // Offset text from the curve to prevent overlap with the arrow
      const offsetDistance = 30; // Distance to offset text from the curve
      const textX =
        stuff.circleX +
        (stuff.circleRadius + offsetDistance) * Math.cos(textAngle);
      const textY =
        stuff.circleY +
        (stuff.circleRadius + offsetDistance) * Math.sin(textAngle);
      this.drawText(
        c,
        this.text,
        textX,
        textY,
        textAngle,
        selectedObject === this,
        textSettings
      );
    } else {
      const textX = (stuff.startX + stuff.endX) / 2;
      const textY = (stuff.startY + stuff.endY) / 2;
      const textAngle = Math.atan2(
        stuff.endY - stuff.startY,
        stuff.endX - stuff.startX
      );
      this.drawText(
        c,
        this.text,
        textX,
        textY,
        textAngle + this.lineAngleAdjust,
        selectedObject === this,
        textSettings
      );
    }
  }

  containsPoint(x, y, nodeRadius, hitTargetPadding) {
    const stuff = this.getEndPointsAndCircle(nodeRadius);
    if (stuff.hasCircle) {
      const dx = x - stuff.circleX;
      const dy = y - stuff.circleY;
      const distance = Math.sqrt(dx * dx + dy * dy) - stuff.circleRadius;
      if (Math.abs(distance) < hitTargetPadding) {
        let angle = Math.atan2(dy, dx);
        let startAngle = stuff.startAngle;
        let endAngle = stuff.endAngle;
        if (stuff.isReversed) {
          [startAngle, endAngle] = [endAngle, startAngle];
        }
        if (endAngle < startAngle) {
          endAngle += Math.PI * 2;
        }
        if (angle < startAngle) {
          angle += Math.PI * 2;
        } else if (angle > endAngle) {
          angle -= Math.PI * 2;
        }
        return angle > startAngle && angle < endAngle;
      }
    } else {
      const dx = stuff.endX - stuff.startX;
      const dy = stuff.endY - stuff.startY;
      const length = Math.sqrt(dx * dx + dy * dy);
      const percent =
        (dx * (x - stuff.startX) + dy * (y - stuff.startY)) / (length * length);
      const distance =
        (dx * (y - stuff.startY) - dy * (x - stuff.startX)) / length;
      return (
        percent > 0 && percent < 1 && Math.abs(distance) < hitTargetPadding
      );
    }
    return false;
  }

  drawArrow(c, x, y, angle) {
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x - 8 * dx + 5 * dy, y - 8 * dy - 5 * dx);
    c.lineTo(x - 8 * dx - 5 * dy, y - 8 * dy + 5 * dx);
    c.fill();
  }

  drawText(c, originalText, x, y, angleOrNull, isSelected, textSettings = {}) {
    if (!originalText) return;

    const text = this.convertLatexShortcuts(originalText);
    const fontSize = textSettings.textSize || 20;
    const fontFamily = textSettings.fontFamily || '"Times New Roman", serif';
    c.font = `${fontSize}px ${fontFamily}`;
    c.textAlign = "center";
    c.textBaseline = "middle";

    if (isSelected) {
      c.fillStyle = "#007bff";
    } else {
      c.fillStyle = textSettings.textColor || "#000";
    }

    // Simple offset positioning - just offset the text above the line
    const offsetDistance = 30; // Distance to offset text from the line (increased to prevent overlap)

    if (angleOrNull != null) {
      // Calculate perpendicular offset to position text above the line
      // Use -Math.PI / 2 to place text above the line (negative Y direction in canvas coordinates)
      const perpAngle = angleOrNull - Math.PI / 2; // 90 degrees perpendicular (above the line)
      x += Math.cos(perpAngle) * offsetDistance;
      y += Math.sin(perpAngle) * offsetDistance;
    }

    c.fillText(text, Math.round(x), Math.round(y));
  }

  convertLatexShortcuts(text) {
    return convertLatexShortcuts(text);
  }

  circleFromThreePoints(x1, y1, x2, y2, x3, y3) {
    const a = this.det(x1, y1, 1, x2, y2, 1, x3, y3, 1);
    const bx = -this.det(
      x1 * x1 + y1 * y1,
      y1,
      1,
      x2 * x2 + y2 * y2,
      y2,
      1,
      x3 * x3 + y3 * y3,
      y3,
      1
    );
    const by = this.det(
      x1 * x1 + y1 * y1,
      x1,
      1,
      x2 * x2 + y2 * y2,
      x2,
      1,
      x3 * x3 + y3 * y3,
      x3,
      1
    );
    const c = -this.det(
      x1 * x1 + y1 * y1,
      x1,
      y1,
      x2 * x2 + y2 * y2,
      x2,
      y2,
      x3 * x3 + y3 * y3,
      x3,
      y3
    );
    return {
      x: -bx / (2 * a),
      y: -by / (2 * a),
      radius: Math.sqrt(bx * bx + by * by - 4 * a * c) / (2 * Math.abs(a)),
    };
  }

  det(a, b, c, d, e, f, g, h, i) {
    return (
      a * e * i + b * f * g + c * d * h - a * f * h - b * d * i - c * e * g
    );
  }
}

export class SelfLink {
  constructor(node, mouse) {
    this.node = node;
    this.anchorAngle = 0;
    this.mouseOffsetAngle = 0;
    this.loopRadius = 1.5; // Default loop radius multiplier (1.5 * nodeRadius)
    this.text = "";

    if (mouse) {
      this.setAnchorPoint(mouse.x, mouse.y);
    }
  }

  setMouseStart(x, y) {
    this.mouseOffsetAngle =
      this.anchorAngle - Math.atan2(y - this.node.y, x - this.node.x);
  }

  setAnchorPoint(x, y) {
    this.anchorAngle =
      Math.atan2(y - this.node.y, x - this.node.x) + this.mouseOffsetAngle;
    // snap to 90 degrees
    const snap = Math.round(this.anchorAngle / (Math.PI / 2)) * (Math.PI / 2);
    if (Math.abs(this.anchorAngle - snap) < 0.1) this.anchorAngle = snap;
    // keep in the range -pi to pi so our containsPoint() function always works
    if (this.anchorAngle < -Math.PI) this.anchorAngle += 2 * Math.PI;
    if (this.anchorAngle > Math.PI) this.anchorAngle -= 2 * Math.PI;
  }

  getEndPointsAndCircle(nodeRadius) {
    const circleX =
      this.node.x + this.loopRadius * nodeRadius * Math.cos(this.anchorAngle);
    const circleY =
      this.node.y + this.loopRadius * nodeRadius * Math.sin(this.anchorAngle);
    const circleRadius = 0.75 * nodeRadius;
    const startAngle = this.anchorAngle - Math.PI * 0.8;
    const endAngle = this.anchorAngle + Math.PI * 0.8;
    const startX = circleX + circleRadius * Math.cos(startAngle);
    const startY = circleY + circleRadius * Math.sin(startAngle);
    const endX = circleX + circleRadius * Math.cos(endAngle);
    const endY = circleY + circleRadius * Math.sin(endAngle);
    return {
      hasCircle: true,
      startX,
      startY,
      endX,
      endY,
      startAngle,
      endAngle,
      circleX,
      circleY,
      circleRadius,
    };
  }

  draw(c, nodeRadius, selectedObject, textSettings = {}) {
    const stuff = this.getEndPointsAndCircle(nodeRadius);
    // draw arc
    c.beginPath();
    c.arc(
      stuff.circleX,
      stuff.circleY,
      stuff.circleRadius,
      stuff.startAngle,
      stuff.endAngle,
      false
    );
    c.stroke();
    // draw the text centered on the loop arc
    const centerAngle = (stuff.startAngle + stuff.endAngle) / 2;
    // Offset text from the curve to prevent overlap with the arrow
    const offsetDistance = 15; // Distance to offset text from the curve (reduced for self-loops)
    const textX =
      stuff.circleX +
      (stuff.circleRadius + offsetDistance) * Math.cos(centerAngle);
    const textY =
      stuff.circleY +
      (stuff.circleRadius + offsetDistance) * Math.sin(centerAngle);
    this.drawText(
      c,
      this.text,
      textX,
      textY,
      centerAngle,
      selectedObject === this,
      textSettings
    );
    // draw the head of the arrow
    this.drawArrow(c, stuff.endX, stuff.endY, stuff.endAngle + Math.PI * 0.4);
  }

  containsPoint(x, y, nodeRadius, hitTargetPadding) {
    const stuff = this.getEndPointsAndCircle(nodeRadius);
    const dx = x - stuff.circleX;
    const dy = y - stuff.circleY;
    const distance = Math.sqrt(dx * dx + dy * dy) - stuff.circleRadius;
    return Math.abs(distance) < hitTargetPadding;
  }

  drawArrow(c, x, y, angle) {
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x - 8 * dx + 5 * dy, y - 8 * dy - 5 * dx);
    c.lineTo(x - 8 * dx - 5 * dy, y - 8 * dy + 5 * dx);
    c.fill();
  }

  getHandleAtPoint(x, y, nodeRadius) {
    const stuff = this.getEndPointsAndCircle(nodeRadius);
    const handleRadius = 8;

    // Check center handle
    const centerDist = Math.sqrt(
      (x - stuff.circleX) ** 2 + (y - stuff.circleY) ** 2
    );
    if (centerDist <= handleRadius) {
      return "center";
    }

    // Check radius handle
    const radiusHandleX =
      this.node.x + this.loopRadius * nodeRadius * Math.cos(this.anchorAngle);
    const radiusHandleY =
      this.node.y + this.loopRadius * nodeRadius * Math.sin(this.anchorAngle);
    const radiusDist = Math.sqrt(
      (x - radiusHandleX) ** 2 + (y - radiusHandleY) ** 2
    );
    if (radiusDist <= handleRadius) {
      return "radius";
    }

    // Check angle handle
    const angleHandleDistance = 1.5 * nodeRadius;
    const angleHandleX =
      this.node.x + angleHandleDistance * Math.cos(this.anchorAngle);
    const angleHandleY =
      this.node.y + angleHandleDistance * Math.sin(this.anchorAngle);
    const angleDist = Math.sqrt(
      (x - angleHandleX) ** 2 + (y - angleHandleY) ** 2
    );
    if (angleDist <= handleRadius) {
      return "angle";
    }

    return null;
  }

  updateFromHandle(handle, x, y, nodeRadius) {
    switch (handle) {
      case "center":
        // Move the entire loop by adjusting the anchor angle
        const newAngle = Math.atan2(y - this.node.y, x - this.node.x);
        this.anchorAngle = newAngle;
        break;

      case "radius":
        // Change the size of the loop by adjusting the loopRadius property
        const distance = Math.sqrt(
          (x - this.node.x) ** 2 + (y - this.node.y) ** 2
        );
        // Keep the loop at a reasonable distance (between 1.2 and 2.5 times node radius)
        const minDistance = 1.2 * nodeRadius;
        const maxDistance = 2.5 * nodeRadius;
        const clampedDistance = Math.max(
          minDistance,
          Math.min(maxDistance, distance)
        );
        // Update the loopRadius property instead of anchorAngle
        this.loopRadius = clampedDistance / nodeRadius;
        break;

      case "angle":
        // Change the position of the loop
        this.anchorAngle = Math.atan2(y - this.node.y, x - this.node.x);
        break;
    }
  }

  drawText(c, originalText, x, y, angleOrNull, isSelected, textSettings = {}) {
    if (!originalText) return;

    const text = this.convertLatexShortcuts(originalText);
    const fontSize = textSettings.textSize || 20;
    const fontFamily = textSettings.fontFamily || '"Times New Roman", serif';
    c.font = `${fontSize}px ${fontFamily}`;
    c.textAlign = "center";
    c.textBaseline = "middle";

    if (isSelected) {
      c.fillStyle = "#007bff";
    } else {
      c.fillStyle = textSettings.textColor || "#000";
    }

    // Simple offset positioning - just offset the text above the line
    const offsetDistance = 25; // Distance to offset text from the line (reduced for better spacing)

    if (angleOrNull != null) {
      // Calculate perpendicular offset to position text above the line
      // Use -Math.PI / 2 to place text above the line (negative Y direction in canvas coordinates)
      const perpAngle = angleOrNull - Math.PI / 2; // 90 degrees perpendicular (above the line)
      x += Math.cos(perpAngle) * offsetDistance;
      y += Math.sin(perpAngle) * offsetDistance;
    }

    c.fillText(text, Math.round(x), Math.round(y));
  }

  convertLatexShortcuts(text) {
    return convertLatexShortcuts(text);
  }
}

export class StartLink {
  constructor(node, start) {
    this.node = node;
    this.deltaX = 0;
    this.deltaY = 0;
    this.text = "";

    if (start) {
      this.setAnchorPoint(start.x, start.y);
    }
  }

  setAnchorPoint(x, y, snapToPadding) {
    this.deltaX = x - this.node.x;
    this.deltaY = y - this.node.y;

    if (Math.abs(this.deltaX) < snapToPadding) {
      this.deltaX = 0;
    }

    if (Math.abs(this.deltaY) < snapToPadding) {
      this.deltaY = 0;
    }
  }

  getEndPoints(nodeRadius) {
    const startX = this.node.x + this.deltaX;
    const startY = this.node.y + this.deltaY;
    const end = this.node.closestPointOnCircle(startX, startY, nodeRadius);
    return {
      startX,
      startY,
      endX: end.x,
      endY: end.y,
    };
  }

  draw(c, nodeRadius, selectedObject, textSettings = {}) {
    const stuff = this.getEndPoints(nodeRadius);

    // draw the line
    c.beginPath();
    c.moveTo(stuff.startX, stuff.startY);
    c.lineTo(stuff.endX, stuff.endY);
    c.stroke();

    // draw the text at the end without the arrow
    const textAngle = Math.atan2(
      stuff.startY - stuff.endY,
      stuff.startX - stuff.endX
    );
    this.drawText(
      c,
      this.text,
      stuff.startX,
      stuff.startY,
      textAngle,
      selectedObject === this,
      textSettings
    );

    // draw the head of the arrow
    this.drawArrow(
      c,
      stuff.endX,
      stuff.endY,
      Math.atan2(-this.deltaY, -this.deltaX)
    );
  }

  containsPoint(x, y, nodeRadius, hitTargetPadding) {
    const stuff = this.getEndPoints(nodeRadius);
    const dx = stuff.endX - stuff.startX;
    const dy = stuff.endY - stuff.startY;
    const length = Math.sqrt(dx * dx + dy * dy);
    const percent =
      (dx * (x - stuff.startX) + dy * (y - stuff.startY)) / (length * length);
    const distance =
      (dx * (y - stuff.startY) - dy * (x - stuff.startX)) / length;
    return percent > 0 && percent < 1 && Math.abs(distance) < hitTargetPadding;
  }

  drawArrow(c, x, y, angle) {
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x - 8 * dx + 5 * dy, y - 8 * dy - 5 * dx);
    c.lineTo(x - 8 * dx - 5 * dy, y - 8 * dy + 5 * dx);
    c.fill();
  }

  drawText(c, originalText, x, y, angleOrNull, isSelected, textSettings = {}) {
    if (!originalText) return;

    const text = this.convertLatexShortcuts(originalText);
    const fontSize = textSettings.textSize || 20;
    const fontFamily = textSettings.fontFamily || '"Times New Roman", serif';
    c.font = `${fontSize}px ${fontFamily}`;
    c.textAlign = "center";
    c.textBaseline = "middle";

    if (isSelected) {
      c.fillStyle = "#007bff";
    } else {
      c.fillStyle = textSettings.textColor || "#000";
    }

    // Simple offset positioning - just offset the text above the line
    const offsetDistance = 30; // Distance to offset text from the line (increased to prevent overlap)

    if (angleOrNull != null) {
      // Calculate perpendicular offset to position text above the line
      // Use -Math.PI / 2 to place text above the line (negative Y direction in canvas coordinates)
      const perpAngle = angleOrNull - Math.PI / 2; // 90 degrees perpendicular (above the line)
      x += Math.cos(perpAngle) * offsetDistance;
      y += Math.sin(perpAngle) * offsetDistance;
    }

    c.fillText(text, Math.round(x), Math.round(y));
  }

  convertLatexShortcuts(text) {
    return convertLatexShortcuts(text);
  }
}

export class TemporaryLink {
  constructor(from, to) {
    this.from = from;
    this.to = to;
  }

  draw(c) {
    // draw the line
    c.beginPath();
    c.moveTo(this.to.x, this.to.y);
    c.lineTo(this.from.x, this.from.y);
    c.stroke();

    // draw the head of the arrow
    this.drawArrow(
      c,
      this.to.x,
      this.to.y,
      Math.atan2(this.to.y - this.from.y, this.to.x - this.from.x)
    );
  }

  drawArrow(c, x, y, angle) {
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x - 8 * dx + 5 * dy, y - 8 * dy - 5 * dx);
    c.lineTo(x - 8 * dx - 5 * dy, y - 8 * dy + 5 * dx);
    c.fill();
  }
}
