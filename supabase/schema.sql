-- Supabase SQL schema for Quizzy app

-- Create tables for quizzes
CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID,
    questions_count INTEGER NOT NULL DEFAULT 0,
    topic TEXT,
    source_type TEXT NOT NULL DEFAULT 'text',
    source_name TEXT
);

-- Create table for questions
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_option_id TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0
);

-- Create table for quiz attempts
CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    user_id UUID,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    score INTEGER,
    max_score INTEGER NOT NULL,
    answers JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- Create table for user activities
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    activity_type TEXT NOT NULL,
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    quiz_title TEXT,
    score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX quizzes_user_id_idx ON quizzes(user_id);
CREATE INDEX quiz_attempts_user_id_idx ON quiz_attempts(user_id);
CREATE INDEX activities_user_id_idx ON activities(user_id);
CREATE INDEX questions_quiz_id_idx ON questions(quiz_id);

-- Create function for updating the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating the updated_at column
CREATE TRIGGER update_quizzes_updated_at
BEFORE UPDATE ON quizzes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create RLS (Row Level Security) policies
-- Enable RLS on all tables
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create policies to allow users to only see their own data or public data (NULL user_id)
-- Quizzes policies
CREATE POLICY "Users can view their own quizzes or public quizzes"
ON quizzes FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own quizzes or anonymous quizzes"
ON quizzes FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Questions policies (questions are public so quizzes can be shared)
CREATE POLICY "Anyone can view questions"
ON questions FOR SELECT
USING (true);

-- Quiz attempts policies
CREATE POLICY "Users can view their own quiz attempts or anonymous attempts"
ON quiz_attempts FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own quiz attempts or anonymous attempts"
ON quiz_attempts FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Activities policies
CREATE POLICY "Users can view their own activities or public activities"
ON activities FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own activities or public activities"
ON activities FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Create table for tracking trending topic usage
CREATE TABLE trending_topic_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic TEXT NOT NULL,
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for trending topics
CREATE INDEX idx_trending_topic_usage_topic ON trending_topic_usage(topic);
CREATE INDEX idx_trending_topic_usage_used_at ON trending_topic_usage(used_at);