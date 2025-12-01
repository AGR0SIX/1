import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Camera } from 'lucide-react';
import Player from './Player';
import Ball from './Ball';
import { SimulationEngine } from '../lib/simulation';
import { useRealTimeUpdates } from '../hooks/useRealTimeUpdates';
import { throttle } from '../utils/debounce';
import type { Position, DragState, FieldStyle, Team, TacticalBoardSettings, SimulationState } from '../types';

interface TacticalBoardProps {
  teams: Team[];
  fieldStyle: FieldStyle;
  onFieldStyleChange: (style: FieldStyle) => void;
}

const TacticalBoard: React.FC<TacticalBoardProps> = ({ teams, fieldStyle, onFieldStyleChange }) => {
  const flipXPosition = (x: number): number => {
    return 100 - x;
  };

  // Helper function to mirror roles for opposing team
  const mirrorRole = (role: string): string => {
    const roleMap: Record<string, string> = {
      'LW': 'RW', 'RW': 'LW',
      'LM': 'RM', 'RM': 'LM', 
      'LB': 'RB', 'RB': 'LB',
      'LAM': 'RAM', 'RAM': 'LAM',
      'LCM': 'RCM', 'RCM': 'LCM',
      'LCB': 'RCB', 'RCB': 'LCB',
      'LWB': 'RWB', 'RWB': 'LWB'
    };
    return roleMap[role] || role;
  };

  const [teamPositions, setTeamPositions] = useState<Map<string, Position[]>>(
    new Map(teams.map((team, index) => {
      const positions = team.formation.positions.map(pos => ({
        ...pos,
        x: index === 1 ? flipXPosition(pos.x) : pos.x,
        role: index === 1 ? mirrorRole(pos.role) : pos.role
      }));
      return [team.id, positions];
    }))
  );
  const [removingPlayers, setRemovingPlayers] = useState<Map<string, number[]>>(new Map());
  const [newPlayers, setNewPlayers] = useState<Map<string, number[]>>(new Map());
  const [autoUpdatePositions, setAutoUpdatePositions] = useState(true);
  const [settings, setSettings] = useState<TacticalBoardSettings>({
    showLabels: true,
    playerSize: 'medium'
  });
  const [dragState, setDragState] = useState<DragState & { teamId?: string }>({
    isDragging: false,
    currentPlayer: null,
    offset: { x: 0, y: 0 }
  });
  const [fieldDragState, setFieldDragState] = useState({
    isDragging: false,
    startX: 0,
    startY: 0,
    startRotation: 0,
    startVerticalRotation: 0,
    lastUpdateTime: 0
  });
  const boardRef = useRef<HTMLDivElement>(null);
  const [transitioning, setTransitioning] = useState(false);

  const [simulationMode, setSimulationMode] = useState(false);
  const [simulationState, setSimulationState] = useState<SimulationState>({
    isRunning: false,
    timeElapsed: 0,
    possession: { teamA: 50, teamB: 50 },
    score: { teamA: 0, teamB: 0 }
  });
  const [ballPosition, setBallPosition] = useState({ x: 50, y: 50 });
  const simulationEngineRef = useRef<SimulationEngine | null>(null);
  const animationFrameRef = useRef<number>();
  const dragUpdateRef = useRef<number>();

  // Enhanced real-time updates hook
  const { 
    updatePositionImmediate, 
    getOptimalRole,
    isUpdating 
  } = useRealTimeUpdates({
    teams,
    teamPositions,
    setTeamPositions,
    autoUpdatePositions,
    onPositionUpdate: (teamId, positions) => {
      // Optional callback for additional processing
      console.log(`Updated positions for team ${teamId}:`, positions.length);
    }
  });

  // Throttled drag handler for better performance
  const throttledDragHandler = useRef(
    throttle((event: React.MouseEvent) => {
      if (!dragState.isDragging || dragState.currentPlayer === null || !dragState.teamId || !boardRef.current) return;

      const rect = boardRef.current.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;

      const rawX = x + dragState.offset.x;
      const rawY = y + dragState.offset.y;
      
      const transformed = transformCoordinates(rawX, rawY);
      
      const boundedX = Math.max(1.67, Math.min(98.33, transformed.x));
      const boundedY = Math.max(1.67, Math.min(98.33, transformed.y));
      
      const snappedX = snapToGrid(boundedX);
      const snappedY = snapToGrid(boundedY);

      const teamIndex = teams.findIndex(t => t.id === dragState.teamId);
      const newRole = getOptimalRole(snappedX, snappedY, teamIndex);

      // Use immediate update for drag operations
      updatePositionImmediate(dragState.teamId, dragState.currentPlayer, {
        x: snappedX,
        y: snappedY,
        role: newRole
      });
    }, 16) // ~60fps throttling
  ).current;

  useEffect(() => {
    setTransitioning(true);
    const timer = setTimeout(() => setTransitioning(false), 700);
    return () => clearTimeout(timer);
  }, [fieldStyle.is3D]);

  useEffect(() => {
    onFieldStyleChange({
      ...fieldStyle,
      zoom: fieldStyle.is3D ? 0.85 : 1,
      rotation: fieldStyle.is3D ? fieldStyle.rotation : 0,
      verticalRotation: fieldStyle.is3D ? fieldStyle.verticalRotation : 0
    });
  }, [fieldStyle.is3D]);

  useEffect(() => {
    teams.forEach((team, index) => {
      const newLength = team.formation.positions.length;
      const currentLength = (teamPositions.get(team.id) || []).length;
      
      // Update positions when formation changes
      const newPositions = team.formation.positions.map(pos => ({
        ...pos,
        x: index === 1 ? flipXPosition(pos.x) : pos.x,
        role: index === 1 ? mirrorRole(pos.role) : pos.role
      }));
      
      setTeamPositions(prev => new Map(prev).set(team.id, newPositions));

      if (newLength > currentLength) {
        setNewPlayers(prev => new Map(prev).set(team.id, 
          Array.from({ length: newLength - currentLength }, (_, i) => currentLength + i)
        ));
      } else if (newLength < currentLength) {
        setRemovingPlayers(prev => new Map(prev).set(team.id,
          Array.from({ length: currentLength - newLength }, (_, i) => newLength + i)
        ));
        setTimeout(() => {
          setTeamPositions(prev => {
            const positions = prev.get(team.id) || [];
            return new Map(prev).set(team.id, positions.slice(0, newLength));
          });
          setRemovingPlayers(prev => {
            const newMap = new Map(prev);
            newMap.delete(team.id);
            return newMap;
          });
        }, 500);
      }
    });

    // Clear new players indicator after animation
    if (newPlayers.size > 0) {
      setTimeout(() => {
        setNewPlayers(new Map());
      }, 100);
    }
  }, [teams]);

  const handleFieldMouseDown = (e: React.MouseEvent, isControlSphere = false) => {
    if (!fieldStyle.is3D || fieldStyle.isLocked) return;
    
    setFieldDragState({
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      startRotation: fieldStyle.rotation || 0,
      startVerticalRotation: fieldStyle.verticalRotation || 0,
      lastUpdateTime: Date.now()
    });

    if (isControlSphere) {
      e.stopPropagation();
    }
  };

  const handleFieldMouseMove = (e: React.MouseEvent) => {
    if (!fieldDragState.isDragging || !fieldStyle.is3D || fieldStyle.isLocked) return;

    const currentTime = Date.now();
    if (currentTime - fieldDragState.lastUpdateTime < 16) return;

    const deltaX = e.clientX - fieldDragState.startX;
    const deltaY = e.clientY - fieldDragState.startY;
    
    const newRotation = Math.round((fieldDragState.startRotation - deltaX * 0.2 + 360) % 360);
    const newVerticalRotation = Math.round(
      Math.max(-45, Math.min(45, fieldDragState.startVerticalRotation - deltaY * 0.1))
    );

    onFieldStyleChange({
      ...fieldStyle,
      rotation: newRotation,
      verticalRotation: newVerticalRotation
    });

    setFieldDragState(prev => ({
      ...prev,
      lastUpdateTime: currentTime
    }));
  };

  const handleFieldMouseUp = () => {
    setFieldDragState({
      isDragging: false,
      startX: 0,
      startY: 0,
      startRotation: 0,
      startVerticalRotation: 0,
      lastUpdateTime: 0
    });
  };

  const toggleSimulation = () => {
    if (!simulationMode) {
      setSimulationMode(true);
      setSimulationState(prev => ({ ...prev, isRunning: true }));
    } else {
      setSimulationMode(false);
      setSimulationState(prev => ({ ...prev, isRunning: false }));
    }
  };

  const resetSimulation = () => {
    if (simulationEngineRef.current) {
      simulationEngineRef.current.cleanup();
      simulationEngineRef.current = new SimulationEngine();
      simulationEngineRef.current.initializeTeams(teams);
      setSimulationState({
        isRunning: false,
        timeElapsed: 0,
        possession: { teamA: 50, teamB: 50 },
        score: { teamA: 0, teamB: 0 }
      });
    }
  };

  const togglePlayPause = () => {
    setSimulationState(prev => ({ ...prev, isRunning: !prev.isRunning }));
  };

  useEffect(() => {
    if (simulationMode) {
      simulationEngineRef.current = new SimulationEngine();
      simulationEngineRef.current.initializeTeams(teams);
    } else {
      if (simulationEngineRef.current) {
        simulationEngineRef.current.cleanup();
        simulationEngineRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (simulationEngineRef.current) {
        simulationEngineRef.current.cleanup();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [simulationMode, teams]);

  useEffect(() => {
    const updateSimulation = () => {
      if (simulationEngineRef.current && simulationState.isRunning) {
        simulationEngineRef.current.update();
        
        const ballPos = simulationEngineRef.current.getBallPosition();
        setBallPosition({
          x: (ballPos.x / 1600) * 100,
          y: (ballPos.y / 1100) * 100
        });

        teams.forEach(team => {
          const updatedPositions = simulationEngineRef.current!.getTeamPositions(team.id);
          setTeamPositions(prev => new Map(prev).set(team.id, updatedPositions));
        });

        setSimulationState(prev => ({
          ...prev,
          timeElapsed: prev.timeElapsed + 1/60
        }));
        animationFrameRef.current = requestAnimationFrame(updateSimulation);
      }
    };

    if (simulationState.isRunning) {
      animationFrameRef.current = requestAnimationFrame(updateSimulation);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [simulationState.isRunning, teams]);

  const GRID_SIZE = 1.67;
  const MAGNETIC_STRENGTH = 0.3;
  
  const snapToGrid = (value: number): number => {
    const gridPosition = Math.round(value / GRID_SIZE) * GRID_SIZE;
    const delta = gridPosition - value;
    return value + (delta * MAGNETIC_STRENGTH);
  };

  const transformCoordinates = (x: number, y: number): { x: number; y: number } => {
    if (!fieldStyle.is3D) return { x, y };

    const rotationRad = ((fieldStyle.rotation || 0) * Math.PI) / 180;
    const verticalRotationRad = ((fieldStyle.verticalRotation || 0) * Math.PI) / 180;

    const adjustedX = x - 50;
    const adjustedY = y - 50;

    const cos = Math.cos(rotationRad);
    const sin = Math.sin(rotationRad);
    const cosV = Math.cos(verticalRotationRad);

    const transformedX = (adjustedX * cos + adjustedY * sin) / cosV;
    const transformedY = (-adjustedX * sin + adjustedY * cos) / cosV;

    return {
      x: transformedX + 50,
      y: transformedY + 50
    };
  };

  const handleDragStart = (event: React.MouseEvent, teamId: string, playerIndex: number) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (!boardRef.current) return;

    const rect = boardRef.current.getBoundingClientRect();
    const positions = teamPositions.get(teamId) || [];
    const playerPos = positions[playerIndex];

    const mouseX = ((event.clientX - rect.left) / rect.width) * 100;
    const mouseY = ((event.clientY - rect.top) / rect.height) * 100;

    setDragState({
      isDragging: true,
      currentPlayer: playerIndex,
      teamId,
      offset: {
        x: playerPos.x - mouseX,
        y: playerPos.y - mouseY
      }
    });
  };

  const handleDrag = (event: React.MouseEvent) => {
    if (dragState.isDragging && dragState.currentPlayer !== null && dragState.teamId) {
      throttledDragHandler(event);
    }
  };

  const handleDragEnd = () => {
    if (dragState.currentPlayer !== null && dragState.teamId) {
      // Final snap to grid on drag end
      const positions = teamPositions.get(dragState.teamId) || [];
      const currentPos = positions[dragState.currentPlayer];
      
      if (currentPos) {
        updatePositionImmediate(dragState.teamId, dragState.currentPlayer, {
          x: Math.round(currentPos.x / GRID_SIZE) * GRID_SIZE,
          y: Math.round(currentPos.y / GRID_SIZE) * GRID_SIZE
        });
      }
    }

    setDragState({
      isDragging: false,
      currentPlayer: null,
      teamId: undefined,
      offset: { x: 0, y: 0 }
    });
  };

  const handleNumberChange = (teamId: string, index: number, newNumber: number) => {
    setTeamPositions(prev => {
      const positions = [...(prev.get(teamId) || [])];
      positions[index] = { ...positions[index], number: newNumber };
      return new Map(prev).set(teamId, positions);
    });
  };

  const handleRoleChange = (teamId: string, index: number, newRole: string) => {
    updatePositionImmediate(teamId, index, { role: newRole });
  };

  const handleDotNameChange = (teamId: string, index: number, newDotName: string) => {
    updatePositionImmediate(teamId, index, { dotName: newDotName });
  };

  const getPositionIndicatorStyle = () => {
    const radius = 18;
    const rotation = ((fieldStyle.rotation || 0) * Math.PI) / 180;
    const verticalRotation = ((fieldStyle.verticalRotation || 0) * Math.PI) / 180;
    
    const x = radius * Math.sin(rotation) * Math.cos(verticalRotation);
    const y = radius * Math.sin(verticalRotation);
    
    return {
      transform: `translate(${x}px, ${y}px)`,
      opacity: Math.cos(rotation) * Math.cos(verticalRotation)
    };
  };

  const stripeCount = 15;
  const stripeWidth = 160;
  const stripes = Array.from({ length: stripeCount }, (_, i) => (
    <rect
      key={i}
      x={i * stripeWidth}
      y="0"
      width={stripeWidth}
      height="1100"
      fill={`rgba(255, 255, 255, ${0.02 + (i * 0.002)})`}
      style={{
        transition: 'opacity 700ms cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: fieldStyle.is3D ? 1 : 0
      }}
    />
  ));

  const captureScreenshot = () => {
    if (!boardRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const boardRect = boardRef.current.getBoundingClientRect();
    canvas.width = boardRect.width;
    canvas.height = boardRect.height;

    const svgElement = boardRef.current.querySelector('svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const DOMURL = window.URL || window.webkitURL || window;
    const url = DOMURL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = getComputedStyle(boardRef.current!).backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      teams.forEach(team => {
        const positions = teamPositions.get(team.id) || [];
        positions.forEach(position => {
          const x = (position.x / 100) * canvas.width;
          const y = (position.y / 100) * canvas.height;
          const radius = canvas.width * 0.02;

          // Draw player circle
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, 2 * Math.PI);
          const isGoalkeeper = position.role === 'GK';
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
          if (isGoalkeeper) {
            gradient.addColorStop(0, '#00ff00');
            gradient.addColorStop(1, '#39ff14');
          } else {
            gradient.addColorStop(0, team.playerStyle.primaryColor);
            gradient.addColorStop(1, team.playerStyle.secondaryColor);
          }
          ctx.fillStyle = gradient;
          ctx.fill();

          // Draw player number
          ctx.font = `bold ${radius}px Inter`;
          ctx.fillStyle = team.playerStyle.numberColor;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(position.number.toString(), x, y);

          // Draw player role
          if (settings.showLabels) {
            ctx.font = `${radius * 0.7}px Inter`;
            ctx.fillStyle = isGoalkeeper ? '#00ff00' : team.playerStyle.labelColor;
            ctx.fillText(position.role, x, y + radius * 1.5);

            // Draw dot name
            if (position.dotName) {
              ctx.font = `${radius * 0.6}px Inter`;
              ctx.fillStyle = isGoalkeeper ? '#00ff00' : team.playerStyle.labelColor;
              ctx.globalAlpha = 0.75;
              ctx.fillText(position.dotName, x, y + radius * 2.5);
              ctx.globalAlpha = 1;
            }
          }
        });
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'tactical-board.png';
      link.href = dataUrl;
      link.click();

      DOMURL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-white">
              Auto-update positions
              {isUpdating && (
                <span className="ml-2 inline-block h-2 w-2 animate-pulse rounded-full bg-green-400" />
              )}
            </label>
            <button
              onClick={() => setAutoUpdatePositions(!autoUpdatePositions)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoUpdatePositions ? 'bg-white' : 'bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-[#1a1a1a] transition-transform ${
                  autoUpdatePositions ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-white">Show labels</label>
            <button
              onClick={() => setSettings(prev => ({ ...prev, showLabels: !prev.showLabels }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.showLabels ? 'bg-white' : 'bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-[#1a1a1a] transition-transform ${
                  settings.showLabels ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-white">Player size</label>
            <select
              value={settings.playerSize}
              onChange={(e) => setSettings(prev => ({ ...prev, playerSize: e.target.value as 'small' | 'medium' | 'large' }))}
              className="w-24 rounded bg-[#252525] px-3 py-1 text-sm text-white border-0 appearance-none cursor-pointer hover:bg-[#303030] transition-colors"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={captureScreenshot}
            className="rounded-lg bg-[#252525] p-2 text-white hover:bg-[#303030] transition-colors"
            title="Take Screenshot"
          >
            <Camera className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2">
            <label className="text-sm text-white">Simulation Mode</label>
            <button
              onClick={toggleSimulation}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                simulationMode ? 'bg-white' : 'bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-[#1a1a1a] transition-transform ${
                  simulationMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {simulationMode && (
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlayPause}
                className="rounded-lg bg-[#252525] p-2 text-white hover:bg-[#303030] transition-colors"
                title={simulationState.isRunning ? 'Pause' : 'Play'}
              >
                {simulationState.isRunning ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={resetSimulation}
                className="rounded-lg bg-[#252525] p-2 text-white hover:bg-[#303030] transition-colors"
                title="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <div className="text-sm text-white">
                {Math.floor(simulationState.timeElapsed)}s
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        ref={boardRef}
        className={`relative mx-auto aspect-[16/11] max-w-5xl overflow-hidden rounded-lg bg-gray-800 ${
          transitioning ? 'pointer-events-none' : ''
        } ${fieldStyle.is3D ? `cursor-${fieldStyle.isLocked ? 'default' : 'grab'} active:cursor-${fieldStyle.isLocked ? 'default' : 'grabbing'}` : ''}`}
        style={{
          perspective: '2000px',
          perspectiveOrigin: 'center 60%'
        }}
        onMouseMove={(e) => {
          if (dragState.isDragging) {
            handleDrag(e);
          } else if (fieldDragState.isDragging) {
            handleFieldMouseMove(e);
          }
        }}
        onMouseUp={() => {
          handleDragEnd();
          handleFieldMouseUp();
        }}
        onMouseLeave={() => {
          handleDragEnd();
          handleFieldMouseUp();
        }}
        onMouseDown={(e) => {
          // Only start field drag if not clicking on a player
          if (!e.target || !(e.target as Element).closest('.player-element')) {
            handleFieldMouseDown(e);
          }
        }}
      >
        <div 
          className="absolute inset-0"
          style={{
            transition: fieldDragState.isDragging ? 'none' : 'all 700ms cubic-bezier(0.4, 0, 0.2, 1)',
            transform: fieldStyle.is3D 
              ? `scale(${fieldStyle.zoom}) rotateX(${fieldStyle.verticalRotation}deg) rotateZ(${fieldStyle.rotation}deg) translateY(-5%)`
              : `scale(${fieldStyle.zoom}) rotateX(0deg) rotateZ(0deg) translateY(0)`,
            transformOrigin: 'center center',
            boxShadow: fieldStyle.is3D ? '0 50px 100px rgba(0, 0, 0, 0.5)' : 'none',
          }}
        >
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 1600 1100"
            preserveAspectRatio="xMidYMid meet"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="fieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: fieldStyle.startColor, stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: fieldStyle.endColor, stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            
            <rect 
              x="0" 
              y="0" 
              width="100%"
              height="100%"
              fill="url(#fieldGradient)"
            />
            
            
            {stripes}
            
            <g style={{ 
              opacity: fieldStyle.is3D ? 0.9 : 1,
              transition: 'opacity 700ms cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
              <rect
                x="50"
                y="50"
                width="1500"
                height="1000"
                stroke={fieldStyle.lineColor || 'rgba(255, 255, 255, 0.8)'}
                strokeWidth="2"
                fill="none"
              />

              <circle
                cx="800"
                cy="550"
                r="91.5"
                stroke={fieldStyle.lineColor || 'rgba(255, 255, 255, 0.8)'}
                strokeWidth="2"
                fill="none"
              />

              <line
                x1="800"
                y1="50"
                x2="800"
                y2="1050"
                stroke={fieldStyle.lineColor || 'rgba(255, 255, 255, 0.8)'}
                strokeWidth="2"
              />

              <rect
                x="50"
                y="325"
                width="165"
                height="450"
                stroke={fieldStyle.lineColor || 'rgba(255, 255, 255, 0.8)'}
                strokeWidth="2"
                fill="none"
              />

              <rect
                x="1385"
                y="325"
                width="165"
                height="450"
                stroke={fieldStyle.lineColor || 'rgba(255, 255, 255, 0.8)'}
                strokeWidth="2"
                fill="none"
              />

              <path
                d="M 30 475 L 50 475 L 50 625 L 30 625 L 30 475"
                stroke={fieldStyle.lineColor || 'rgba(255, 255, 255, 0.8)'}
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M 1570 475 L 1550 475 L 1550 625 L 1570 625 L 1570 475"
                stroke={fieldStyle.lineColor || 'rgba(255, 255, 255, 0.8)'}
                strokeWidth="2"
                fill="none"
              />
            </g>
          </svg>

          {simulationMode && <Ball x={ballPosition.x} y={ballPosition.y} />}

          {teams.map((team, teamIndex) => {
            const positions = teamPositions.get(team.id) || [];
            return positions.map((position, index) => (
              <Player
                key={`${team.id}-${index}`}
                position={position}
                style={team.playerStyle}
                onDragStart={(e) => handleDragStart(e, team.id, index)}
                isDragging={dragState.teamId === team.id && dragState.currentPlayer === index}
                onNumberChange={(newNumber) => handleNumberChange(team.id, index, newNumber)}
                onRoleChange={(newRole) => handleRoleChange(team.id, index, newRole)}
                onDotNameChange={(newDotName) => handleDotNameChange(team.id, index, newDotName)}
                isNew={newPlayers.get(team.id)?.includes(index)}
                isRemoving={removingPlayers.get(team.id)?.includes(index)}
                showLabel={settings.showLabels}
                size={settings.playerSize}
                fieldRotation={fieldStyle.is3D ? fieldStyle.rotation || 0 : 0}
                fieldVerticalRotation={fieldStyle.is3D ? fieldStyle.verticalRotation || 0 : 0}
              />
            ));
          })}
        </div>

        {fieldStyle.is3D && !fieldStyle.isLocked && (
          <div 
            className="absolute left-1/2 -bottom-12 -translate-x-1/2 cursor-grab active:cursor-grabbing"
            onMouseDown={(e) => handleFieldMouseDown(e, true)}
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full blur-md bg-white/10" />
              <div 
                className="relative h-10 w-10 rounded-full bg-gradient-to-br from-white/20 to-white/5 shadow-lg ring-1 ring-white/10"
                style={{
                  transform: `rotateX(${fieldStyle.verticalRotation}deg) rotateZ(${fieldStyle.rotation}deg)`
                }}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-transparent to-black/20" />
                
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div
                    className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                    style={getPositionIndicatorStyle()}
                  />
                </div>

                <div className="absolute inset-0 rounded-full">
                  <div className="absolute inset-x-0 top-1/2 h-px bg-white/10" />
                  <div className="absolute inset-y-0 left-1/2 w-px bg-white/10" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TacticalBoard;