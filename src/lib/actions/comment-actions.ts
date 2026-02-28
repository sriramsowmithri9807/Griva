"use server";

// Backward-compatible wrappers over response-actions.ts
// These re-export the Griva-native functions under legacy names
// so existing imports continue to work during the transition.

import { createResponse, getResponses, deleteResponse } from "./response-actions";

/** @deprecated Use createResponse from response-actions.ts */
export async function createComment(postId: string, content: string, parentCommentId?: string) {
    return createResponse(postId, content, parentCommentId);
}

/** @deprecated Use getResponses from response-actions.ts */
export async function getComments(postId: string) {
    return getResponses(postId);
}

/** @deprecated Use deleteResponse from response-actions.ts */
export async function deleteComment(commentId: string) {
    return deleteResponse(commentId);
}
