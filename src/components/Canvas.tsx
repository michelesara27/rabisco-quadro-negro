// src/components/Canvas.tsx
import React, { useRef, useEffect, useState } from "react";
import { DrawingElement, Point, Tool } from "../types/drawing";

interface CanvasProps {
  elements: DrawingElement[];
  tool: Tool;
  color: string;
  strokeWidth: number;
  isDrawing: boolean;
  setIsDrawing: (drawing: boolean) => void;
  selectedElement: string | null;
  selectElement: (id: string | null) => void;
  currentElement: React.MutableRefObject<DrawingElement | null>;
  startPoint: React.MutableRefObject<Point | null>;
  pan: Point;
  setPan: (pan: Point) => void;
  addElement: (element: DrawingElement) => void;
  updateElement: (id: string, updates: Partial<DrawingElement>) => void;
  deleteElement: (id: string) => void;
  generateId: () => string;
  saveToHistory: () => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  elements,
  tool,
  color,
  strokeWidth,
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
  generateId,
  saveToHistory,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState<Point | null>(null);
  const [editingText, setEditingText] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });

  const getMousePosition = (event: React.MouseEvent): Point => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };

    const rect = svg.getBoundingClientRect();
    return {
      x: event.clientX - rect.left - pan.x,
      y: event.clientY - rect.top - pan.y,
    };
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    const point = getMousePosition(event);

    if (event.button === 1 || (event.button === 0 && event.metaKey)) {
      // Middle mouse or Cmd+click for panning
      setIsPanning(true);
      setLastPanPoint({ x: event.clientX, y: event.clientY });
      return;
    }

    if (tool === "select") {
      const clickedElement = findElementAtPoint(point);
      if (clickedElement) {
        selectElement(clickedElement.id);
        setIsDragging(true);
        setDragOffset({
          x: point.x - (clickedElement.x || 0),
          y: point.y - (clickedElement.y || 0),
        });
      } else {
        selectElement(null);
      }
      return;
    }

    if (tool === "eraser") {
      const clickedElement = findElementAtPoint(point);
      if (clickedElement) {
        deleteElement(clickedElement.id);
        saveToHistory();
      }
      return;
    }

    if (tool === "text") {
      const id = generateId();
      const textElement: DrawingElement = {
        id,
        type: "text",
        x: point.x,
        y: point.y,
        text: "Texto",
        color,
        strokeWidth: 1,
      };
      addElement(textElement);
      setEditingText(id);
      setTextInput("Texto");
      saveToHistory();
      return;
    }

    setIsDrawing(true);
    startPoint.current = point;

    const id = generateId();

    if (tool === "freehand") {
      currentElement.current = {
        id,
        type: "freehand",
        points: [point],
        color,
        strokeWidth,
      };
    } else if (tool === "rectangle") {
      currentElement.current = {
        id,
        type: "rectangle",
        x: point.x,
        y: point.y,
        width: 0,
        height: 0,
        color,
        strokeWidth,
      };
    } else if (tool === "circle") {
      currentElement.current = {
        id,
        type: "circle",
        x: point.x,
        y: point.y,
        width: 0,
        height: 0,
        color,
        strokeWidth,
      };
    } else if (tool === "line" || tool === "arrow") {
      currentElement.current = {
        id,
        type: tool,
        startPoint: point,
        endPoint: point,
        color,
        strokeWidth,
      };
    }

    if (currentElement.current) {
      addElement(currentElement.current);
    }
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (isPanning && lastPanPoint) {
      const deltaX = event.clientX - lastPanPoint.x;
      const deltaY = event.clientY - lastPanPoint.y;
      setPan({ x: pan.x + deltaX, y: pan.y + deltaY });
      setLastPanPoint({ x: event.clientX, y: event.clientY });
      return;
    }

    if (isDragging && selectedElement && tool === "select") {
      const point = getMousePosition(event);
      const selectedEl = elements.find((el) => el.id === selectedElement);

      if (selectedEl) {
        if (selectedEl.type === "text") {
          updateElement(selectedElement, {
            x: point.x - dragOffset.x,
            y: point.y - dragOffset.y,
          });
        } else if (
          selectedEl.type === "rectangle" ||
          selectedEl.type === "circle"
        ) {
          updateElement(selectedElement, {
            x: point.x - dragOffset.x,
            y: point.y - dragOffset.y,
          });
        } else if (selectedEl.type === "line" || selectedEl.type === "arrow") {
          const deltaX =
            point.x - dragOffset.x - (selectedEl.startPoint?.x || 0);
          const deltaY =
            point.y - dragOffset.y - (selectedEl.startPoint?.y || 0);
          updateElement(selectedElement, {
            startPoint: {
              x: (selectedEl.startPoint?.x || 0) + deltaX,
              y: (selectedEl.startPoint?.y || 0) + deltaY,
            },
            endPoint: {
              x: (selectedEl.endPoint?.x || 0) + deltaX,
              y: (selectedEl.endPoint?.y || 0) + deltaY,
            },
          });
        }
      }
      return;
    }

    if (tool === "eraser") {
      const clickedElement = findElementAtPoint(getMousePosition(event));
      if (clickedElement && event.buttons === 1) {
        deleteElement(clickedElement.id);
      }
      return;
    }
    if (!isDrawing || !currentElement.current) return;

    const point = getMousePosition(event);

    if (tool === "freehand") {
      updateElement(currentElement.current.id, {
        points: [...(currentElement.current.points || []), point],
      });
      if (currentElement.current.points) {
        currentElement.current.points.push(point);
      }
    } else if (tool === "rectangle" || tool === "circle") {
      const startP = startPoint.current!;
      const width = point.x - startP.x;
      const height = point.y - startP.y;

      updateElement(currentElement.current.id, {
        x: width < 0 ? point.x : startP.x,
        y: height < 0 ? point.y : startP.y,
        width: Math.abs(width),
        height: Math.abs(height),
      });
    } else if (tool === "line" || tool === "arrow") {
      updateElement(currentElement.current.id, {
        endPoint: point,
      });
      currentElement.current.endPoint = point;
    }
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      setLastPanPoint(null);
      return;
    }

    if (isDragging) {
      setIsDragging(false);
      setDragOffset({ x: 0, y: 0 });
      saveToHistory();
      return;
    }

    if (isDrawing) {
      setIsDrawing(false);
      currentElement.current = null;
      startPoint.current = null;
      saveToHistory();
    }
  };

  const findElementAtPoint = (point: Point): DrawingElement | null => {
    // Find element in reverse order (top to bottom)
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];

      if (element.type === "rectangle" || element.type === "circle") {
        if (
          element.x !== undefined &&
          element.y !== undefined &&
          element.width !== undefined &&
          element.height !== undefined
        ) {
          if (
            point.x >= element.x &&
            point.x <= element.x + element.width &&
            point.y >= element.y &&
            point.y <= element.y + element.height
          ) {
            return element;
          }
        }
      } else if (element.type === "text") {
        if (element.x !== undefined && element.y !== undefined) {
          // Rough text bounds
          const textWidth = (element.text?.length || 0) * 8;
          const textHeight = 20;
          if (
            point.x >= element.x &&
            point.x <= element.x + textWidth &&
            point.y >= element.y - textHeight &&
            point.y <= element.y
          ) {
            return element;
          }
        }
      } else if (element.type === "freehand" && element.points) {
        // Check if point is near any point in the freehand path
        for (const pathPoint of element.points) {
          const distance = Math.sqrt(
            Math.pow(point.x - pathPoint.x, 2) +
              Math.pow(point.y - pathPoint.y, 2)
          );
          if (distance <= element.strokeWidth + 5) {
            return element;
          }
        }
      } else if (element.type === "line" || element.type === "arrow") {
        if (element.startPoint && element.endPoint) {
          // Check if point is near the line
          const distance = distanceToLine(
            point,
            element.startPoint,
            element.endPoint
          );
          if (distance <= element.strokeWidth + 5) {
            return element;
          }
        }
      }
    }
    return null;
  };

  const distanceToLine = (point: Point, start: Point, end: Point): number => {
    const A = point.x - start.x;
    const B = point.y - start.y;
    const C = end.x - start.x;
    const D = end.y - start.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) {
      param = dot / lenSq;
    }

    let xx, yy;
    if (param < 0) {
      xx = start.x;
      yy = start.y;
    } else if (param > 1) {
      xx = end.x;
      yy = end.y;
    } else {
      xx = start.x + param * C;
      yy = start.y + param * D;
    }

    const dx = point.x - xx;
    const dy = point.y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleElementDoubleClick = (element: DrawingElement) => {
    if (element.type === "text") {
      setEditingText(element.id);
      setTextInput(element.text || "");
    }
  };

  const handleTextSubmit = () => {
    if (editingText && textInput.trim()) {
      updateElement(editingText, { text: textInput.trim() });
    }
    setEditingText(null);
    setTextInput("");
    saveToHistory();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Delete" && selectedElement) {
      deleteElement(selectedElement);
      saveToHistory();
    } else if (event.key === "Enter" && editingText) {
      handleTextSubmit();
    } else if (event.key === "Escape") {
      setEditingText(null);
      setTextInput("");
      selectElement(null);
    }
  };

  const renderElement = (element: DrawingElement) => {
    const baseProps = {
      stroke: element.color,
      strokeWidth: element.strokeWidth,
      fill: element.fill || "transparent",
      className: element.selected ? "drop-shadow-lg" : "",
    };

    switch (element.type) {
      case "freehand":
        if (!element.points || element.points.length < 2) return null;
        const pathData = element.points.reduce((path, point, index) => {
          return index === 0
            ? `M${point.x},${point.y}`
            : `${path} L${point.x},${point.y}`;
        }, "");
        return (
          <path
            key={element.id}
            d={pathData}
            {...baseProps}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );

      case "rectangle":
        return (
          <rect
            key={element.id}
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            {...baseProps}
            rx="4"
            onDoubleClick={() => handleElementDoubleClick(element)}
          />
        );

      case "circle":
        return (
          <ellipse
            key={element.id}
            cx={(element.x || 0) + (element.width || 0) / 2}
            cy={(element.y || 0) + (element.height || 0) / 2}
            rx={(element.width || 0) / 2}
            ry={(element.height || 0) / 2}
            {...baseProps}
            onDoubleClick={() => handleElementDoubleClick(element)}
          />
        );

      case "line":
        return (
          <line
            key={element.id}
            x1={element.startPoint?.x}
            y1={element.startPoint?.y}
            x2={element.endPoint?.x}
            y2={element.endPoint?.y}
            {...baseProps}
            strokeLinecap="round"
          />
        );

      case "arrow":
        if (!element.startPoint || !element.endPoint) return null;
        const angle = Math.atan2(
          element.endPoint.y - element.startPoint.y,
          element.endPoint.x - element.startPoint.x
        );
        const arrowLength = 15;
        const arrowAngle = Math.PI / 6;

        const arrowPoint1 = {
          x: element.endPoint.x - arrowLength * Math.cos(angle - arrowAngle),
          y: element.endPoint.y - arrowLength * Math.sin(angle - arrowAngle),
        };
        const arrowPoint2 = {
          x: element.endPoint.x - arrowLength * Math.cos(angle + arrowAngle),
          y: element.endPoint.y - arrowLength * Math.sin(angle + arrowAngle),
        };

        return (
          <g key={element.id}>
            <line
              x1={element.startPoint.x}
              y1={element.startPoint.y}
              x2={element.endPoint.x}
              y2={element.endPoint.y}
              {...baseProps}
              strokeLinecap="round"
            />
            <path
              d={`M${element.endPoint.x},${element.endPoint.y} L${arrowPoint1.x},${arrowPoint1.y} L${arrowPoint2.x},${arrowPoint2.y} Z`}
              fill={element.color}
              stroke={element.color}
              strokeWidth={element.strokeWidth}
            />
          </g>
        );

      case "text":
        if (editingText === element.id) {
          return (
            <foreignObject
              key={element.id}
              x={element.x}
              y={(element.y || 0) - 20}
              width="200"
              height="30"
            >
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onBlur={handleTextSubmit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleTextSubmit();
                  if (e.key === "Escape") {
                    setEditingText(null);
                    setTextInput("");
                  }
                }}
                autoFocus
                className="w-full px-2 py-1 border border-blue-400 rounded text-sm bg-white"
                style={{ color: element.color }}
              />
            </foreignObject>
          );
        }

        return (
          <text
            key={element.id}
            x={element.x}
            y={element.y}
            fill={element.color}
            fontSize="16"
            fontFamily="Inter, sans-serif"
            className={`cursor-pointer select-none ${
              element.selected ? "font-semibold" : ""
            }`}
            onDoubleClick={() => handleElementDoubleClick(element)}
          >
            {element.text}
          </text>
        );

      default:
        return null;
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (editingText) return;

      // Arrow keys for panning
      const panSpeed = 20;
      switch (event.key) {
        case "ArrowUp":
          event.preventDefault();
          setPan((prev) => ({ x: prev.x, y: prev.y + panSpeed }));
          break;
        case "ArrowDown":
          event.preventDefault();
          setPan((prev) => ({ x: prev.x, y: prev.y - panSpeed }));
          break;
        case "ArrowLeft":
          event.preventDefault();
          setPan((prev) => ({ x: prev.x + panSpeed, y: prev.y }));
          break;
        case "ArrowRight":
          event.preventDefault();
          setPan((prev) => ({ x: prev.x - panSpeed, y: prev.y }));
          break;
      }

      if (event.key === "Delete" && selectedElement) {
        deleteElement(selectedElement);
        saveToHistory();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedElement, deleteElement, editingText, saveToHistory, setPan]);

  const cursor =
    tool === "select"
      ? "default"
      : tool === "text"
      ? "text"
      : tool === "eraser"
      ? "crosshair"
      : isPanning
      ? "grabbing"
      : "crosshair";

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        className="w-full h-full"
        style={{ cursor }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <defs>
          <pattern
            id="grid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="#374151"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y})`}>
          <rect
            x="-5000"
            y="-5000"
            width="10000"
            height="10000"
            fill="url(#grid)"
          />

          {elements.map(renderElement)}
        </g>
      </svg>

      {/* Instructions */}
      <div className="fixed bottom-4 left-4 bg-gray-800 rounded-lg shadow-lg border border-gray-700 px-4 py-3 max-w-sm">
        <h3 className="font-semibold text-gray-200 mb-2">Atalhos:</h3>
        <div className="text-sm text-gray-400 space-y-1">
          <div>• Setas: Mover quadro</div>
          <div>• Cmd + Clique: Pan</div>
          <div>• Delete: Excluir selecionado</div>
          <div>• Duplo clique: Editar texto</div>
        </div>
      </div>
    </div>
  );
};
