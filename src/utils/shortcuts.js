// Utility function to get the correct shortcut symbol based on platform
export const getShortcutSymbol = () => {
  // Check if we're on Mac (Cmd key) or Windows/Linux (Ctrl key)
  const isMac =
    navigator.userAgentData?.platform === "macOS" ||
    /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
  return isMac ? "⌘" : "Ctrl";
};

// Utility function to format shortcuts with the correct symbol
export const formatShortcut = (key) => {
  const symbol = getShortcutSymbol();
  return key.replace(/⌘/g, symbol);
};

// Common shortcuts with platform-appropriate symbols
export const SHORTCUTS = {
  CREATE_NEW: `${getShortcutSymbol()} ⇧ N`,
  GRID_VIEW: `${getShortcutSymbol()} 1`,
  LIST_VIEW: `${getShortcutSymbol()} 2`,
  UNDO: `${getShortcutSymbol()} Z`,
  REDO: `${getShortcutSymbol()} Y`,
  TOGGLE_SIDEBAR: `${getShortcutSymbol()} ⇧ L`,
  SAVE_JSON: `${getShortcutSymbol()} S`,
  IMPORT_JSON: `${getShortcutSymbol()} I`,
  PREFERENCES: `${getShortcutSymbol()} ,`,
  SHORTCUTS: `${getShortcutSymbol()} U`,
  SPECIAL_CHARS: `${getShortcutSymbol()} L`,
  HOME: `${getShortcutSymbol()} H`,
  SELECT_ALL: `${getShortcutSymbol()} A`,
  COPY: `${getShortcutSymbol()} C`,
  PASTE: `${getShortcutSymbol()} V`,
  ZOOM_IN: `${getShortcutSymbol()} +`,
  ZOOM_OUT: `${getShortcutSymbol()} -`,
  ZOOM_RESET: `${getShortcutSymbol()} 0`,
};
