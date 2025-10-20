import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerClient } from '@/lib/supabase/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the current user's session token from the request
    const supabaseToken = req.headers.authorization?.split('Bearer ')[1];
    
    if (!supabaseToken) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }
    
    // Create a server client with the user's token
    const supabase = createServerClient();
    
    // Get the user from the session
    const { data, error } = await supabase.auth.getUser(supabaseToken);
    
    if (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Return the user ID
    return res.status(200).json({ 
      userId: data.user.id,
      email: data.user.email
    });
  } catch (error) {
    console.error('Error getting user ID:', error);
    return res.status(500).json({ error: 'Failed to get user ID' });
  }
}