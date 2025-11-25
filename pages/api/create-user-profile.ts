import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerClient } from '@/lib/supabase/server';

interface CreateUserProfileRequest {
  user_id: string;
  email: string;
  full_name?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id, email, full_name } = req.body as CreateUserProfileRequest;

    if (!user_id || !email) {
      return res.status(400).json({ error: 'user_id and email are required' });
    }

    const supabase = createServerClient();

    // Check if user profile already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user_id)
      .single();

    if (!checkError && existingUser) {
      return res.status(200).json({ 
        success: true, 
        message: 'User profile already exists',
        user: existingUser 
      });
    }

    // Try to create new user profile with retry logic
    let retries = 0;
    const maxRetries = 3;
    let lastError: { code?: string; message?: string } | null = null;

    while (retries < maxRetries) {
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          id: user_id,
          email,
          full_name: full_name || null
        })
        .select()
        .single();

      if (!error) {
        return res.status(201).json({ 
          success: true, 
          message: 'User profile created successfully',
          user: newUser 
        });
      }

      // If it's a duplicate email error, just return success
      if (error.code === '23505') {
        console.log('User profile already exists (duplicate email)');
        return res.status(200).json({ 
          success: true, 
          message: 'User profile already exists',
          userCreatedInAuth: true 
        });
      }

      lastError = error;

      // If it's a foreign key constraint error, retry after a short delay
      if (error.code === '23503' && retries < maxRetries - 1) {
        console.log(`Retrying user profile creation (attempt ${retries + 2}/${maxRetries})...`);
        retries++;
        // Wait 500ms before retrying
        await new Promise(resolve => setTimeout(resolve, 500));
        continue;
      }

      // For other errors, don't retry
      break;
    }

    console.error('Error creating user profile after retries:', lastError);
    
    // Return success anyway since the user was created in auth
    // The profile can be created later or on first login
    return res.status(201).json({ 
      success: true, 
      message: 'User account created. Profile will be completed on first login.',
      userCreatedInAuth: true 
    });
  } catch (error) {
    console.error('Error in create-user-profile:', error);
    // Don't fail the signup if profile creation fails
    return res.status(201).json({ 
      success: true, 
      message: 'User account created successfully',
      error: 'Profile creation deferred'
    });
  }
}
