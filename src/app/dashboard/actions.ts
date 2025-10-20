/**
 * Server component to fetch user's dashboard data
 */
import { getUserQuizzes, getUserActivities, getUserStats } from '@/lib/quizzes';

export async function fetchDashboardData(userId?: string) {
  // Get user's quizzes
  const quizzes = await getUserQuizzes(userId);
  
  // Get user's activities
  const activities = await getUserActivities(userId, 5);
  
  // Get user's stats
  const stats = await getUserStats(userId);
  
  return {
    quizzes,
    activities,
    stats
  };
}