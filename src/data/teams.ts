import { defaultFormations } from './formations';
import type { Team } from '../types';

export const defaultTeams: Team[] = [
  {
    id: '1',
    name: 'Team A',
    formation: defaultFormations['4-3-3'],
    playerCount: 11,
    playerStyle: {
      primaryColor: '#22d3ee',
      secondaryColor: '#1e3a8a',
      numberColor: '#ffffff',
      labelColor: '#ffffff'
    }
  },
  {
    id: '2',
    name: 'Team B',
    formation: defaultFormations['4-3-3'],
    playerCount: 11,
    playerStyle: {
      primaryColor: '#ef4444',
      secondaryColor: '#991b1b',
      numberColor: '#ffffff',
      labelColor: '#ffffff'
    }
  }
];