"use server";

import { createClient } from "@/lib/supabase/server";

export async function createPost(communityId: string, title: string, content: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
        .from("posts")
        .insert({ community_id: communityId, title, content, author_id: user.id })
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function getPosts(communityId?: string) {
    const supabase = await createClient();

    let query = supabase
        .from("posts")
        .select(`
      *,
      profiles:author_id(id, username, full_name, avatar_url),
      communities:community_id(name, slug),
      comments(count),
      likes(count)
    `)
        .order("created_at", { ascending: false })
        .limit(50);

    if (communityId) {
        query = query.eq("community_id", communityId);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
}

export async function getPost(postId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("posts")
        .select(`
      *,
      profiles:author_id(id, username, full_name, avatar_url),
      communities:community_id(name, slug),
      comments(count),
      likes(count)
    `)
        .eq("id", postId)
        .single();

    if (error) return null;
    return data;
}

export async function deletePost(postId: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) throw new Error(error.message);
}

export async function getFeedPosts() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Get user's community IDs
    const { data: memberships } = await supabase
        .from("community_members")
        .select("community_id")
        .eq("user_id", user.id);

    if (!memberships || memberships.length === 0) return [];

    const communityIds = memberships.map((m: { community_id: string }) => m.community_id);

    const { data, error } = await supabase
        .from("posts")
        .select(`
      *,
      profiles:author_id(id, username, full_name, avatar_url),
      communities:community_id(name, slug),
      comments(count),
      likes(count)
    `)
        .in("community_id", communityIds)
        .order("created_at", { ascending: false })
        .limit(50);

    if (error) return [];
    return data;
}
