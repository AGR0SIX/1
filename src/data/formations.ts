import type { Formation } from '../types';

export const defaultFormations: Record<string, Formation> = {
  '4-3-3': {
    name: '4-3-3',
    positions: [
      // Goalkeeper (1)
      { x: 5, y: 50, role: 'GK', number: 1 },
      // Right Back (2)
      { x: 20, y: 80, role: 'RB', number: 2 },
      // Left Back (3)
      { x: 20, y: 20, role: 'LB', number: 3 },
      // Center Back (4)
      { x: 20, y: 40, role: 'CB', number: 4 },
      // Center Back (5)
      { x: 20, y: 60, role: 'CB', number: 5 },
      // Defensive Mid (6)
      { x: 40, y: 50, role: 'CM', number: 6 },
      // Right Wing (7)
      { x: 70, y: 80, role: 'RW', number: 7 },
      // Center Mid (8)
      { x: 40, y: 30, role: 'CM', number: 8 },
      // Striker (9)
      { x: 70, y: 50, role: 'ST', number: 9 },
      // Playmaker (10)
      { x: 40, y: 70, role: 'CM', number: 10 },
      // Left Wing (11)
      { x: 70, y: 20, role: 'LW', number: 11 },
    ],
  },
  '4-4-2': {
    name: '4-4-2',
    positions: [
      // Goalkeeper (1)
      { x: 5, y: 50, role: 'GK', number: 1 },
      // Right Back (2)
      { x: 20, y: 80, role: 'RB', number: 2 },
      // Left Back (3)
      { x: 20, y: 20, role: 'LB', number: 3 },
      // Center Back (4)
      { x: 20, y: 40, role: 'CB', number: 4 },
      // Center Back (5)
      { x: 20, y: 60, role: 'CB', number: 5 },
      // Defensive Mid (6)
      { x: 45, y: 40, role: 'CM', number: 6 },
      // Right Mid (7)
      { x: 45, y: 80, role: 'RM', number: 7 },
      // Center Mid (8)
      { x: 45, y: 60, role: 'CM', number: 8 },
      // Striker (9)
      { x: 70, y: 40, role: 'ST', number: 9 },
      // Striker (10)
      { x: 70, y: 60, role: 'ST', number: 10 },
      // Left Mid (11)
      { x: 45, y: 20, role: 'LM', number: 11 },
    ],
  },
  '4-2-3-1': {
    name: '4-2-3-1',
    positions: [
      // Goalkeeper (1)
      { x: 5, y: 50, role: 'GK', number: 1 },
      // Right Back (2)
      { x: 20, y: 80, role: 'RB', number: 2 },
      // Left Back (3)
      { x: 20, y: 20, role: 'LB', number: 3 },
      // Center Back (4)
      { x: 20, y: 40, role: 'CB', number: 4 },
      // Center Back (5)
      { x: 20, y: 60, role: 'CB', number: 5 },
      // Defensive Mid (6)
      { x: 40, y: 40, role: 'CDM', number: 6 },
      // Right Wing (7)
      { x: 60, y: 80, role: 'RAM', number: 7 },
      // Center Mid (8)
      { x: 40, y: 60, role: 'CDM', number: 8 },
      // Striker (9)
      { x: 80, y: 50, role: 'ST', number: 9 },
      // Playmaker (10)
      { x: 60, y: 50, role: 'CAM', number: 10 },
      // Left Wing (11)
      { x: 60, y: 20, role: 'LAM', number: 11 },
    ],
  },
  '4-1-4-1': {
    name: '4-1-4-1',
    positions: [
      // Goalkeeper (1)
      { x: 5, y: 50, role: 'GK', number: 1 },
      // Right Back (2)
      { x: 20, y: 80, role: 'RB', number: 2 },
      // Left Back (3)
      { x: 20, y: 20, role: 'LB', number: 3 },
      // Center Back (4)
      { x: 20, y: 40, role: 'CB', number: 4 },
      // Center Back (5)
      { x: 20, y: 60, role: 'CB', number: 5 },
      // Defensive Mid (6)
      { x: 40, y: 50, role: 'CDM', number: 6 },
      // Right Mid (7)
      { x: 60, y: 80, role: 'RM', number: 7 },
      // Center Mid (8)
      { x: 60, y: 40, role: 'CM', number: 8 },
      // Center Mid (10)
      { x: 60, y: 60, role: 'CM', number: 10 },
      // Left Mid (11)
      { x: 60, y: 20, role: 'LM', number: 11 },
      // Striker (9)
      { x: 80, y: 50, role: 'ST', number: 9 },
    ],
  },
  '3-4-2-1': {
    name: '3-4-2-1',
    positions: [
      // Goalkeeper (1)
      { x: 5, y: 50, role: 'GK', number: 1 },
      // Left Center Back (2)
      { x: 20, y: 30, role: 'LCB', number: 2 },
      // Center Back (3)
      { x: 20, y: 50, role: 'CB', number: 3 },
      // Right Center Back (4)
      { x: 20, y: 70, role: 'RCB', number: 4 },
      // Left Wing Back (5)
      { x: 45, y: 20, role: 'LWB', number: 5 },
      // Right Wing Back (7)
      { x: 45, y: 80, role: 'RWB', number: 7 },
      // Left Center Mid (6)
      { x: 45, y: 40, role: 'LCM', number: 6 },
      // Right Center Mid (8)
      { x: 45, y: 60, role: 'RCM', number: 8 },
      // Left CAM (10)
      { x: 65, y: 35, role: 'CAM', number: 10 },
      // Right CAM (11)
      { x: 65, y: 65, role: 'CAM', number: 11 },
      // Striker (9)
      { x: 80, y: 50, role: 'ST', number: 9 },
    ],
  },
  '5-3-2': {
    name: '5-3-2',
    positions: [
      // Goalkeeper (1)
      { x: 5, y: 50, role: 'GK', number: 1 },
      // Left Wing Back (2)
      { x: 20, y: 20, role: 'LWB', number: 2 },
      // Left Center Back (3)
      { x: 20, y: 35, role: 'LCB', number: 3 },
      // Center Back (4)
      { x: 20, y: 50, role: 'CB', number: 4 },
      // Right Center Back (5)
      { x: 20, y: 65, role: 'RCB', number: 5 },
      // Right Wing Back (7)
      { x: 20, y: 80, role: 'RWB', number: 7 },
      // Left Center Mid (6)
      { x: 45, y: 35, role: 'LCM', number: 6 },
      // Center Mid (8)
      { x: 45, y: 50, role: 'CM', number: 8 },
      // Right Center Mid (10)
      { x: 45, y: 65, role: 'RCM', number: 10 },
      // Left Striker (9)
      { x: 75, y: 40, role: 'ST', number: 9 },
      // Right Striker (11)
      { x: 75, y: 60, role: 'ST', number: 11 },
    ],
  },
  '4-1-2-1-2': {
    name: '4-1-2-1-2',
    positions: [
      // Goalkeeper (1)
      { x: 5, y: 50, role: 'GK', number: 1 },
      // Right Back (2)
      { x: 20, y: 80, role: 'RB', number: 2 },
      // Left Back (3)
      { x: 20, y: 20, role: 'LB', number: 3 },
      // Center Back (4)
      { x: 20, y: 40, role: 'CB', number: 4 },
      // Center Back (5)
      { x: 20, y: 60, role: 'CB', number: 5 },
      // Defensive Mid (6)
      { x: 35, y: 50, role: 'CDM', number: 6 },
      // Left Mid (7)
      { x: 50, y: 35, role: 'CM', number: 7 },
      // Right Mid (8)
      { x: 50, y: 65, role: 'CM', number: 8 },
      // CAM (10)
      { x: 65, y: 50, role: 'CAM', number: 10 },
      // Left Striker (9)
      { x: 80, y: 35, role: 'ST', number: 9 },
      // Right Striker (11)
      { x: 80, y: 65, role: 'ST', number: 11 },
    ],
  },
  '3-4-1-2': {
    name: '3-4-1-2',
    positions: [
      // Goalkeeper (1)
      { x: 5, y: 50, role: 'GK', number: 1 },
      // Left Center Back (2)
      { x: 20, y: 30, role: 'LCB', number: 2 },
      // Center Back (3)
      { x: 20, y: 50, role: 'CB', number: 3 },
      // Right Center Back (4)
      { x: 20, y: 70, role: 'RCB', number: 4 },
      // Left Wing Back (5)
      { x: 45, y: 20, role: 'LWB', number: 5 },
      // Right Wing Back (7)
      { x: 45, y: 80, role: 'RWB', number: 7 },
      // Left Center Mid (6)
      { x: 45, y: 40, role: 'LCM', number: 6 },
      // Right Center Mid (8)
      { x: 45, y: 60, role: 'RCM', number: 8 },
      // CAM (10)
      { x: 65, y: 50, role: 'CAM', number: 10 },
      // Left Striker (9)
      { x: 80, y: 40, role: 'ST', number: 9 },
      // Right Striker (11)
      { x: 80, y: 60, role: 'ST', number: 11 },
    ],
  },
  '5-2-3': {
    name: '5-2-3',
    positions: [
      // Goalkeeper (1)
      { x: 5, y: 50, role: 'GK', number: 1 },
      // Left Wing Back (2)
      { x: 20, y: 20, role: 'LWB', number: 2 },
      // Left Center Back (3)
      { x: 20, y: 35, role: 'LCB', number: 3 },
      // Center Back (4)
      { x: 20, y: 50, role: 'CB', number: 4 },
      // Right Center Back (5)
      { x: 20, y: 65, role: 'RCB', number: 5 },
      // Right Wing Back (6)
      { x: 20, y: 80, role: 'RWB', number: 6 },
      // Left Center Mid (7)
      { x: 45, y: 40, role: 'CM', number: 7 },
      // Right Center Mid (8)
      { x: 45, y: 60, role: 'CM', number: 8 },
      // Left Forward (9)
      { x: 75, y: 30, role: 'LW', number: 9 },
      // Striker (10)
      { x: 75, y: 50, role: 'ST', number: 10 },
      // Right Forward (11)
      { x: 75, y: 70, role: 'RW', number: 11 },
    ],
  },
};