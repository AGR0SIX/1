export interface Position {
  x: number;
  y: number;
  role: string;
  number: number;
  dotName?: string;
  color?: string;
}

export interface Formation {
  name: string;
  positions: Position[];
}

export interface DragState {
  isDragging: boolean;
  currentPlayer: number | null;
  offset: {
    x: number;
    y: number;
  };
}

export interface PlayerStyle {
  primaryColor: string;
  secondaryColor: string;
  numberColor: string;
  labelColor: string;
}

export interface FieldStyle {
  startColor: string;
  endColor: string;
  lineColor?: string;
  is3D?: boolean;
  perspective?: number;
  rotation?: number;
  verticalRotation?: number;
  zoom?: number;
  isLocked?: boolean;
}

export interface Team {
  id: string;
  name: string;
  formation: Formation;
  playerStyle: PlayerStyle;
  playerCount: number;
}

export interface TacticalBoardSettings {
  showLabels: boolean;
  playerSize: 'small' | 'medium' | 'large';
  enableSmoothing?: boolean;
  updateFrequency?: number;
}

export interface PlayerStats {
  speed: number;
  acceleration: number;
  stamina: number;
  agility: number;
  strength: number;
  passing: number;
  shooting: number;
  dribbling: number;
  defending: number;
  positioning: number;
}

export interface SimulationPlayer extends Position {
  stats: PlayerStats;
  body?: Matter.Body;
  velocity: {
    x: number;
    y: number;
  };
  lastPosition: {
    x: number;
    y: number;
  };
}

export interface SimulationState {
  isRunning: boolean;
  timeElapsed: number;
  possession: {
    teamA: number;
    teamB: number;
  };
  score: {
    teamA: number;
    teamB: number;
  };
}