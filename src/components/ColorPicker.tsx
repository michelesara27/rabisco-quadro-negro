// src/components/ColorPicker.tsx
import React from "react";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

// Paleta reduzida para Branco, Vermelho e Amarelo apenas
const COLORS = [
  "#FFFFFF", // Branco
  "#DC2626", // Vermelho
  "#F59E0B", // Amarelo
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  onChange,
}) => {
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
            color === c ? "border-gray-800 scale-110" : "border-gray-300"
          }`}
          style={{ backgroundColor: c }}
          title={`Cor: ${c}`}
        />
      ))}
    </div>
  );
};
