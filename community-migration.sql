-- ============================================================
-- GRIVA Community System v2 — Migration
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Extend communities table
ALTER TABLE communities
  ADD COLUMN IF NOT EXISTS avatar_url     TEXT,
  ADD COLUMN IF NOT EXISTS banner_url     TEXT,
  ADD COLUMN IF NOT EXISTS category       TEXT DEFAULT 'General',
  ADD COLUMN IF NOT EXISTS rules          TEXT,
  ADD COLUMN IF NOT EXISTS tags           TEXT[],
  ADD COLUMN IF NOT EXISTS visibility     TEXT DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS updated_at     TIMESTAMPTZ DEFAULT NOW();

-- 2. Extend posts table
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS post_type      TEXT DEFAULT 'text',  -- text | link | image | discussion
  ADD COLUMN IF NOT EXISTS link_url       TEXT,
  ADD COLUMN IF NOT EXISTS image_url      TEXT,
  ADD COLUMN IF NOT EXISTS is_locked      BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_approved    BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS upvotes        INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS downvotes      INTEGER DEFAULT 0;

-- 3. Votes table (upvote / downvote on posts)
CREATE TABLE IF NOT EXISTS post_votes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id     UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  vote_type   SMALLINT NOT NULL CHECK (vote_type IN (1, -1)),  -- 1=up, -1=down
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- 4. Community bans
CREATE TABLE IF NOT EXISTS community_bans (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE NOT NULL,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  banned_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason       TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);

-- 5. Post reports
CREATE TABLE IF NOT EXISTS post_reports (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id      UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  reported_by  UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reason       TEXT NOT NULL,
  resolved     BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type         TEXT NOT NULL,   -- reply | vote | mention | community_update
  title        TEXT NOT NULL,
  body         TEXT,
  link         TEXT,
  read         BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RLS for new tables
-- ============================================================
ALTER TABLE post_votes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_bans   ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reports     ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications    ENABLE ROW LEVEL SECURITY;

-- post_votes: public read, auth users manage their own
CREATE POLICY "Public read votes"       ON post_votes       FOR SELECT USING (true);
CREATE POLICY "Users manage own votes"  ON post_votes       FOR ALL    USING (auth.uid() = user_id);

-- community_bans: admin/mod readable
CREATE POLICY "Public read bans"        ON community_bans   FOR SELECT USING (true);
CREATE POLICY "Auth insert bans"        ON community_bans   FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth delete bans"        ON community_bans   FOR DELETE USING (auth.uid() = banned_by);

-- post_reports: authenticated users create, own read
CREATE POLICY "Auth insert reports"     ON post_reports     FOR INSERT WITH CHECK (auth.uid() = reported_by);
CREATE POLICY "Auth read own reports"   ON post_reports     FOR SELECT USING (auth.uid() = reported_by);

-- notifications: users own theirs
CREATE POLICY "Users own notifications" ON notifications    FOR ALL    USING (auth.uid() = user_id);

-- Allow moderators to update posts (lock/approve) — broad policy
CREATE POLICY "Auth update posts"       ON posts            FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow admins to update communities
CREATE POLICY "Auth update communities" ON communities      FOR UPDATE USING (auth.role() = 'authenticated');

-- ============================================================
-- Realtime — Enable for new tables
-- ============================================================
ALTER TABLE post_votes    REPLICA IDENTITY FULL;
ALTER TABLE notifications REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'post_votes') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE post_votes;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'notifications') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'comments') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE comments;
  END IF;
END $$;

-- ============================================================
-- Storage bucket for community images
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('community-images', 'community-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read community images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'community-images');

CREATE POLICY "Auth upload community images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'community-images' AND auth.role() = 'authenticated');

CREATE POLICY "Auth delete community images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'community-images' AND auth.role() = 'authenticated');
