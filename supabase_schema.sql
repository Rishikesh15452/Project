-- CivicFix Supabase Schema (Updated for Images)
-- Copy and paste this into your Supabase Dashboard -> SQL Editor -> New Query, and hit Run.

-- Table: profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'citizen',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: issues
CREATE TABLE IF NOT EXISTS issues (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users, -- Nullable for anonymous reports
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT DEFAULT 'Open' NOT NULL,
  urgency INTEGER DEFAULT 50,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  distance_mock TEXT, 
  upvotes INTEGER DEFAULT 0,
  tags JSONB,
  image_urls JSONB, -- Array of strings ["url1", "url2"]
  department TEXT,
  area TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- If you ran the old schema, uncomment and run this line to upgrade:
-- ALTER TABLE issues ADD COLUMN IF NOT EXISTS image_urls JSONB;
-- ALTER TABLE issues ADD COLUMN IF NOT EXISTS department TEXT;
-- ALTER TABLE issues ADD COLUMN IF NOT EXISTS area TEXT;

-- Table: likes/upvotes
CREATE TABLE IF NOT EXISTS issue_upvotes (
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (issue_id, user_id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_upvotes ENABLE ROW LEVEL SECURITY;

-- Storage bucket for photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('issue-photos', 'issue-photos', true) ON CONFLICT DO NOTHING;

-- Storage Policies for 'issue-photos' (Required to allow uploads from the app)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'issue-photos');

DROP POLICY IF EXISTS "Users can upload" ON storage.objects;
CREATE POLICY "Users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'issue-photos');

-- Policies for Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Policies for Issues
DROP POLICY IF EXISTS "Issues are viewable by everyone." ON issues;
CREATE POLICY "Issues are viewable by everyone." ON issues FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert issues." ON issues;
CREATE POLICY "Authenticated users can insert issues." ON issues FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own issues." ON issues;
CREATE POLICY "Users can update their own issues." ON issues FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update any issue." ON issues;
CREATE POLICY "Admins can update any issue." ON issues FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Storage bucket for photos
-- Go to Supabase > Storage > Create a public bucket called 'issue-photos'
