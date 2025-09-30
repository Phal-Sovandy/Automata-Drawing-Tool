import React, { useEffect, useState } from "react";
import "./styles/index.css";
import TopNavigation from "./components/layout/TopNavigation.jsx";
import Sidebar from "./components/layout/Sidebar.jsx";
import Canvas from "./components/Canvas.jsx";
import HomePage from "./components/layout/HomePage.jsx";
import ConfirmationModal from "./components/modals/ConfirmationModal.jsx";
import LoadingSpinner from "./components/ui/LoadingSpinner.jsx";
import { FSMProvider, useFSM } from "./context/FSMContext.jsx";

function AppContent() {
  const {
    theme,
    isSidebarCollapsed,
    confirmationModal,
    actions,
    isInitialized,
  } = useFSM();
  const [systemTheme, setSystemTheme] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  );
  const [currentView, setCurrentView] = useState("homepage");
  const [isLoading, setIsLoading] = useState(true);
  const [modals, setModals] = useState({
    settings: false,
    shortcuts: false,
    specialChars: false,
    importJSON: false,
  });

  // Initialize routing and state persistence
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Get current path from URL
        const path = window.location.pathname;

        // Determine view based on URL path
        let view = "homepage";
        if (path === "/canvas" || path === "/editor") {
          view = "app";
        } else if (path === "/" || path === "") {
          view = "homepage";
        } else {
          // Invalid URL - redirect to homepage
          view = "homepage";
          window.history.replaceState({}, "", "/");
        }

        // Set the current view
        setCurrentView(view);

        // Update URL if needed
        if (view === "app" && path !== "/canvas" && path !== "/editor") {
          window.history.replaceState({}, "", "/canvas");
        } else if (view === "homepage" && path !== "/" && path !== "") {
          window.history.replaceState({}, "", "/");
        }

        // Save current view to localStorage
        localStorage.setItem("fsm-current-view", view);

        // Simulate loading time for better UX
        await new Promise((resolve) => setTimeout(resolve, 300));

        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing app:", error);
        setCurrentView("homepage");
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  // Determine the actual theme to apply
  const actualTheme = theme === "system" ? systemTheme : theme;
  const isDark = actualTheme === "dark";

  const handleNavigateToApp = async () => {
    setIsLoading(true);
    // Small delay for smooth transition
    await new Promise((resolve) => setTimeout(resolve, 200));
    setCurrentView("app");
    window.history.pushState({}, "", "/canvas");
    localStorage.setItem("fsm-current-view", "app");
    setIsLoading(false);
  };

  const handleNavigateToHome = async () => {
    setIsLoading(true);
    // Small delay for smooth transition
    await new Promise((resolve) => setTimeout(resolve, 200));
    setCurrentView("homepage");
    window.history.pushState({}, "", "/");
    localStorage.setItem("fsm-current-view", "homepage");
    setIsLoading(false);
  };

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (event) => {
      const path = window.location.pathname;
      if (path === "/canvas" || path === "/editor") {
        setCurrentView("app");
        localStorage.setItem("fsm-current-view", "app");
      } else if (path === "/" || path === "") {
        setCurrentView("homepage");
        localStorage.setItem("fsm-current-view", "homepage");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Handle FSM context initialization
  useEffect(() => {
    // If we're in the canvas view and FSM context just became initialized,
    // ensure we're not showing a loading state unnecessarily
    if (isInitialized && currentView === "app" && isLoading) {
      setIsLoading(false);
    }
  }, [isInitialized, currentView, isLoading]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check for Cmd (Mac) or Ctrl (Windows/Linux)
      const isCmd = event.metaKey || event.ctrlKey;

      if (isCmd) {
        switch (event.key.toLowerCase()) {
          case "h":
            event.preventDefault();
            handleNavigateToHome();
            break;
          case "s":
            event.preventDefault();
            // Save JSON - we'll need to trigger this from TopNavigation
            window.dispatchEvent(new CustomEvent("saveJSON"));
            break;
          case "i":
            event.preventDefault();
            // Import JSON - we'll need to trigger this from TopNavigation
            window.dispatchEvent(new CustomEvent("importJSON"));
            break;
          case ",":
            event.preventDefault();
            // Open preferences/settings
            window.dispatchEvent(new CustomEvent("openSettings"));
            break;
          case "u":
            event.preventDefault();
            // Open shortcuts list
            window.dispatchEvent(new CustomEvent("openShortcuts"));
            break;
          case "v":
            event.preventDefault();
            // Paste
            actions.paste();
            break;
          case "a":
            event.preventDefault();
            // Select all
            actions.selectAll();
            break;
          case "l":
            if (event.shiftKey) {
              event.preventDefault();
              // Toggle sidebar
              actions.toggleSidebar();
            } else {
              event.preventDefault();
              // Open special characters
              window.dispatchEvent(new CustomEvent("openSpecialChars"));
            }
            break;
          case "+":
          case "=":
            event.preventDefault();
            // Zoom in
            window.dispatchEvent(new CustomEvent("zoomIn"));
            break;
          case "-":
            event.preventDefault();
            // Zoom out
            window.dispatchEvent(new CustomEvent("zoomOut"));
            break;
          case "0":
            event.preventDefault();
            // Reset zoom
            window.dispatchEvent(new CustomEvent("resetZoom"));
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [actions]);

  // Add/remove body class for homepage scrolling
  useEffect(() => {
    if (currentView === "homepage") {
      document.body.classList.add("homepage-active");
    } else {
      document.body.classList.remove("homepage-active");
    }

    return () => {
      document.body.classList.remove("homepage-active");
    };
  }, [currentView]);

  // Show loading screen while initializing or navigating
  if (isLoading || !isInitialized) {
    return (
      <div className={`app-loading ${isDark ? "dark-theme" : ""}`}>
        <LoadingSpinner
          size="large"
          message={
            !isInitialized
              ? "Loading your diagram..."
              : "Loading Automata Drawing Tools..."
          }
        />
      </div>
    );
  }

  if (currentView === "homepage") {
    return (
      <div className={`app ${isDark ? "dark-theme" : ""}`}>
        <HomePage onNavigateToApp={handleNavigateToApp} />
        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          onClose={actions.hideConfirmation}
          onConfirm={confirmationModal.onConfirm}
          title={confirmationModal.title}
          message={confirmationModal.message}
          confirmText={confirmationModal.confirmText}
          cancelText={confirmationModal.cancelText}
          type={confirmationModal.type}
        />
      </div>
    );
  }

  return (
    <div
      className={`app ${isDark ? "dark-theme" : ""} ${
        isSidebarCollapsed ? "sidebar-collapsed" : ""
      }`}
    >
      <TopNavigation onNavigateToHome={handleNavigateToHome} />
      <div className="app-container">
        <Sidebar />
        <Canvas resolvedTheme={actualTheme} />
      </div>
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={actions.hideConfirmation}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText={confirmationModal.confirmText}
        cancelText={confirmationModal.cancelText}
        type={confirmationModal.type}
      />
    </div>
  );
}

function App() {
  return (
    <FSMProvider>
      <AppContent />
    </FSMProvider>
  );
}

export default App;
