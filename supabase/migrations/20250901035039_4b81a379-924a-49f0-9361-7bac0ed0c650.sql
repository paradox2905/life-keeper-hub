-- Create a function to delete user account and all associated data
CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_uuid uuid;
BEGIN
  -- Get the current user's ID
  user_uuid := auth.uid();
  
  -- Check if user is authenticated
  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Delete user's data in order (due to potential foreign key constraints)
  DELETE FROM activity_logs WHERE user_id = user_uuid;
  DELETE FROM contacts WHERE user_id = user_uuid;
  DELETE FROM vault_entries WHERE user_id = user_uuid;
  
  -- Delete the user from auth.users (this will cascade to other auth-related tables)
  DELETE FROM auth.users WHERE id = user_uuid;
END;
$$;