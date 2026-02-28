-- ============================================================
-- GRIVA Terminology Migration — Reddit → Griva-Native
-- Run in Supabase Dashboard → SQL Editor → New Query
-- Deploy updated code immediately after running this.
-- ============================================================

-- 1. Rename interaction column in post_votes
--    vote_type (1=up, -1=down) → interaction_type (1=Insight, -1=Challenge)
ALTER TABLE post_votes RENAME COLUMN vote_type TO interaction_type;

-- 2. Rename cached count columns on posts
ALTER TABLE posts RENAME COLUMN upvotes   TO insights;
ALTER TABLE posts RENAME COLUMN downvotes TO challenges;

-- 3. Rename comments table → responses
ALTER TABLE comments RENAME TO responses;

-- 4. Update community role values: moderator → curator
UPDATE community_members SET role = 'curator' WHERE role = 'moderator';

-- 5. Update notification type values
UPDATE notifications SET type = 'insight'       WHERE type = 'vote';
UPDATE notifications SET type = 'response'      WHERE type = 'reply';
UPDATE notifications SET type = 'sphere_update' WHERE type = 'community_update';

-- 6. Add credibility column to profiles (Karma → Credibility)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS credibility INTEGER DEFAULT 0;

-- 7. Enable realtime for renamed responses table
ALTER TABLE responses REPLICA IDENTITY FULL;

-- 8. Rename FK column in responses: parent_comment_id → parent_response_id
ALTER TABLE responses RENAME COLUMN parent_comment_id TO parent_response_id;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'responses'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE responses;
  END IF;
END $$;

-- ============================================================
-- Rollback (run if you need to revert):
-- ============================================================
-- ALTER TABLE responses RENAME TO comments;
-- ALTER TABLE responses RENAME COLUMN parent_response_id TO parent_comment_id;
-- ALTER TABLE post_votes RENAME COLUMN interaction_type TO vote_type;
-- ALTER TABLE posts RENAME COLUMN insights   TO upvotes;
-- ALTER TABLE posts RENAME COLUMN challenges TO downvotes;
-- UPDATE community_members SET role = 'moderator' WHERE role = 'curator';
-- UPDATE notifications SET type = 'vote'             WHERE type = 'insight';
-- UPDATE notifications SET type = 'reply'            WHERE type = 'response';
-- UPDATE notifications SET type = 'community_update' WHERE type = 'sphere_update';
