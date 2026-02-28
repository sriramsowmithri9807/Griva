"use server";

import { createClient } from "@/lib/supabase/server";
import { computeHotScore } from "./vote-actions";
import { getCommunityRole } from "./community-actions";

const POST_SELECT = `
  *,
  profiles:author_id(id, username, full_name, avatar_url),
  communities:community_id(id, name, slug, avatar_url),
  comments(count),
  post_votes(vote_type)
`;

export async function createPost(
    communityId: string,
    title: string,
    content: string,
    postType: "text" | "link" | "image" | "discussion" = "text",
    linkUrl?: string,
    imageUrl?: string,
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
        .from("posts")
        .insert({
            community_id: communityId,
            title,
            content,
            author_id: user.id,
            post_type: postType,
            link_url: linkUrl ?? null,
            image_url: imageUrl ?? null,
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function getPosts(communityId?: string) {
    const supabase = await createClient();

    let query = supabase
        .from("posts")
        .select(POST_SELECT)
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(50);

    if (communityId) {
        query = query.eq("community_id", communityId);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return enrichPosts(data ?? []);
}

export async function getPost(postId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("posts")
        .select(POST_SELECT)
        .eq("id", postId)
        .single();

    if (error) return null;
    return enrichPosts([data])[0];
}

export async function deletePost(postId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Post author OR community admin/mod can delete
    const post = await getPost(postId);
    if (!post) throw new Error("Post not found");

    const isAuthor = (post as Record<string, unknown>).author_id === user.id;
    if (!isAuthor) {
        const role = await getCommunityRole((post as Record<string, unknown>).community_id as string);
        if (role !== "admin" && role !== "moderator") throw new Error("Not authorized");
    }

    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) throw new Error(error.message);
}

export async function lockPost(postId: string, locked: boolean) {
    const supabase = await createClient();
    const post = await getPost(postId);
    if (!post) throw new Error("Post not found");

    const role = await getCommunityRole((post as Record<string, unknown>).community_id as string);
    if (role !== "admin" && role !== "moderator") throw new Error("Not authorized");

    await supabase.from("posts").update({ is_locked: locked }).eq("id", postId);
}

export async function approvePost(postId: string, approved: boolean) {
    const supabase = await createClient();
    const post = await getPost(postId);
    if (!post) throw new Error("Post not found");

    const role = await getCommunityRole((post as Record<string, unknown>).community_id as string);
    if (role !== "admin" && role !== "moderator") throw new Error("Not authorized");

    await supabase.from("posts").update({ is_approved: approved }).eq("id", postId);
}

// Home feed — posts from joined communities, hot-ranked
export async function getFeedPosts() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: memberships } = await supabase
        .from("community_members")
        .select("community_id")
        .eq("user_id", user.id);

    if (!memberships || memberships.length === 0) return [];

    const communityIds = memberships.map((m: { community_id: string }) => m.community_id);

    const { data, error } = await supabase
        .from("posts")
        .select(POST_SELECT)
        .in("community_id", communityIds)
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(100);

    if (error) return [];
    return hotRank(enrichPosts(data ?? []));
}

// Trending feed — all posts across platform, hot-ranked
export async function getTrendingPosts(limit = 50) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("posts")
        .select(POST_SELECT)
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(200);

    if (error) return [];
    return hotRank(enrichPosts(data ?? [])).slice(0, limit);
}

// ─── Helpers ────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function enrichPosts(posts: any[]) {
    return posts.map((p) => {
        const votes = (p.post_votes ?? []) as { vote_type: number }[];
        const upvotes = votes.filter((v) => v.vote_type === 1).length;
        const downvotes = votes.filter((v) => v.vote_type === -1).length;
        return {
            ...p,
            upvotes,
            downvotes,
            net_votes: upvotes - downvotes,
            hot_score: computeHotScore(upvotes, downvotes, p.created_at),
        };
    });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function hotRank(posts: any[]) {
    return [...posts].sort((a, b) => b.hot_score - a.hot_score);
}
