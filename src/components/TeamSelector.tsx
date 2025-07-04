import React from 'react';
import { Plus, Eye, EyeOff, X } from 'lucide-react';
import type { Team } from '../types';

interface TeamSelectorProps {
  teams: Team[];
  currentTeam: Team;
  opposingTeamVisible: boolean;
  onTeamChange: (team: Team) => void;
  onAddTeam: () => void;
  onRemoveTeam: (teamId: string) => void;
  onToggleOpposingTeam: () => void;
}

const TeamSelector: React.FC<TeamSelectorProps> = ({
  teams,
  currentTeam,
  opposingTeamVisible,
  onTeamChange,
  onAddTeam,
  onRemoveTeam,
  onToggleOpposingTeam
}) => {
  return (
    <div className="flex items-center gap-2 p-2 overflow-x-auto">
      {teams.map((team) => (
        <div key={team.id} className="flex items-center gap-1">
          <button
            onClick={() => onTeamChange(team)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors
              ${team.id === currentTeam.id 
                ? 'bg-white text-[#1a1a1a]' 
                : 'bg-[#252525] text-white hover:bg-[#303030]'}`}
          >
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: team.playerStyle.primaryColor }}
            />
            {team.name}
          </button>
          
          {team.id !== '1' && (
            <button
              onClick={() => onRemoveTeam(team.id)}
              className="rounded-lg bg-[#252525] p-2 text-white hover:bg-[#303030] transition-colors"
              title="Remove team"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
      
      {teams.length < 2 && (
        <button
          onClick={onAddTeam}
          className="flex items-center gap-2 rounded-lg bg-[#252525] px-3 py-2 text-sm font-medium text-white hover:bg-[#303030] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Team
        </button>
      )}

      {teams.length > 1 && (
        <button
          onClick={onToggleOpposingTeam}
          className="flex items-center gap-2 rounded-lg bg-[#252525] px-3 py-2 text-sm font-medium text-white hover:bg-[#303030] transition-colors ml-auto"
        >
          {opposingTeamVisible ? (
            <>
              <EyeOff className="h-4 w-4" />
              Hide Opposing Team
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              Show Opposing Team
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default TeamSelector;