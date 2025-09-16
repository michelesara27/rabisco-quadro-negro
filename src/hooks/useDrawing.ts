// src/hooks/useDrawing.ts
import { useState, useCallback, useRef } from "react";
import { DrawingElement, Point, Tool, CanvasState } from "../types/drawing";

export const useDrawing = () => {
  const [elements, setElements] = useState<DrawingElement[]>([]);
  const [tool, setTool] = useState<Tool>("select");
  // Altera a cor padrão para Branco (#FFFFFF) para contrastar com o fundo preto
  const [color, setColor] = useState("#FFFFFF");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [history, setHistory] = useState<CanvasState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });

  const currentElement = useRef<DrawingElement | null>(null);
  const startPoint = useRef<Point | null>(null);

  const saveToHistory = useCallback(() => {
    const newState: CanvasState = { elements, zoom: 1, pan };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [elements, pan, history, historyIndex]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addElement = useCallback((element: DrawingElement) => {
    setElements((prev) => [...prev, element]);
  }, []);

  const updateElement = useCallback(
    (id: string, updates: Partial<DrawingElement>) => {
      setElements((prev) =>
        prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
      );
    },
    []
  );

  const deleteElement = useCallback(
    (id: string) => {
      setElements((prev) => prev.filter((el) => el.id !== id));
      if (selectedElement === id) {
        setSelectedElement(null);
      }
    },
    [selectedElement]
  );

  const clearCanvas = useCallback(() => {
    setElements([]);
    setSelectedElement(null);
  }, []);

  const selectElement = useCallback((id: string | null) => {
    // Deselect all elements first
    setElements((prev) => prev.map((el) => ({ ...el, selected: false })));

    if (id) {
      setElements((prev) =>
        prev.map((el) => (el.id === id ? { ...el, selected: true } : el))
      );
      setSelectedElement(id);
    } else {
      setSelectedElement(null);
    }
  }, []);

  const getCanvasState = useCallback(
    (): CanvasState => ({
      elements,
      zoom: 1,
      pan,
    }),
    [elements, pan]
  );

  const loadCanvasState = useCallback((state: CanvasState) => {
    setElements(state.elements || []);
    setPan(state.pan || { x: 0, y: 0 });
    setSelectedElement(null);
  }, []);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      loadCanvasState(previousState);
      setHistoryIndex(historyIndex - 1);
    }
  }, [historyIndex, history, loadCanvasState]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      loadCanvasState(nextState);
      setHistoryIndex(historyIndex + 1);
    }
  }, [historyIndex, history, loadCanvasState]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return {
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
  };
};
