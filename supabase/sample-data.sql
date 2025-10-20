-- Sample data for Quizzy app
-- Run this SQL in your Supabase SQL editor to populate the database with sample data

-- Using NULL for user_id to represent anonymous/public data
-- This will create sample data that's accessible without login
DO $$
DECLARE
  sample_user_id UUID := NULL; -- Using NULL for anonymous usage
BEGIN

-- Insert sample quizzes
INSERT INTO quizzes (title, description, user_id, questions_count, topic, source_type, source_name)
VALUES
  ('JavaScript Fundamentals', 'A quiz about JavaScript basics', sample_user_id, 5, 'JavaScript', 'text', 'MDN Docs'),
  ('React Hooks', 'Test your knowledge of React Hooks', sample_user_id, 4, 'React', 'text', 'React Documentation'),
  ('CSS Grid & Flexbox', 'Layout challenges with modern CSS', sample_user_id, 3, 'CSS', 'text', 'CSS Tricks');

-- Get the IDs of the inserted quizzes
WITH quiz_ids AS (
  SELECT id FROM quizzes WHERE user_id = sample_user_id ORDER BY created_at DESC LIMIT 3
)

-- Insert questions for the first quiz (JavaScript Fundamentals)
INSERT INTO questions (quiz_id, text, options, correct_option_id, "order")
SELECT
  (SELECT id FROM quizzes WHERE title = 'JavaScript Fundamentals' AND user_id = sample_user_id),
  q.text,
  q.options,
  q.correct_option_id,
  q.order
FROM (
  VALUES
    ('What does "let" keyword do in JavaScript?', 
     '[{"id": "a", "text": "Declares a block-scoped variable"}, {"id": "b", "text": "Declares a function-scoped variable"}, {"id": "c", "text": "Creates a constant"}, {"id": "d", "text": "Lets the browser decide the scope"}]'::jsonb,
     'a', 0),
    ('Which method adds an element to the end of an array?', 
     '[{"id": "a", "text": "shift()"}, {"id": "b", "text": "unshift()"}, {"id": "c", "text": "push()"}, {"id": "d", "text": "pop()"}]'::jsonb,
     'c', 1),
    ('What is the result of 2 + "2" in JavaScript?', 
     '[{"id": "a", "text": "4"}, {"id": "b", "text": "22"}, {"id": "c", "text": "Error"}, {"id": "d", "text": "undefined"}]'::jsonb,
     'b', 2)
) AS q(text, options, correct_option_id, "order");

-- Insert a quiz attempt for the JavaScript quiz
INSERT INTO quiz_attempts (
  quiz_id,
  user_id,
  started_at,
  completed_at,
  score,
  max_score,
  answers
)
VALUES (
  (SELECT id FROM quizzes WHERE title = 'JavaScript Fundamentals' AND user_id = sample_user_id),
  sample_user_id,
  NOW() - interval '2 days',
  NOW() - interval '2 days' + interval '10 minutes',
  2,
  3,
  '[
    {"question_id": "q1", "selected_option_id": "a", "is_correct": true},
    {"question_id": "q2", "selected_option_id": "c", "is_correct": true},
    {"question_id": "q3", "selected_option_id": "a", "is_correct": false}
  ]'::jsonb
);

-- Insert a quiz attempt for the React quiz
INSERT INTO quiz_attempts (
  quiz_id,
  user_id,
  started_at,
  completed_at,
  score,
  max_score,
  answers
)
VALUES (
  (SELECT id FROM quizzes WHERE title = 'React Hooks' AND user_id = sample_user_id),
  sample_user_id,
  NOW() - interval '1 day',
  NOW() - interval '1 day' + interval '15 minutes',
  4,
  4,
  '[
    {"question_id": "q1", "selected_option_id": "b", "is_correct": true},
    {"question_id": "q2", "selected_option_id": "a", "is_correct": true},
    {"question_id": "q3", "selected_option_id": "c", "is_correct": true},
    {"question_id": "q4", "selected_option_id": "d", "is_correct": true}
  ]'::jsonb
);

-- Insert activities
INSERT INTO activities (user_id, activity_type, quiz_id, quiz_title, created_at)
VALUES
  (sample_user_id, 'quiz_created', 
   (SELECT id FROM quizzes WHERE title = 'JavaScript Fundamentals' AND user_id = sample_user_id),
   'JavaScript Fundamentals',
   NOW() - interval '3 days'),
  (sample_user_id, 'quiz_created',
   (SELECT id FROM quizzes WHERE title = 'React Hooks' AND user_id = sample_user_id),
   'React Hooks',
   NOW() - interval '2 days'),
  (sample_user_id, 'quiz_created',
   (SELECT id FROM quizzes WHERE title = 'CSS Grid & Flexbox' AND user_id = sample_user_id),
   'CSS Grid & Flexbox',
   NOW() - interval '1 day');

-- Add quiz completion activities
INSERT INTO activities (user_id, activity_type, quiz_id, quiz_title, score, created_at)
VALUES
  (sample_user_id, 'quiz_completed', 
   (SELECT id FROM quizzes WHERE title = 'JavaScript Fundamentals' AND user_id = sample_user_id),
   'JavaScript Fundamentals',
   67, -- 2/3 = ~67%
   NOW() - interval '2 days' + interval '10 minutes'),
  (sample_user_id, 'quiz_completed',
   (SELECT id FROM quizzes WHERE title = 'React Hooks' AND user_id = sample_user_id),
   'React Hooks',
   100, -- 4/4 = 100%
   NOW() - interval '1 day' + interval '15 minutes');

-- Add today's login activity to trigger streak
INSERT INTO activities (user_id, activity_type, quiz_id, quiz_title, created_at)
VALUES
  (sample_user_id, 'login', NULL, NULL, NOW());

END $$;