"use server";

import { createClient } from "@/lib/supabase/server";

export async function createResponse(postId: string, content: string, parentResponseId?: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
        .from("responses")
        .insert({
            post_id: postId,
            author_id: user.id,
            content,
            parent_response_id: parentResponseId || null,
        })
        .select(`*, profiles:author_id(id, username, full_name, avatar_url)`)
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function getResponses(postId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("responses")
        .select(`*, profiles:author_id(id, username, full_name, avatar_url)`)
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

    if (error) return [];

    // Build threaded structure
    const responseMap = new Map<string, typeof data[0] & { replies: typeof data }>();
    const rootResponses: (typeof data[0] & { replies: typeof data })[] = [];

    for (const response of data) {
        responseMap.set(response.id, { ...response, replies: [] });
    }

    for (const response of data) {
        const node = responseMap.get(response.id)!;
        if (response.parent_response_id && responseMap.has(response.parent_response_id)) {
            responseMap.get(response.parent_response_id)!.replies.push(node);
        } else {
            rootResponses.push(node);
        }
    }

    return rootResponses;
}

export async function deleteResponse(responseId: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("responses").delete().eq("id", responseId);
    if (error) throw new Error(error.message);
}
