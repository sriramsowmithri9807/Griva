"use server";

import { createClient } from "@/lib/supabase/server";

export async function createComment(postId: string, content: string, parentCommentId?: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
        .from("comments")
        .insert({
            post_id: postId,
            author_id: user.id,
            content,
            parent_comment_id: parentCommentId || null,
        })
        .select(`*, profiles:author_id(id, username, full_name, avatar_url)`)
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function getComments(postId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("comments")
        .select(`*, profiles:author_id(id, username, full_name, avatar_url)`)
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

    if (error) return [];

    // Build threaded structure
    const commentMap = new Map<string, typeof data[0] & { replies: typeof data }>();
    const rootComments: (typeof data[0] & { replies: typeof data })[] = [];

    for (const comment of data) {
        commentMap.set(comment.id, { ...comment, replies: [] });
    }

    for (const comment of data) {
        const node = commentMap.get(comment.id)!;
        if (comment.parent_comment_id && commentMap.has(comment.parent_comment_id)) {
            commentMap.get(comment.parent_comment_id)!.replies.push(node);
        } else {
            rootComments.push(node);
        }
    }

    return rootComments;
}

export async function deleteComment(commentId: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("comments").delete().eq("id", commentId);
    if (error) throw new Error(error.message);
}
