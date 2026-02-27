"use server";

import { createClient } from "@/lib/supabase/server";

export async function toggleLike(postId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Check if already liked
    const { data: existing } = await supabase
        .from("likes")
        .select("id")
        .eq("user_id", user.id)
        .eq("post_id", postId)
        .single();

    if (existing) {
        await supabase.from("likes").delete().eq("id", existing.id);
        return { liked: false };
    } else {
        await supabase.from("likes").insert({ user_id: user.id, post_id: postId });
        return { liked: true };
    }
}

export async function hasUserLiked(postId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
        .from("likes")
        .select("id")
        .eq("user_id", user.id)
        .eq("post_id", postId)
        .single();

    return !!data;
}

export async function getLikeStatus(postIds: string[]) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {};

    const { data } = await supabase
        .from("likes")
        .select("post_id")
        .eq("user_id", user.id)
        .in("post_id", postIds);

    const map: Record<string, boolean> = {};
    if (data) {
        for (const like of data) {
            map[like.post_id] = true;
        }
    }
    return map;
}
