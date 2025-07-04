/*
  # Add player statistics table

  1. New Tables
    - `player_stats`
      - `id` (uuid, primary key)
      - `player_name` (text) - Player's name
      - `speed` (integer) - Speed rating (0-100)
      - `acceleration` (integer) - Acceleration rating (0-100)
      - `stamina` (integer) - Stamina rating (0-100)
      - `agility` (integer) - Agility rating (0-100)
      - `strength` (integer) - Strength rating (0-100)
      - `passing` (integer) - Passing rating (0-100)
      - `shooting` (integer) - Shooting rating (0-100)
      - `dribbling` (integer) - Dribbling rating (0-100)
      - `defending` (integer) - Defending rating (0-100)
      - `positioning` (integer) - Positioning rating (0-100)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `player_stats` table
    - Add policy for public read access
*/

CREATE TABLE IF NOT EXISTS player_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name text NOT NULL,
  speed integer CHECK (speed BETWEEN 0 AND 100),
  acceleration integer CHECK (acceleration BETWEEN 0 AND 100),
  stamina integer CHECK (stamina BETWEEN 0 AND 100),
  agility integer CHECK (agility BETWEEN 0 AND 100),
  strength integer CHECK (strength BETWEEN 0 AND 100),
  passing integer CHECK (passing BETWEEN 0 AND 100),
  shooting integer CHECK (shooting BETWEEN 0 AND 100),
  dribbling integer CHECK (dribbling BETWEEN 0 AND 100),
  defending integer CHECK (defending BETWEEN 0 AND 100),
  positioning integer CHECK (positioning BETWEEN 0 AND 100),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access"
  ON player_stats
  FOR SELECT
  TO public
  USING (true);

-- Insert sample player data
INSERT INTO player_stats (
  player_name, speed, acceleration, stamina, agility, 
  strength, passing, shooting, dribbling, defending, positioning
) VALUES
  ('Default GK', 60, 60, 65, 70, 75, 65, 50, 55, 70, 85),
  ('Default CB', 65, 65, 75, 70, 85, 70, 55, 60, 85, 80),
  ('Default FB', 80, 80, 85, 80, 70, 75, 60, 75, 75, 75),
  ('Default CDM', 70, 70, 85, 75, 80, 80, 65, 70, 80, 80),
  ('Default CM', 75, 75, 85, 80, 70, 85, 70, 75, 70, 80),
  ('Default CAM', 75, 80, 80, 85, 65, 85, 75, 85, 60, 80),
  ('Default WG', 85, 85, 80, 85, 65, 75, 75, 85, 60, 75),
  ('Default ST', 80, 85, 75, 80, 80, 70, 85, 80, 55, 85);