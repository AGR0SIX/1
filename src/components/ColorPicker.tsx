import React from 'react';
import type { PlayerStyle } from '../types';

interface ColorPickerProps {
  style: PlayerStyle;
  onChange: (style: PlayerStyle) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ style, onChange }) => {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-white">Primary</label>
          <input
            type="color"
            value={style.primaryColor}
            onChange={(e) => onChange({ ...style, primaryColor: e.target.value })}
            className="h-6 w-full cursor-pointer rounded border-0 bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded [&::-webkit-color-swatch]:border-0"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-white">Secondary</label>
          <input
            type="color"
            value={style.secondaryColor}
            onChange={(e) => onChange({ ...style, secondaryColor: e.target.value })}
            className="h-6 w-full cursor-pointer rounded border-0 bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded [&::-webkit-color-swatch]:border-0"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-white">Number</label>
          <input
            type="color"
            value={style.numberColor}
            onChange={(e) => onChange({ ...style, numberColor: e.target.value })}
            className="h-6 w-full cursor-pointer rounded border-0 bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded [&::-webkit-color-swatch]:border-0"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-white">Label</label>
          <input
            type="color"
            value={style.labelColor}
            onChange={(e) => onChange({ ...style, labelColor: e.target.value })}
            className="h-6 w-full cursor-pointer rounded border-0 bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded [&::-webkit-color-swatch]:border-0"
          />
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;