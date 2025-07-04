import React, { useState } from 'react';
import { 
  PanelLeftClose, 
  PanelLeftOpen, 
  ChevronDown, 
  ChevronRight, 
  Box, 
  Square, 
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize,
  ArrowUp,
  ArrowDown,
  Lock,
  Unlock
} from 'lucide-react';
import TacticalBoard from './components/TacticalBoard';
import FormationSelector from './components/FormationSelector';
import ColorPicker from './components/ColorPicker';
import TeamSelector from './components/TeamSelector';
import { defaultFormations } from './data/formations';
import { defaultTeams } from './data/teams';
import type { PlayerStyle, Formation, FieldStyle, Team } from './types';

function App() {
  const [teams, setTeams] = useState<Team[]>([defaultTeams[0]]);
  const [currentTeam, setCurrentTeam] = useState<Team>(teams[0]);
  const [opposingTeamVisible, setOpposingTeamVisible] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [fieldStyle, setFieldStyle] = useState<FieldStyle>({
    startColor: '#1f2937',
    endColor: '#111827',
    lineColor: '#ffffff',
    is3D: false,
    perspective: 25,
    rotation: 0,
    verticalRotation: 0,
    zoom: 1,
    isLocked: false
  });

  // State for expandable sections
  const [expandedSections, setExpandedSections] = useState({
    formation: true,
    playerStyle: true,
    fieldStyle: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleFormationChange = (formationName: string) => {
    if (defaultFormations[formationName]) {
      const baseFormation = defaultFormations[formationName];
      
      // Create a new formation with the correct number of positions
      const newFormation: Formation = {
        ...baseFormation,
        positions: baseFormation.positions.slice(0, currentTeam.playerCount).map((pos, index) => {
          // Preserve player number and role type (attacking/defending) when possible
          const currentPosition = currentTeam.formation.positions[index];
          if (currentPosition) {
            return {
              ...pos,
              number: currentPosition.number,
              // Preserve role category (defender, midfielder, attacker)
              role: preserveRoleCategory(currentPosition.role, pos.role)
            };
          }
          return pos;
        })
      };

      const updatedTeam = {
        ...currentTeam,
        formation: newFormation
      };
      
      setCurrentTeam(updatedTeam);
      setTeams(teams.map(team => 
        team.id === currentTeam.id ? updatedTeam : team
      ));
    }
  };

  // Helper function to preserve role categories when changing formations
  const preserveRoleCategory = (currentRole: string, newRole: string): string => {
    const defenders = ['CB', 'LB', 'RB', 'LWB', 'RWB', 'LCB', 'RCB'];
    const midfielders = ['CDM', 'CM', 'LM', 'RM', 'CAM', 'LCM', 'RCM'];
    const attackers = ['ST', 'CF', 'LW', 'RW', 'LAM', 'RAM'];

    const isCurrentDefender = defenders.includes(currentRole);
    const isCurrentMidfielder = midfielders.includes(currentRole);
    const isCurrentAttacker = attackers.includes(currentRole);

    const isNewDefender = defenders.includes(newRole);
    const isNewMidfielder = midfielders.includes(newRole);
    const isNewAttacker = attackers.includes(newRole);

    // Try to maintain the same category of position
    if (isCurrentDefender && !isNewDefender) {
      return defenders.includes(newRole) ? newRole : 'CB';
    } else if (isCurrentMidfielder && !isNewMidfielder) {
      return midfielders.includes(newRole) ? newRole : 'CM';
    } else if (isCurrentAttacker && !isNewAttacker) {
      return attackers.includes(newRole) ? newRole : 'ST';
    }

    return newRole;
  };

  const handlePlayerCountChange = (count: number) => {
    const baseFormation = defaultFormations[currentTeam.formation.name];
    const updatedTeam = {
      ...currentTeam,
      playerCount: count,
      formation: {
        ...currentTeam.formation,
        positions: baseFormation.positions.slice(0, count)
      }
    };
    
    setCurrentTeam(updatedTeam);
    setTeams(teams.map(team => 
      team.id === currentTeam.id ? updatedTeam : team
    ));
  };

  const handlePlayerStyleChange = (style: PlayerStyle) => {
    const updatedTeam = {
      ...currentTeam,
      playerStyle: style
    };
    
    setCurrentTeam(updatedTeam);
    setTeams(teams.map(team => 
      team.id === currentTeam.id ? updatedTeam : team
    ));
  };

  const handleAddTeam = () => {
    if (teams.length < 2) {
      setTeams([...teams, defaultTeams[1]]);
      setOpposingTeamVisible(true);
    }
  };

  const handleRemoveTeam = (teamId: string) => {
    const updatedTeams = teams.filter(team => team.id !== teamId);
    setTeams(updatedTeams);
    
    // If we removed the current team, switch to the other team
    if (currentTeam.id === teamId && updatedTeams.length > 0) {
      setCurrentTeam(updatedTeams[0]);
    }
  };

  // Get visible teams based on the toggle state
  const visibleTeams = opposingTeamVisible ? teams : [currentTeam];

  const resetRotation = () => {
    setFieldStyle(prev => ({ 
      ...prev, 
      rotation: 0, 
      verticalRotation: 0,
      perspective: 25 
    }));
  };

  const rotateField = (direction: 'left' | 'right') => {
    if (fieldStyle.isLocked) return;
    setFieldStyle(prev => ({
      ...prev,
      rotation: Math.round((prev.rotation + (direction === 'left' ? -45 : 45) + 360) % 360)
    }));
  };

  const rotateFieldVertical = (direction: 'up' | 'down') => {
    if (fieldStyle.isLocked) return;
    setFieldStyle(prev => ({
      ...prev,
      verticalRotation: Math.round(Math.max(-45, Math.min(45, 
        prev.verticalRotation + (direction === 'up' ? -5 : 5)
      )))
    }));
  };

  const resetZoom = () => {
    setFieldStyle(prev => ({ ...prev, zoom: 1 }));
  };

  const toggleFieldLock = () => {
    setFieldStyle(prev => ({ ...prev, isLocked: !prev.isLocked }));
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#1a1a1a] p-2 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">XI</span>
            <h1 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
              Coach
            </h1>
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="rounded-lg p-2 hover:bg-[#252525] transition-colors"
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="h-5 w-5 text-white" />
            ) : (
              <PanelLeftOpen className="h-5 w-5 text-white" />
            )}
          </button>
        </div>
      </header>

      {/* Team Selector */}
      <div className="border-b border-gray-800 bg-[#1a1a1a]">
        <div className="container mx-auto">
          <TeamSelector
            teams={teams}
            currentTeam={currentTeam}
            opposingTeamVisible={opposingTeamVisible}
            onTeamChange={setCurrentTeam}
            onAddTeam={handleAddTeam}
            onRemoveTeam={handleRemoveTeam}
            onToggleOpposingTeam={() => setOpposingTeamVisible(!opposingTeamVisible)}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto p-2">
        <div className="flex gap-2">
          {/* Left Sidebar */}
          <div className={`space-y-2 transition-all duration-300 ${
            isSidebarOpen ? 'w-64 opacity-100' : 'w-0 opacity-0 overflow-hidden'
          }`}>
            {/* Formation Section */}
            <div className="rounded-lg bg-[#1a1a1a] overflow-hidden">
              <button
                onClick={() => toggleSection('formation')}
                className="w-full p-3 flex items-center justify-between hover:bg-[#252525] transition-colors"
              >
                <h2 className="text-sm font-semibold text-white">Formation</h2>
                {expandedSections.formation ? (
                  <ChevronDown className="h-4 w-4 text-white" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-white" />
                )}
              </button>
              <div className={`transition-all duration-300 ${
                expandedSections.formation ? 'max-h-96 p-3' : 'max-h-0 overflow-hidden'
              }`}>
                <FormationSelector
                  currentFormation={currentTeam.formation.name}
                  onFormationChange={handleFormationChange}
                  playerCount={currentTeam.playerCount}
                  onPlayerCountChange={handlePlayerCountChange}
                />
              </div>
            </div>

            {/* Player Style Section */}
            <div className="rounded-lg bg-[#1a1a1a] overflow-hidden">
              <button
                onClick={() => toggleSection('playerStyle')}
                className="w-full p-3 flex items-center justify-between hover:bg-[#252525] transition-colors"
              >
                <h2 className="text-sm font-semibold text-white">Player Style</h2>
                {expandedSections.playerStyle ? (
                  <ChevronDown className="h-4 w-4 text-white" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-white" />
                )}
              </button>
              <div className={`transition-all duration-300 ${
                expandedSections.playerStyle ? 'max-h-96 p-3' : 'max-h-0 overflow-hidden'
              }`}>
                <ColorPicker style={currentTeam.playerStyle} onChange={handlePlayerStyleChange} />
              </div>
            </div>

            {/* Field Style Section */}
            <div className="rounded-lg bg-[#1a1a1a] overflow-hidden">
              <button
                onClick={() => toggleSection('fieldStyle')}
                className="w-full p-3 flex items-center justify-between hover:bg-[#252525] transition-colors"
              >
                <h2 className="text-sm font-semibold text-white">Field Style</h2>
                {expandedSections.fieldStyle ? (
                  <ChevronDown className="h-4 w-4 text-white" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-white" />
                )}
              </button>
              <div className={`transition-all duration-300 ${
                expandedSections.fieldStyle ? 'max-h-[800px] p-3' : 'max-h-0 overflow-hidden'
              }`}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-white">Start Color</label>
                      <input
                        type="color"
                        value={fieldStyle.startColor}
                        onChange={(e) => setFieldStyle({ ...fieldStyle, startColor: e.target.value })}
                        className="h-6 w-full cursor-pointer rounded border-0 bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded [&::-webkit-color-swatch]:border-0"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-white">End Color</label>
                      <input
                        type="color"
                        value={fieldStyle.endColor}
                        onChange={(e) => setFieldStyle({ ...fieldStyle, endColor: e.target.value })}
                        className="h-6 w-full cursor-pointer rounded border-0 bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded [&::-webkit-color-swatch]:border-0"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-white">Line Color</label>
                    <input
                      type="color"
                      value={fieldStyle.lineColor || '#ffffff'}
                      onChange={(e) => setFieldStyle({ ...fieldStyle, lineColor: e.target.value })}
                      className="h-6 w-full cursor-pointer rounded border-0 bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded [&::-webkit-color-swatch]:border-0"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-xs text-white">View Mode</label>
                    <button
                      onClick={() => setFieldStyle(prev => ({ ...prev, is3D: !prev.is3D }))}
                      className="flex items-center gap-2 rounded bg-[#252525] px-2 py-1 text-sm text-white hover:bg-[#303030] transition-colors"
                    >
                      {fieldStyle.is3D ? (
                        <>
                          <Square className="h-4 w-4" />
                          2D View
                        </>
                      ) : (
                        <>
                          <Box className="h-4 w-4" />
                          3D View
                        </>
                      )}
                    </button>
                  </div>

                  {fieldStyle.is3D && (
                    <>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-white">Field Lock</label>
                          <button
                            onClick={toggleFieldLock}
                            className="flex items-center gap-2 rounded bg-[#252525] px-2 py-1 text-sm text-white hover:bg-[#303030] transition-colors"
                          >
                            {fieldStyle.isLocked ? (
                              <>
                                <Lock className="h-4 w-4" />
                                Unlock
                              </>
                            ) : (
                              <>
                                <Unlock className="h-4 w-4" />
                                Lock
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-white">Rotation</label>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-white">{fieldStyle.rotation}°</span>
                            <button
                              onClick={resetRotation}
                              className="rounded bg-[#252525] p-1 hover:bg-[#303030] transition-colors"
                              title="Reset rotation"
                            >
                              <RotateCw className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <button
                            onClick={() => rotateField('left')}
                            className="flex-1 rounded-lg bg-[#252525] p-2 hover:bg-[#303030] transition-colors flex items-center justify-center gap-1"
                            title="Rotate Left"
                            disabled={fieldStyle.isLocked}
                          >
                            <RotateCcw className="h-4 w-4" />
                            Left
                          </button>
                          <button
                            onClick={() => rotateField('right')}
                            className="flex-1 rounded-lg bg-[#252525] p-2 hover:bg-[#303030] transition-colors flex items-center justify-center gap-1"
                            title="Rotate Right"
                            disabled={fieldStyle.isLocked}
                          >
                            <RotateCw className="h-4 w-4" />
                            Right
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-white">Vertical Rotation</label>
                          <span className="text-xs text-white">{fieldStyle.verticalRotation}°</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <button
                            onClick={() => rotateFieldVertical('up')}
                            className="flex-1 rounded-lg bg-[#252525] p-2 hover:bg-[#303030] transition-colors flex items-center justify-center gap-1"
                            title="Rotate Up"
                            disabled={fieldStyle.isLocked}
                          >
                            <ArrowUp className="h-4 w-4" />
                            Up
                          </button>
                          <button
                            onClick={() => rotateFieldVertical('down')}
                            className="flex-1 rounded-lg bg-[#252525] p-2 hover:bg-[#303030] transition-colors flex items-center justify-center gap-1"
                            title="Rotate Down"
                            disabled={fieldStyle.isLocked}
                          >
                            <ArrowDown className="h-4 w-4" />
                            Down
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-white">Zoom</label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white">{Math.round(fieldStyle.zoom! * 100)}%</span>
                        <button
                          onClick={resetZoom}
                          className="rounded bg-[#252525] p-1 hover:bg-[#303030] transition-colors"
                          title="Reset zoom"
                        >
                          <Maximize className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setFieldStyle(prev => ({ ...prev, zoom: Math.max(0.5, (prev.zoom || 1) - 0.1) }))}
                        className="rounded-lg bg-[#252525] p-2 hover:bg-[#303030] transition-colors"
                        title="Zoom Out"
                      >
                        <ZoomOut className="h-4 w-4" />
                      </button>
                      <div className="relative flex-1">
                        <input
                          type="range"
                          min="50"
                          max="200"
                          value={fieldStyle.zoom! * 100}
                          onChange={(e) => setFieldStyle(prev => ({ ...prev, zoom: parseInt(e.target.value) / 100 }))}
                          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#252525] accent-white"
                        />
                      </div>
                      <button
                        onClick={() => setFieldStyle(prev => ({ ...prev, zoom: Math.min(2, (prev.zoom || 1) + 0.1) }))}
                        className="rounded-lg bg-[#252525] p-2 hover:bg-[#303030] transition-colors"
                        title="Zoom In"
                      >
                        <ZoomIn className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tactical Board */}
          <div className="flex-1 rounded-lg bg-[#1a1a1a] p-3 backdrop-blur-sm">
            <TacticalBoard 
              teams={visibleTeams}
              fieldStyle={fieldStyle}
              onFieldStyleChange={setFieldStyle}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;