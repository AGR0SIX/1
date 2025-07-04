import React from 'react';
import { defaultFormations } from '../data/formations';

interface FormationSelectorProps {
  currentFormation: string;
  onFormationChange: (formation: string) => void;
  playerCount: number;
  onPlayerCountChange: (count: number) => void;
}

const FormationSelector: React.FC<FormationSelectorProps> = ({
  currentFormation,
  onFormationChange,
  playerCount,
  onPlayerCountChange,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2">
        <label className="text-xs text-white">Players on field</label>
        <input
          type="range"
          min="0"
          max="11"
          value={playerCount}
          onChange={(e) => onPlayerCountChange(parseInt(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#252525] accent-white"
        />
        <div className="flex justify-between text-xs text-white">
          <span>0</span>
          <span className="text-white font-medium">{playerCount}</span>
          <span>11</span>
        </div>
      </div>

      <div className="relative">
        <select
          className="w-full rounded bg-[#252525] px-2 py-1.5 text-sm text-white border-0 appearance-none cursor-pointer hover:bg-[#303030] transition-colors"
          value={currentFormation}
          onChange={(e) => onFormationChange(e.target.value)}
        >
          {Object.keys(defaultFormations).map((formation) => (
            <option key={formation} value={formation}>
              {formation}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default FormationSelector;