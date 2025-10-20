# Quizzy Database Integration with Supabase

This document provides an overview of how Quizzy connects to Supabase and stores quiz data.

## Database Schema

The database consists of four main tables:

1. **quizzes** - Stores basic quiz information
   - id (UUID, primary key)
   - title (text)
   - description (text, optional)
   - created_at (timestamp)
   - updated_at (timestamp)
   - user_id (UUID, optional)
   - questions_count (integer)
   - topic (text, optional)
   - source_type ('text', 'document', or 'url')
   - source_name (text, optional)

2. **questions** - Stores questions for each quiz
   - id (UUID, primary key)
   - quiz_id (UUID, foreign key to quizzes)
   - text (text)
   - options (JSONB array of option objects)
   - correct_option_id (text)
   - order (integer)

3. **quiz_attempts** - Stores user attempts at quizzes
   - id (UUID, primary key)
   - quiz_id (UUID, foreign key to quizzes)
   - user_id (UUID, optional)
   - started_at (timestamp)
   - completed_at (timestamp, optional)
   - score (integer, optional)
   - max_score (integer)
   - answers (JSONB array of answer objects)

4. **activities** - Stores user activities for the dashboard
   - id (UUID, primary key)
   - user_id (UUID, optional)
   - activity_type ('quiz_created', 'quiz_completed', or 'quiz_started')
   - quiz_id (UUID, foreign key to quizzes)
   - quiz_title (text, optional)
   - score (integer, optional)
   - created_at (timestamp)

## API Endpoints

The application connects to Supabase through these API endpoints:

1. **GET /api/user/dashboard**
   - Returns user stats, recent quizzes, and activities
   - Query parameters: userId (optional)

2. **GET /api/user/quizzes**
   - Returns all quizzes for a user
   - Query parameters: userId (optional)

3. **GET /api/user/activities**
   - Returns user activities
   - Query parameters: userId (optional), limit (default: 5)

4. **GET /api/quiz**
   - Returns a specific quiz with its questions
   - Query parameters: id (required), userId (optional)

5. **POST /api/save-quiz**
   - Saves a new quiz with questions
   - Body: { quiz: {...}, questions: [...] }

6. **POST /api/save-quiz-attempt**
   - Saves a quiz attempt
   - Body: { quiz_id, user_id, score, max_score, answers }

## Implementation Details

1. Each API endpoint connects directly to Supabase using the server client
2. User authentication is managed by Supabase Auth
3. Row Level Security (RLS) policies enforce data privacy
4. The dashboard displays statistics calculated from the database

## Dashboard Data Flow

1. User loads dashboard page
2. Dashboard component fetches data from `/api/user/dashboard`
3. The endpoint queries Supabase for:
   - User statistics (calculated from quiz attempts)
   - Recent quizzes
   - Recent activities
4. Data is displayed in dashboard components

## Quiz Creation Flow

1. User creates a quiz
2. Form data is sent to `/api/save-quiz`
3. The endpoint saves the quiz and questions to Supabase
4. An activity record is created
5. The user is redirected to the quiz page

## Quiz Attempt Flow

1. User completes a quiz
2. Results are sent to `/api/save-quiz-attempt`
3. The endpoint saves the attempt and creates an activity record
4. The dashboard is updated with new statistics