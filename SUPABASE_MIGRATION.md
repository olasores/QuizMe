# Supabase Migration Guide

## Setting up the Users Table

The application now requires a `users` table in Supabase to store user profile information.

### Steps to set up:

1. **Go to Supabase Dashboard**
   - Navigate to https://app.supabase.com
   - Select your project

2. **Run the SQL migrations**
   - Go to SQL Editor
   - Click "New Query"
   - Copy the entire contents of `/supabase/schema.sql`
   - Click "Run" to execute all migrations

3. **Verify the setup**
   - In the Supabase dashboard, check the "Tables" section
   - You should see a new `users` table with the following columns:
     - `id` (UUID, primary key, references auth.users)
     - `email` (TEXT, unique)
     - `full_name` (TEXT)
     - `avatar_url` (TEXT)
     - `bio` (TEXT)
     - `created_at` (TIMESTAMP)
     - `updated_at` (TIMESTAMP)

4. **Verify RLS Policies**
   - Click on the `users` table
   - Go to the "RLS" tab
   - Ensure these policies are enabled:
     - "Users can view their own profile"
     - "Users can update their own profile"
     - "Users can insert their own profile"

## How it works

When a user signs up:
1. Supabase Auth creates an entry in `auth.users`
2. The signup page calls `/api/create-user-profile` API
3. The API creates a profile entry in the `users` table with:
   - The user's ID (from auth.users)
   - Their email
   - Their full name

When a user logs in:
- Their profile information is available via the `users` table
- RLS policies ensure users can only access their own profile

## For existing users

If you have users who signed up before this migration:
1. You can manually insert them into the users table
2. Or they will automatically get a profile created on their next login

To manually sync, run this SQL:
```sql
INSERT INTO users (id, email, full_name, created_at)
SELECT id, email, raw_user_meta_data->>'full_name', created_at
FROM auth.users
ON CONFLICT (id) DO NOTHING;
```
