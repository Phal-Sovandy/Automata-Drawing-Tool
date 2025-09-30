// IndexedDB utility functions for FSM canvas data persistence

const DB_NAME = "FSMCanvasDB";
const DB_VERSION = 2; // Increment version for schema changes
const STORE_NAME = "diagrams";

class IndexedDBManager {
  constructor() {
    this.db = null;
    this.isInitialized = false;
  }

  // Initialize the database
  async init() {
    if (this.isInitialized) {
      return this.db;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error("IndexedDB failed to open:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Delete old store if it exists
        if (db.objectStoreNames.contains("canvasData")) {
          db.deleteObjectStore("canvasData");
        }

        // Create new object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: "id",
            autoIncrement: true,
          });
          store.createIndex("name", "name", { unique: false });
          store.createIndex("type", "type", { unique: false });
          store.createIndex("lastSaved", "lastSaved", { unique: false });
          store.createIndex("createdAt", "createdAt", { unique: false });
        }
      };
    });
  }

  // Save canvas data to IndexedDB
  async saveCanvasData(
    canvasData,
    diagramName = "Untitled Diagram",
    diagramType = "DFA",
    diagramId = null,
    accentColor = "#36454f",
    canvasSize = "medium"
  ) {
    try {
      await this.init();

      const now = new Date().toISOString();
      const dataToSave = {
        name: diagramName,
        type: diagramType,
        accentColor: accentColor,
        canvasSize: canvasSize,
        lastSaved: now,
        canvasData: canvasData, // Store canvas data in a nested object
        version: "2.0",
        ...(diagramId && { id: diagramId }), // Only include id if updating existing
        ...(!diagramId && { createdAt: now }), // Only set createdAt for new diagrams
      };

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(dataToSave);

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          console.error("Failed to save canvas data:", request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error("Error saving canvas data:", error);
      throw error;
    }
  }

  // Load canvas data from IndexedDB by ID
  async loadCanvasData(diagramId = null) {
    try {
      await this.init();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], "readonly");
        const store = transaction.objectStore(STORE_NAME);

        let request;
        if (diagramId) {
          // Convert string ID to number if needed
          const numericId =
            typeof diagramId === "string" ? parseInt(diagramId) : diagramId;
          request = store.get(numericId);
        } else {
          // Load the most recently saved diagram using getAll() and sort
          request = store.getAll();
        }

        request.onsuccess = () => {
          const result = request.result;

          if (result) {
            let targetResult = result;

            // If result is an array (from getAll), get the most recent one
            if (Array.isArray(result)) {
              if (result.length > 0) {
                // Sort by lastSaved descending to get the most recent
                const sortedResults = result.sort((a, b) => {
                  const dateA = new Date(a.lastSaved || 0);
                  const dateB = new Date(b.lastSaved || 0);
                  return dateB - dateA;
                });
                targetResult = sortedResults[0];
              } else {
                resolve(null);
                return;
              }
            }

            // Return the canvas data with metadata
            const { canvasData, ...metadata } = targetResult;
            const finalData = {
              ...canvasData,
              ...metadata, // Add metadata after canvas data to avoid overwriting
            };
            resolve(finalData);
          } else if (diagramId) {
            // If specific diagram ID was requested but not found, try loading the most recent diagram
            // Try using getAll() and then sort by lastSaved to get the most recent
            const fallbackRequest = store.getAll();

            fallbackRequest.onsuccess = () => {
              const allResults = fallbackRequest.result;

              if (allResults && allResults.length > 0) {
                // Sort by lastSaved descending to get the most recent
                const sortedResults = allResults.sort((a, b) => {
                  const dateA = new Date(a.lastSaved || 0);
                  const dateB = new Date(b.lastSaved || 0);
                  return dateB - dateA;
                });

                const mostRecent = sortedResults[0];
                const { canvasData, ...metadata } = mostRecent;
                resolve({
                  ...canvasData,
                  ...metadata,
                });
              } else {
                resolve(null);
              }
            };

            fallbackRequest.onerror = () => {
              console.error(
                "Failed to load fallback diagram:",
                fallbackRequest.error
              );
              resolve(null);
            };
          } else {
            resolve(null);
          }
        };

        request.onerror = () => {
          console.error("Failed to load canvas data:", request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error("Error loading canvas data:", error);
      throw error;
    }
  }

  // Get all diagrams
  async getAllDiagrams() {
    try {
      await this.init();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
          const diagrams = request.result.map((diagram) => ({
            id: diagram.id,
            name: diagram.name,
            type: diagram.type,
            accentColor: diagram.accentColor || "#36454f",
            lastSaved: diagram.lastSaved,
            createdAt: diagram.createdAt,
            // Include basic stats from canvas data
            nodeCount: diagram.canvasData?.nodes?.length || 0,
            linkCount: diagram.canvasData?.links?.length || 0,
          }));

          // Sort by lastSaved descending (most recent first)
          diagrams.sort(
            (a, b) => new Date(b.lastSaved) - new Date(a.lastSaved)
          );

          resolve(diagrams);
        };

        request.onerror = () => {
          console.error("Failed to load diagrams:", request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error("Error loading diagrams:", error);
      throw error;
    }
  }

  // Update diagram metadata
  async updateDiagramMetadata(diagramId, updates) {
    try {
      await this.init();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const getRequest = store.get(diagramId);

        getRequest.onsuccess = () => {
          const diagram = getRequest.result;
          if (diagram) {
            // Update the metadata fields
            const updatedDiagram = {
              ...diagram,
              ...updates,
              lastSaved: new Date().toISOString(),
            };

            const putRequest = store.put(updatedDiagram);
            putRequest.onsuccess = () => {
              resolve(updatedDiagram);
            };
            putRequest.onerror = () => {
              console.error(
                "Failed to update diagram metadata:",
                putRequest.error
              );
              reject(putRequest.error);
            };
          } else {
            reject(new Error("Diagram not found"));
          }
        };

        getRequest.onerror = () => {
          console.error("Failed to get diagram:", getRequest.error);
          reject(getRequest.error);
        };
      });
    } catch (error) {
      console.error("Error updating diagram metadata:", error);
      throw error;
    }
  }

  // Delete a diagram
  async deleteDiagram(diagramId) {
    try {
      await this.init();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(diagramId);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          console.error("Failed to delete diagram:", request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error("Error deleting diagram:", error);
      throw error;
    }
  }

  // Clear all diagrams
  async clearAllDiagrams() {
    try {
      await this.init();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          console.error("Failed to clear diagrams:", request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error("Error clearing diagrams:", error);
      throw error;
    }
  }

  // Get database info
  async getDBInfo() {
    try {
      await this.init();

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.count();

        request.onsuccess = () => {
          resolve({
            name: DB_NAME,
            version: DB_VERSION,
            storeName: STORE_NAME,
            recordCount: request.result,
          });
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error("Error getting DB info:", error);
      throw error;
    }
  }

  // Check if IndexedDB is supported
  isSupported() {
    return "indexedDB" in window;
  }
}

// Create a singleton instance
const indexedDBManager = new IndexedDBManager();

export default indexedDBManager;
