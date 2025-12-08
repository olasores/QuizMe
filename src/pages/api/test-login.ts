import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerClient } from '@/lib/supabase/server';

interface TestLoginRequest {
  email: string;
  password: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body as TestLoginRequest;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const supabase = createServerClient();

    // Test login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Login test failed:', error);
      return res.status(401).json({ 
        success: false, 
        error: error.message,
        message: 'Invalid credentials'
      });
    }

    if (data.session) {
      return res.status(200).json({ 
        success: true, 
        message: 'Login successful!',
        user: {
          id: data.user?.id,
          email: data.user?.email,
          emailConfirmed: data.user?.email_confirmed_at ? true : false
        }
      });
    }

    return res.status(401).json({ 
      success: false, 
      message: 'No session created'
    });
  } catch (error) {
    console.error('Error in test-login:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
