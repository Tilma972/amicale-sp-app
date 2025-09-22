-- Migration ultra simple sans politiques RLS pour commencer

-- Types
CREATE TYPE user_role AS ENUM ('firefighter', 'team_leader', 'treasurer');
CREATE TYPE payment_method AS ENUM ('cash', 'check', 'card', 'transfer');

-- Extension users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'firefighter',
ADD COLUMN IF NOT EXISTS team_id UUID,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false;

-- Teams
CREATE TABLE teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  calendars_target INTEGER DEFAULT 50,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Donations basique
CREATE TABLE donations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  firefighter_id UUID REFERENCES public.users(id) NOT NULL,
  team_id UUID REFERENCES teams(id),
  amount DECIMAL(10,2) NOT NULL,
  donor_name TEXT,
  payment_method payment_method NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);