import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerClient } from '@/lib/supabase/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;
    
    // Get Supabase client
    const supabase = createServerClient();
    
    // Query directly from the database
    const query = supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false });
    
    // If userId is provided, filter by user
    if (userId) {
      query.eq('user_id', userId);
    }
    
    // Execute the query
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching quizzes:', error);
      return res.status(500).json({ error: 'Failed to fetch quizzes' });
    }
    
    return res.status(200).json({ quizzes: data || [] });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
}