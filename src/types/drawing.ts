// src/components/drawing.ts
export interface Point {
  x: number;
  y: number;
}

export interface DrawingElement {
  id: string;
  type: "freehand" | "rectangle" | "circle" | "line" | "arrow" | "text";
  points?: Point[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  startPoint?: Point;
  endPoint?: Point;
  text?: string;
  color: string;
  strokeWidth: number;
  fill?: string;
  selected?: boolean;
}

export interface CanvasState {
  elements: DrawingElement[];
  zoom: number;
  pan: Point;
}

export type Tool =
  | "select"
  | "freehand"
  | "rectangle"
  | "circle"
  | "line"
  | "arrow"
  | "text";

export type Tool =
  | "select"
  | "freehand"
  | "rectangle"
  | "circle"
  | "line"
  | "arrow"
  | "text"
  | "eraser";
