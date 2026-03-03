-- ============================================================
-- GRIVA — Roadmaps v2 Migration
-- Adds problem-solving platform to learning roadmaps
--
-- Run in: Supabase → SQL Editor → New Query
-- ============================================================

-- Step 1: Extend roadmap_topics with metadata
ALTER TABLE roadmap_topics ADD COLUMN IF NOT EXISTS difficulty       TEXT    DEFAULT 'beginner';
ALTER TABLE roadmap_topics ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER DEFAULT 15;

-- Step 2: Problems library
CREATE TABLE IF NOT EXISTS roadmap_problems (
    id              UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id        UUID    REFERENCES roadmap_topics(id) ON DELETE CASCADE NOT NULL,
    title           TEXT    NOT NULL,
    description     TEXT    NOT NULL,
    type            TEXT    NOT NULL DEFAULT 'mcq'
                            CHECK (type IN ('mcq', 'coding', 'short_answer')),
    difficulty      TEXT    NOT NULL DEFAULT 'beginner'
                            CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    starter_code    TEXT,
    solution        TEXT,
    options         JSONB,           -- MCQ: ["option A", "option B", ...]
    correct_option  INTEGER,         -- MCQ: 0-based index of correct answer
    hints           TEXT[],
    order_index     INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: User problem submissions
CREATE TABLE IF NOT EXISTS problem_submissions (
    id              UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID    REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    problem_id      UUID    REFERENCES roadmap_problems(id) ON DELETE CASCADE NOT NULL,
    code            TEXT,
    answer          TEXT,
    selected_option INTEGER,
    status          TEXT    NOT NULL DEFAULT 'submitted'
                            CHECK (status IN ('submitted', 'correct', 'incorrect')),
    submitted_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Enable RLS
ALTER TABLE roadmap_problems    ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_submissions ENABLE ROW LEVEL SECURITY;

-- Step 5: RLS Policies (wrapped to be idempotent)
DO $$ BEGIN
    CREATE POLICY "Public read problems"
        ON roadmap_problems FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Anon insert problems"
        ON roadmap_problems FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Anon delete problems"
        ON roadmap_problems FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Users manage submissions"
        ON problem_submissions FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
