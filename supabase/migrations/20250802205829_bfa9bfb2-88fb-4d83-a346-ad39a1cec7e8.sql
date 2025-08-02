-- Bootstrap initial admin user to break role assignment deadlock
-- This creates an admin role for the first user who signs up
-- Replace with actual admin email in production

-- First, let's create a function to safely bootstrap admin access
CREATE OR REPLACE FUNCTION public.bootstrap_admin_access()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  first_user_id uuid;
BEGIN
  -- Get the first user from auth.users (oldest created user)
  SELECT id INTO first_user_id 
  FROM auth.users 
  ORDER BY created_at ASC 
  LIMIT 1;
  
  -- If we have a user and no admin exists, make them admin
  IF first_user_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'admin'
  ) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (first_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END;
$$;

-- Execute the bootstrap function
SELECT public.bootstrap_admin_access();

-- Create a more robust role assignment function for future use
CREATE OR REPLACE FUNCTION public.assign_user_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only admins can assign roles
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN false;
  END IF;
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN true;
END;
$$;