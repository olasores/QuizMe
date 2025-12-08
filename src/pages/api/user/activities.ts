import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerClient } from '@/lib/supabase/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, limit } = req.query;
    const limitNum = limit ? parseInt(limit as string, 10) : 5;
    
    // Get Supabase client
    const supabase = createServerClient();
    
    // Query directly from the database
    const query = supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limitNum);
    
    // If userId is provided, filter by user
    if (userId) {
      query.eq('user_id', userId);
    }
    
    // Execute the query
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching activities:', error);
      return res.status(500).json({ error: 'Failed to fetch activities' });
    }
    
    return res.status(200).json({ activities: data || [] });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return res.status(500).json({ error: 'Failed to fetch activities' });
  }
}