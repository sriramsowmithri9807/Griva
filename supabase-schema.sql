-- ============================================================
-- GRIVA — Complete Supabase Schema
-- Run this in your Supabase project → SQL Editor → New Query
-- ============================================================

-- UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USER PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
    id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username          TEXT UNIQUE,
    full_name         TEXT,
    bio               TEXT,
    avatar_url        TEXT,
    cover_image_url   TEXT,
    github_url        TEXT,
    linkedin_url      TEXT,
    twitter_url       TEXT,
    website_url       TEXT,
    location          TEXT,
    last_active       TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW(),
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COMMUNITIES
-- ============================================================
CREATE TABLE IF NOT EXISTS communities (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT NOT NULL,
    slug        TEXT UNIQUE NOT NULL,
    description TEXT,
    creator_id  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_members (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE NOT NULL,
    user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role         TEXT DEFAULT 'member',
    joined_at    TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(community_id, user_id)
);

-- ============================================================
-- POSTS, COMMENTS, LIKES
-- ============================================================
CREATE TABLE IF NOT EXISTS posts (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE NOT NULL,
    title        TEXT NOT NULL,
    content      TEXT,
    author_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comments (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id           UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
    author_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content           TEXT NOT NULL,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS likes (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    post_id    UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

-- ============================================================
-- LEARNING ROADMAPS
-- ============================================================
CREATE TABLE IF NOT EXISTS roadmaps (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title       TEXT NOT NULL,
    description TEXT,
    category    TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roadmap_sections (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    roadmap_id  UUID REFERENCES roadmaps(id) ON DELETE CASCADE NOT NULL,
    title       TEXT NOT NULL,
    order_index INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS roadmap_topics (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id    UUID REFERENCES roadmap_sections(id) ON DELETE CASCADE NOT NULL,
    title         TEXT NOT NULL,
    resource_link TEXT,
    order_index   INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_roadmaps (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    roadmap_id  UUID REFERENCES roadmaps(id) ON DELETE CASCADE NOT NULL,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, roadmap_id)
);

CREATE TABLE IF NOT EXISTS user_progress (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    topic_id     UUID REFERENCES roadmap_topics(id) ON DELETE CASCADE NOT NULL,
    completed    BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    UNIQUE(user_id, topic_id)
);

-- ============================================================
-- NEWS, RESEARCH PAPERS, AI MODELS  (auto-ingested every 5 min)
-- ============================================================
CREATE TABLE IF NOT EXISTS news_articles (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title        TEXT NOT NULL,
    summary      TEXT,
    source       TEXT,
    url          TEXT UNIQUE NOT NULL,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    category     TEXT,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS research_papers (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title          TEXT NOT NULL,
    authors        TEXT,
    abstract       TEXT,
    category       TEXT,
    pdf_url        TEXT,
    arxiv_id       TEXT UNIQUE,
    published_date TIMESTAMPTZ DEFAULT NOW(),
    created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_models (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name          TEXT NOT NULL,
    description   TEXT,
    provider      TEXT,
    model_type    TEXT,
    download_link TEXT,
    tags          TEXT[],
    hf_id         TEXT UNIQUE,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS model_bookmarks (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    model_id   UUID REFERENCES ai_models(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, model_id)
);

CREATE TABLE IF NOT EXISTS saved_papers (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    paper_id   UUID REFERENCES research_papers(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, paper_id)
);

-- ============================================================
-- AI ASSISTANT CHAT
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID,
    user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role            TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content         TEXT NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PLATFORM METRICS  (updated by runMetricsWorker every 5 min)
-- ============================================================
CREATE TABLE IF NOT EXISTS platform_metrics (
    id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    active_users       INTEGER DEFAULT 0,
    daily_contributors INTEGER DEFAULT 0,
    total_documents    INTEGER DEFAULT 0,
    query_count        INTEGER DEFAULT 0,
    total_posts        INTEGER DEFAULT 0,
    total_papers       INTEGER DEFAULT 0,
    total_models       INTEGER DEFAULT 0,
    total_news         INTEGER DEFAULT 0,
    updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities         ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members   ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts                ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments            ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes               ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmaps            ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_sections    ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_topics      ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roadmaps       ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress       ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_papers     ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_models           ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_bookmarks     ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_papers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages       ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_metrics    ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES — Public read for content
-- ============================================================
CREATE POLICY "Public read news"        ON news_articles    FOR SELECT USING (true);
CREATE POLICY "Public read papers"      ON research_papers  FOR SELECT USING (true);
CREATE POLICY "Public read models"      ON ai_models        FOR SELECT USING (true);
CREATE POLICY "Public read communities" ON communities      FOR SELECT USING (true);
CREATE POLICY "Public read posts"       ON posts            FOR SELECT USING (true);
CREATE POLICY "Public read comments"    ON comments         FOR SELECT USING (true);
CREATE POLICY "Public read roadmaps"    ON roadmaps         FOR SELECT USING (true);
CREATE POLICY "Public read sections"    ON roadmap_sections FOR SELECT USING (true);
CREATE POLICY "Public read topics"      ON roadmap_topics   FOR SELECT USING (true);
CREATE POLICY "Public read metrics"     ON platform_metrics FOR SELECT USING (true);
CREATE POLICY "Public read profiles"    ON profiles         FOR SELECT USING (true);

-- Background workers (anon key) write access for ingested content
CREATE POLICY "Anon insert news"        ON news_articles    FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon insert papers"      ON research_papers  FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon insert models"      ON ai_models        FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon update models"      ON ai_models        FOR UPDATE USING (true);
CREATE POLICY "Anon insert metrics"     ON platform_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon update metrics"     ON platform_metrics FOR UPDATE USING (true);

-- ============================================================
-- RLS POLICIES — Authenticated users
-- ============================================================
CREATE POLICY "Users own profile"       ON profiles         FOR ALL    USING (auth.uid() = id);
CREATE POLICY "Users create community"  ON communities      FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users join community"    ON community_members FOR ALL   USING (auth.uid() = user_id);
CREATE POLICY "Users create post"       ON posts            FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users delete own post"   ON posts            FOR DELETE USING (auth.uid() = author_id);
CREATE POLICY "Users create comment"    ON comments         FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users delete own comment" ON comments        FOR DELETE USING (auth.uid() = author_id);
CREATE POLICY "Users manage likes"      ON likes            FOR ALL    USING (auth.uid() = user_id);
CREATE POLICY "Users manage enrollments" ON user_roadmaps   FOR ALL    USING (auth.uid() = user_id);
CREATE POLICY "Users manage progress"   ON user_progress    FOR ALL    USING (auth.uid() = user_id);
CREATE POLICY "Users manage bookmarks"  ON model_bookmarks  FOR ALL    USING (auth.uid() = user_id);
CREATE POLICY "Users manage saved"      ON saved_papers     FOR ALL    USING (auth.uid() = user_id);
CREATE POLICY "Users manage chat"       ON chat_messages    FOR ALL    USING (auth.uid() = user_id);

-- ============================================================
-- TRIGGER — Auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, username, full_name)
    VALUES (
        NEW.id,
        SPLIT_PART(NEW.email, '@', 1),
        COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1))
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- REALTIME — Enable for live-update tables
-- ============================================================
ALTER TABLE news_articles    REPLICA IDENTITY FULL;
ALTER TABLE research_papers  REPLICA IDENTITY FULL;
ALTER TABLE ai_models        REPLICA IDENTITY FULL;
ALTER TABLE posts             REPLICA IDENTITY FULL;

-- Guard against "already a member" errors
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'news_articles') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE news_articles;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'research_papers') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE research_papers;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'ai_models') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE ai_models;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'posts') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE posts;
    END IF;
END $$;

-- ============================================================
-- STORAGE BUCKETS  (run separately if SQL doesn't work —
-- alternatively create via Supabase Dashboard → Storage)
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('covers', 'covers', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read avatars"  ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Auth upload avatars"  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Auth delete avatars"  ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public read covers"   ON storage.objects FOR SELECT USING (bucket_id = 'covers');
CREATE POLICY "Auth upload covers"   ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'covers' AND auth.role() = 'authenticated');
CREATE POLICY "Auth delete covers"   ON storage.objects FOR DELETE USING (bucket_id = 'covers' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- COMMUNITY SYSTEM v2 — Run community-migration.sql separately
-- (community-migration.sql contains all v2 additions)
-- ============================================================

