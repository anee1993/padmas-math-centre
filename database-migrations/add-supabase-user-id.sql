-- Add supabase_user_id column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS supabase_user_id UUID UNIQUE;

-- Add supabase_user_id column to student_profiles table
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS supabase_user_id UUID UNIQUE;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_supabase_id ON users(supabase_user_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_supabase_id ON student_profiles(supabase_user_id);

-- Add comment for documentation
COMMENT ON COLUMN users.supabase_user_id IS 'UUID from Supabase Auth linking to auth.users';
COMMENT ON COLUMN student_profiles.supabase_user_id IS 'UUID from Supabase Auth linking to auth.users';
