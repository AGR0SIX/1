/*
  # Create tactical suggestions table

  1. New Tables
    - `tactical_suggestions`
      - `id` (uuid, primary key)
      - `formation` (text) - The formation name (e.g., "4-3-3")
      - `pattern` (text) - The tactical pattern description
      - `description` (text) - Detailed explanation of the formation
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `tactical_suggestions` table
    - Add policy for public read access
*/

CREATE TABLE IF NOT EXISTS tactical_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  formation text NOT NULL,
  pattern text NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE tactical_suggestions ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access"
  ON tactical_suggestions
  FOR SELECT
  TO public
  USING (true);

-- Insert initial data
INSERT INTO tactical_suggestions (formation, pattern, description) VALUES
  ('4-3-3', 'possession based attacking football with wide players', 'Perfect for teams that want to dominate possession and create width. The three forwards provide attacking threat while the midfield trio controls the game.'),
  ('4-4-2', 'defensive solid counter attacking style', 'A classic formation focused on defensive stability and quick counter-attacks. Two strikers provide immediate outlet for counter-attacks.'),
  ('4-2-3-1', 'high pressing aggressive style', 'Modern formation that excels in pressing. The three attacking midfielders can press high while two defensive midfielders provide coverage.'),
  ('3-5-2', 'wing play with defensive security', 'Provides excellent width through wing-backs while maintaining defensive solidity with three center-backs. Two strikers can combine effectively.'),
  ('5-3-2', 'defensive fortress with counter capability', 'Very solid defensively with five defenders, but can transform into an attacking force with wing-backs pushing forward.');