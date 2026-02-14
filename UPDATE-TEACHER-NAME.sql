-- Update the existing teacher account to add the full name
-- Run this in your Supabase SQL Editor

UPDATE users 
SET full_name = 'A Padma' 
WHERE email = 'teacher@mathtuition.com';

-- Verify the update
SELECT id, email, full_name, role 
FROM users 
WHERE email = 'teacher@mathtuition.com';
