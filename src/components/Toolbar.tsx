import React, { useRef } from 'react';
import { 
  MousePointer, 
  Pencil, 
  Square, 
  Circle, 
  Minus, 
  ArrowRight,
  Type,
  Eraser,
  Download,
  FolderOpen,
  Undo,
  Redo,
  Trash2,
  Palette
} from 'lucide-react';
import { Tool } from '../types/drawing';
import { ColorPicker } from './ColorPicker';

interface ToolbarProps {
  tool: Tool;
  setTool: (tool: Tool) => void;
  color: string;
  setColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  onSave: () => void;
  onLoad: (file: File) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  tool,
  setTool,
  color,
  setColor,
  strokeWidth,
  setStrokeWidth,
  onSave,
  onLoad,
  onUndo,
  onRedo,
  onClear,
  canUndo,
  canRedo
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showColorPicker, setShowColorPicker] = React.useState(false);

  const tools = [
    { type: 'select' as Tool, icon: MousePointer, label: 'Selecionar' },
    { type: 'freehand' as Tool, icon: Pencil, label: 'Desenho Livre' },
    { type: 'eraser' as Tool, icon: Eraser, label: 'Borracha' },
    { type: 'rectangle' as Tool, icon: Square, label: 'Retângulo' },
    { type: 'circle' as Tool, icon: Circle, label: 'Círculo' },
    { type: 'line' as Tool, icon: Minus, label: 'Linha' },
    { type: 'arrow' as Tool, icon: ArrowRight, label: 'Seta' },
    { type: 'text' as Tool, icon: Type, label: 'Texto' },
  ];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onLoad(file);
      event.target.value = '';
    }
  };

  const handleClearClick = () => {
    const confirmed = window.confirm('Isso irá limpar todo o canvas. Deseja continuar?');
    if (confirmed) {
      onClear();
    }
  };

  return (
    <>
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3 flex items-center gap-3">
          {/* File Operations */}
          <div className="flex items-center gap-1 border-r border-gray-200 pr-3">
            <button
              onClick={onSave}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-150 text-gray-700 hover:text-gray-900"
              title="Salvar (Ctrl+S)"
            >
              <Download size={20} />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-150 text-gray-700 hover:text-gray-900"
              title="Abrir (Ctrl+O)"
            >
              <FolderOpen size={20} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* History Operations */}
          <div className="flex items-center gap-1 border-r border-gray-200 pr-3">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-150 text-gray-700 hover:text-gray-900 disabled:text-gray-400 disabled:hover:bg-transparent"
              title="Desfazer (Ctrl+Z)"
            >
              <Undo size={20} />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-150 text-gray-700 hover:text-gray-900 disabled:text-gray-400 disabled:hover:bg-transparent"
              title="Refazer (Ctrl+Y)"
            >
              <Redo size={20} />
            </button>
          </div>

          {/* Drawing Tools */}
          <div className="flex items-center gap-1 border-r border-gray-200 pr-3">
            {tools.map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                onClick={() => setTool(type)}
                className={`p-2 rounded-lg transition-all duration-150 ${
                  tool === type
                    ? 'bg-blue-100 text-blue-700 shadow-inner'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
                title={label}
              >
                <Icon size={20} />
              </button>
            ))}
          </div>

          {/* Style Controls */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-150 text-gray-700 hover:text-gray-900"
                title="Cor"
              >
                <div className="flex items-center gap-1">
                  <Palette size={20} />
                  <div
                    className="w-4 h-4 rounded border border-gray-300"
                    style={{ backgroundColor: color }}
                  />
                </div>
              </button>
              
              {showColorPicker && (
                <div className="absolute top-12 left-0 z-30">
                  <ColorPicker color={color} onChange={setColor} />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Espessura:</label>
              <input
                type="range"
                min="1"
                max="10"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                className="w-16 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm text-gray-600 w-6">{strokeWidth}</span>
            </div>

            <button
              onClick={handleClearClick}
              className="p-2 rounded-lg hover:bg-red-100 transition-colors duration-150 text-gray-700 hover:text-red-700"
              title="Limpar Canvas"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Click outside to close color picker */}
      {showColorPicker && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setShowColorPicker(false)}
        />
      )}
    </>
  );
};
