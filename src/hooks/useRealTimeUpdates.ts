import { useEffect, useRef, useCallback, useMemo } from 'react';
import { debounce } from '../utils/debounce';
import type { Position, Team } from '../types';

interface UseRealTimeUpdatesProps {
  teams: Team[];
  teamPositions: Map<string, Position[]>;
  setTeamPositions: React.Dispatch<React.SetStateAction<Map<string, Position[]>>>;
  autoUpdatePositions: boolean;
  onPositionUpdate?: (teamId: string, positions: Position[]) => void;
}

interface PositionCache {
  [key: string]: {
    positions: Position[];
    timestamp: number;
    hash: string;
  };
}

export const useRealTimeUpdates = ({
  teams,
  teamPositions,
  setTeamPositions,
  autoUpdatePositions,
  onPositionUpdate
}: UseRealTimeUpdatesProps) => {
  const positionCacheRef = useRef<PositionCache>({});
  const updateQueueRef = useRef<Map<string, Position[]>>(new Map());
  const animationFrameRef = useRef<number>();
  const lastUpdateTimeRef = useRef<number>(0);

  // Memoized position validation and boundary checking
  const validatePosition = useCallback((position: Position): Position => {
    return {
      ...position,
      x: Math.max(1.67, Math.min(98.33, position.x)),
      y: Math.max(1.67, Math.min(98.33, position.y))
    };
  }, []);

  // Optimized position hashing for change detection
  const hashPositions = useCallback((positions: Position[]): string => {
    return positions
      .map(p => `${Math.round(p.x * 100)}:${Math.round(p.y * 100)}:${p.role}:${p.number}`)
      .join('|');
  }, []);

  // Enhanced position interpolation for smooth transitions
  const interpolatePosition = useCallback((
    from: Position,
    to: Position,
    progress: number
  ): Position => {
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    const easedProgress = easeOutCubic(Math.min(1, Math.max(0, progress)));

    return {
      ...to,
      x: from.x + (to.x - from.x) * easedProgress,
      y: from.y + (to.y - from.y) * easedProgress
    };
  }, []);

  // Batch position updates for performance
  const batchUpdatePositions = useCallback(() => {
    if (updateQueueRef.current.size === 0) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - lastUpdateTimeRef.current;
    
    // Throttle updates to 60fps max
    if (deltaTime < 16.67) {
      animationFrameRef.current = requestAnimationFrame(batchUpdatePositions);
      return;
    }

    const updates = new Map<string, Position[]>();
    
    updateQueueRef.current.forEach((targetPositions, teamId) => {
      const currentPositions = teamPositions.get(teamId) || [];
      const cache = positionCacheRef.current[teamId];
      
      if (cache && autoUpdatePositions) {
        const progress = Math.min(1, (currentTime - cache.timestamp) / 300); // 300ms transition
        
        const interpolatedPositions = targetPositions.map((targetPos, index) => {
          const currentPos = currentPositions[index];
          if (!currentPos) return validatePosition(targetPos);
          
          return validatePosition(interpolatePosition(currentPos, targetPos, progress));
        });
        
        updates.set(teamId, interpolatedPositions);
        
        // Remove from queue when transition is complete
        if (progress >= 1) {
          updateQueueRef.current.delete(teamId);
          positionCacheRef.current[teamId] = {
            positions: interpolatedPositions,
            timestamp: currentTime,
            hash: hashPositions(interpolatedPositions)
          };
        }
      } else {
        // Immediate update when auto-update is disabled
        const validatedPositions = targetPositions.map(validatePosition);
        updates.set(teamId, validatedPositions);
        updateQueueRef.current.delete(teamId);
        
        positionCacheRef.current[teamId] = {
          positions: validatedPositions,
          timestamp: currentTime,
          hash: hashPositions(validatedPositions)
        };
      }
    });

    if (updates.size > 0) {
      setTeamPositions(prev => {
        const newMap = new Map(prev);
        updates.forEach((positions, teamId) => {
          newMap.set(teamId, positions);
          onPositionUpdate?.(teamId, positions);
        });
        return newMap;
      });
    }

    lastUpdateTimeRef.current = currentTime;

    // Continue animation if there are pending updates
    if (updateQueueRef.current.size > 0) {
      animationFrameRef.current = requestAnimationFrame(batchUpdatePositions);
    }
  }, [teamPositions, setTeamPositions, autoUpdatePositions, validatePosition, interpolatePosition, hashPositions, onPositionUpdate]);

  // Debounced formation change handler
  const debouncedFormationUpdate = useMemo(
    () => debounce((teamId: string, newPositions: Position[]) => {
      const currentTime = performance.now();
      const newHash = hashPositions(newPositions);
      const cache = positionCacheRef.current[teamId];
      
      // Skip update if positions haven't actually changed
      if (cache && cache.hash === newHash) return;
      
      updateQueueRef.current.set(teamId, newPositions);
      
      positionCacheRef.current[teamId] = {
        positions: newPositions,
        timestamp: currentTime,
        hash: newHash
      };

      // Start batch update cycle
      if (!animationFrameRef.current) {
        animationFrameRef.current = requestAnimationFrame(batchUpdatePositions);
      }
    }, 50),
    [hashPositions, batchUpdatePositions]
  );

  // Immediate position update for drag operations
  const updatePositionImmediate = useCallback((
    teamId: string,
    playerIndex: number,
    newPosition: Partial<Position>
  ) => {
    const currentPositions = teamPositions.get(teamId) || [];
    const updatedPositions = currentPositions.map((pos, index) =>
      index === playerIndex 
        ? validatePosition({ ...pos, ...newPosition })
        : pos
    );

    const currentTime = performance.now();
    const newHash = hashPositions(updatedPositions);
    
    setTeamPositions(prev => new Map(prev).set(teamId, updatedPositions));
    
    positionCacheRef.current[teamId] = {
      positions: updatedPositions,
      timestamp: currentTime,
      hash: newHash
    };

    onPositionUpdate?.(teamId, updatedPositions);
  }, [teamPositions, setTeamPositions, validatePosition, hashPositions, onPositionUpdate]);

  // Smart role assignment based on field position
  const getOptimalRole = useCallback((x: number, y: number, teamIndex: number): string => {
    if (!autoUpdatePositions) return 'CM'; // Default role when auto-update is off
    
    // Adjust coordinates for team orientation
    const adjustedX = teamIndex === 1 ? 100 - x : x;
    
    // Define field zones with more precision
    const zones = {
      defense: adjustedX <= 25,
      midfield: adjustedX > 25 && adjustedX <= 70,
      attack: adjustedX > 70
    };
    
    const verticalZones = {
      left: y <= 30,
      centerLeft: y > 30 && y <= 45,
      center: y > 45 && y <= 55,
      centerRight: y > 55 && y <= 70,
      right: y > 70
    };
    
    // Role assignment logic
    if (zones.defense) {
      if (verticalZones.left) return 'LB';
      if (verticalZones.right) return 'RB';
      return 'CB';
    }
    
    if (zones.midfield) {
      if (adjustedX <= 40) {
        // Defensive midfield
        if (verticalZones.left) return 'LM';
        if (verticalZones.right) return 'RM';
        return 'CDM';
      } else {
        // Attacking midfield
        if (verticalZones.left) return 'LAM';
        if (verticalZones.right) return 'RAM';
        return 'CAM';
      }
    }
    
    if (zones.attack) {
      if (verticalZones.left) return 'LW';
      if (verticalZones.right) return 'RW';
      return 'ST';
    }
    
    return 'CM';
  }, [autoUpdatePositions]);

  // Mirror roles for opposing team
  const mirrorRole = useCallback((role: string): string => {
    const roleMap: Record<string, string> = {
      'LW': 'RW', 'RW': 'LW',
      'LM': 'RM', 'RM': 'LM',
      'LB': 'RB', 'RB': 'LB',
      'LAM': 'RAM', 'RAM': 'LAM',
      'LCM': 'RCM', 'RCM': 'LCM',
      'LCB': 'RCB', 'RCB': 'LCB'
    };
    return roleMap[role] || role;
  }, []);

  // Handle formation changes with intelligent position preservation
  useEffect(() => {
    teams.forEach((team, teamIndex) => {
      const currentPositions = teamPositions.get(team.id) || [];
      const formationPositions = team.formation.positions;
      
      // Create new positions array with preserved player data
      const newPositions = formationPositions.map((formationPos, index) => {
        const existingPos = currentPositions[index];
        const baseRole = teamIndex === 1 ? mirrorRole(formationPos.role) : formationPos.role;
        
        return {
          ...formationPos,
          x: teamIndex === 1 ? 100 - formationPos.x : formationPos.x,
          role: baseRole,
          number: existingPos?.number ?? formationPos.number,
          dotName: existingPos?.dotName ?? formationPos.dotName,
          color: existingPos?.color ?? formationPos.color
        };
      });
      
      debouncedFormationUpdate(team.id, newPositions);
    });
  }, [teams, debouncedFormationUpdate, mirrorRole]);

  // Cleanup animation frames
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    updatePositionImmediate,
    getOptimalRole,
    isUpdating: updateQueueRef.current.size > 0
  };
};