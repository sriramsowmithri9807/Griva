"use server";

import { createClient } from "@/lib/supabase/server";
import { INSIGHT, CHALLENGE } from "@/lib/constants";

export async function interactPost(postId: string, interactionType: 1 | -1) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data: existing } = await supabase
        .from("post_votes")
        .select("id, interaction_type")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .single();

    if (existing) {
        if (existing.interaction_type === interactionType) {
            // Same interaction → toggle off
            await supabase.from("post_votes").delete().eq("id", existing.id);
            return null;
        } else {
            // Different interaction → update
            await supabase
                .from("post_votes")
                .update({ interaction_type: interactionType })
                .eq("id", existing.id);
            return interactionType;
        }
    } else {
        await supabase
            .from("post_votes")
            .insert({ post_id: postId, user_id: user.id, interaction_type: interactionType });
        return interactionType;
    }
}

export async function getInteractionStatus(postIds: string[]): Promise<Record<string, 1 | -1 | 0>> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const result: Record<string, 1 | -1 | 0> = {};
    if (!user || postIds.length === 0) return result;

    const { data } = await supabase
        .from("post_votes")
        .select("post_id, interaction_type")
        .eq("user_id", user.id)
        .in("post_id", postIds);

    for (const postId of postIds) result[postId] = 0;
    for (const row of data ?? []) {
        result[row.post_id] = row.interaction_type as 1 | -1;
    }
    return result;
}

export async function getPostInteractionCounts(postId: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from("post_votes")
        .select("interaction_type")
        .eq("post_id", postId);

    const insights   = data?.filter((r) => r.interaction_type === INSIGHT).length ?? 0;
    const challenges = data?.filter((r) => r.interaction_type === CHALLENGE).length ?? 0;
    return { insights, challenges, net: insights - challenges };
}

export async function reportPost(postId: string, reason: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
        .from("post_reports")
        .insert({ post_id: postId, reported_by: user.id, reason });

    if (error) throw new Error(error.message);
}
