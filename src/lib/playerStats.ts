import { supabase, testSupabaseConnection } from './supabase';
import type { PlayerStats } from '../types';

// Default stats to use when database is unavailable
const getDefaultStats = (role: string): PlayerStats => {
  // Role-specific default stats for better realism
  const baseStats = {
    GK: { speed: 60, acceleration: 60, stamina: 80, agility: 85, strength: 80, passing: 75, shooting: 30, dribbling: 40, defending: 90, positioning: 90 },
    CB: { speed: 65, acceleration: 65, stamina: 80, agility: 70, strength: 85, passing: 75, shooting: 40, dribbling: 50, defending: 85, positioning: 85 },
    LB: { speed: 80, acceleration: 80, stamina: 85, agility: 80, strength: 70, passing: 75, shooting: 50, dribbling: 70, defending: 75, positioning: 75 },
    RB: { speed: 80, acceleration: 80, stamina: 85, agility: 80, strength: 70, passing: 75, shooting: 50, dribbling: 70, defending: 75, positioning: 75 },
    CDM: { speed: 70, acceleration: 70, stamina: 85, agility: 75, strength: 80, passing: 85, shooting: 60, dribbling: 70, defending: 80, positioning: 80 },
    CM: { speed: 75, acceleration: 75, stamina: 85, agility: 80, strength: 75, passing: 85, shooting: 70, dribbling: 80, defending: 70, positioning: 75 },
    CAM: { speed: 75, acceleration: 80, stamina: 80, agility: 85, strength: 65, passing: 90, shooting: 80, dribbling: 85, defending: 50, positioning: 80 },
    LW: { speed: 85, acceleration: 90, stamina: 80, agility: 90, strength: 65, passing: 75, shooting: 75, dribbling: 90, defending: 40, positioning: 70 },
    RW: { speed: 85, acceleration: 90, stamina: 80, agility: 90, strength: 65, passing: 75, shooting: 75, dribbling: 90, defending: 40, positioning: 70 },
    ST: { speed: 80, acceleration: 85, stamina: 75, agility: 85, strength: 80, passing: 70, shooting: 90, dribbling: 85, defending: 30, positioning: 90 }
  };

  // Normalize role names
  const normalizedRole = role.replace(/[LRC]/g, '').replace('WB', 'B');
  return baseStats[normalizedRole as keyof typeof baseStats] || baseStats.CM;
};
export async function fetchPlayerStats(role: string): Promise<PlayerStats> {
  // Check if Supabase credentials are available
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return getDefaultStats(role);
  }

  try {
    // Test connection first
    const isConnected = await testSupabaseConnection();
    if (!isConnected) {
      return getDefaultStats(role);
    }

    let query = supabase
      .from('player_stats')
      .select('*');

    switch (role) {
      case 'GK':
        query = query.ilike('player_name', '%GK%');
        break;
      case 'CB':
      case 'LCB':
      case 'RCB':
        query = query.ilike('player_name', '%CB%');
        break;
      case 'LB':
      case 'RB':
      case 'LWB':
      case 'RWB':
        query = query.ilike('player_name', '%FB%');
        break;
      case 'CDM':
        query = query.ilike('player_name', '%CDM%');
        break;
      case 'CM':
      case 'LCM':
      case 'RCM':
        query = query.ilike('player_name', '%CM%');
        break;
      case 'CAM':
      case 'LAM':
      case 'RAM':
        query = query.ilike('player_name', '%CAM%');
        break;
      case 'LW':
      case 'RW':
        query = query.ilike('player_name', '%WG%');
        break;
      case 'ST':
        query = query.ilike('player_name', '%ST%');
        break;
    }

    const { data, error } = await query.limit(1);

    if (error) {
      return getDefaultStats(role);
    }

    if (data && data.length > 0) {
      const stats = data[0];
      return {
        speed: stats.speed,
        acceleration: stats.acceleration,
        stamina: stats.stamina,
        agility: stats.agility,
        strength: stats.strength,
        passing: stats.passing,
        shooting: stats.shooting,
        dribbling: stats.dribbling,
        defending: stats.defending,
        positioning: stats.positioning
      };
    }

    return getDefaultStats(role);
  } catch (error) {
    return getDefaultStats(role);
  }
}