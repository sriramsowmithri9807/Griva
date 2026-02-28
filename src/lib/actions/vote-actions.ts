"use server";

import { createClient } from "@/lib/supabase/server";

// Hot ranking score — simplified Reddit algorithm
// score = (upvotes - downvotes) * decay
// decay = 1 / (age_in_hours + 2) ^ 1.5
export function computeHotScore(upvotes: number, downvotes: number, createdAt: string): number {
    const net = upvotes - downvotes;
    const sign = net > 0 ? 1 : net < 0 ? -1 : 0;
    const order = Math.log10(Math.max(Math.abs(net), 1));
    const ageHours = (Date.now() - new Date(createdAt).getTime()) / 3_600_000;
    const decay = Math.pow(ageHours + 2, 1.5);
    return sign * order - ageHours / decay;
}

export async function votePost(postId: string, voteType: 1 | -1) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Upsert the vote
    const { data: existing } = await supabase
        .from("post_votes")
        .select("id, vote_type")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .single();

    if (existing) {
        if (existing.vote_type === voteType) {
            // Same vote → remove (toggle off)
            await supabase.from("post_votes").delete().eq("id", existing.id);
            return null; // removed
        } else {
            // Different vote → update
            await supabase
                .from("post_votes")
                .update({ vote_type: voteType })
                .eq("id", existing.id);
            return voteType;
        }
    } else {
        await supabase
            .from("post_votes")
            .insert({ post_id: postId, user_id: user.id, vote_type: voteType });
        return voteType;
    }
}

export async function getVoteStatus(postIds: string[]): Promise<Record<string, 1 | -1 | 0>> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const result: Record<string, 1 | -1 | 0> = {};
    if (!user || postIds.length === 0) return result;

    const { data } = await supabase
        .from("post_votes")
        .select("post_id, vote_type")
        .eq("user_id", user.id)
        .in("post_id", postIds);

    for (const postId of postIds) result[postId] = 0;
    for (const row of data ?? []) {
        result[row.post_id] = row.vote_type as 1 | -1;
    }
    return result;
}

export async function getPostVoteCounts(postId: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from("post_votes")
        .select("vote_type")
        .eq("post_id", postId);

    const upvotes = data?.filter((r) => r.vote_type === 1).length ?? 0;
    const downvotes = data?.filter((r) => r.vote_type === -1).length ?? 0;
    return { upvotes, downvotes, net: upvotes - downvotes };
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
