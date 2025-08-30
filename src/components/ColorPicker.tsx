import React from 'react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

const COLORS = [
  '#2563EB', // Blue
  '#7C3AED', // Purple
  '#EA580C', // Orange
  '#DC2626', // Red
  '#059669', // Green
  '#0891B2', // Cyan
  '#9333EA', // Violet
  '#F59E0B', // Amber
  '#EF4444', // Red light
  '#10B981', // Emerald
  '#6B7280', // Gray
  '#000000', // Black
];

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
  const handleColorClick = (selectedColor: string) => {
    onChange(selectedColor);
  };

  return (
    <div className="flex flex-wrap gap-1 p-2 bg-white rounded-lg shadow-lg border">
      {COLORS.map((c) => (
        <button
          key={c}
          onClick={() => handleColorClick(c)}
          className={`w-6 h-6 rounded-full border-2 transition-all duration-150 hover:scale-110 ${
            color === c ? 'border-gray-800 scale-110' : 'border-gray-300'
          }`}
          style={{ backgroundColor: c }}
          title={`Cor: ${c}`}
        />
      ))}
    </div>
  );
};
