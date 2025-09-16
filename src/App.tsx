// src/App.tsx
import React, { useEffect } from "react";
import { Canvas } from "./components/Canvas";
import { Toolbar } from "./components/Toolbar";
import { useDrawing } from "./hooks/useDrawing";
import { exportToJSON, importFromJSON } from "./utils/fileManager";

function App() {
  const {
    elements,
    tool,
    setTool,
    color,
    setColor,
    strokeWidth,
    setStrokeWidth,
    isDrawing,
    setIsDrawing,
    selectedElement,
    selectElement,
    currentElement,
    startPoint,
    pan,
    setPan,
    addElement,
    updateElement,
    deleteElement,
    clearCanvas,
    saveToHistory,
    getCanvasState,
    loadCanvasState,
    undo,
    redo,
    canUndo,
    canRedo,
    generateId,
  } = useDrawing();

  const handleSave = () => {
    exportToJSON(getCanvasState());
  };

  const handleLoad = (file: File) => {
    const confirmed =
      elements.length === 0 ||
      window.confirm(
        "Isso substituirá o conteúdo atual do canvas. Deseja continuar?"
      );

    if (confirmed) {
      importFromJSON(
        file,
        (state) => {
          loadCanvasState(state);
          saveToHistory();
        },
        (error) => {
          alert(error);
        }
      );
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case "s":
            event.preventDefault();
            handleSave();
            break;
          case "o":
            event.preventDefault();
            document.querySelector('input[type="file"]')?.click();
            break;
          case "z":
            event.preventDefault();
            if (event.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case "y":
            event.preventDefault();
            redo();
            break;
          case "e":
            setTool("eraser");
            break;
        }
      }

      // Tool shortcuts
      switch (event.key) {
        case "v":
          setTool("select");
          break;
        case "p":
          setTool("freehand");
          break;
        case "r":
          setTool("rectangle");
          break;
        case "c":
          setTool("circle");
          break;
        case "l":
          setTool("line");
          break;
        case "a":
          setTool("arrow");
          break;
        case "t":
          setTool("text");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave, undo, redo, setTool]);

  // Initial history save
  useEffect(() => {
    if (elements.length === 0 && canUndo === false && canRedo === false) {
      saveToHistory();
    }
  }, []);

  return (
    <div className="w-full h-screen overflow-hidden bg-gray-50 font-sans">
      <Toolbar
        tool={tool}
        setTool={setTool}
        color={color}
        setColor={setColor}
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
        onSave={handleSave}
        onLoad={handleLoad}
        onUndo={undo}
        onRedo={redo}
        onClear={clearCanvas}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      <Canvas
        elements={elements}
        tool={tool}
        color={color}
        strokeWidth={strokeWidth}
        isDrawing={isDrawing}
        setIsDrawing={setIsDrawing}
        selectedElement={selectedElement}
        selectElement={selectElement}
        currentElement={currentElement}
        startPoint={startPoint}
        pan={pan}
        setPan={setPan}
        addElement={addElement}
        updateElement={updateElement}
        deleteElement={deleteElement}
        generateId={generateId}
        saveToHistory={saveToHistory}
      />

      {/* Brand */}
      <div className="fixed top-4 right-4 text-2xl font-bold text-gray-800 select-none pointer-events-none">
        Rabisco
      </div>
    </div>
  );
}

export default App;
