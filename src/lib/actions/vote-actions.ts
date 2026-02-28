"use server";

// Backward-compatible wrappers over interaction-actions.ts
// These re-export the Griva-native functions under legacy names
// so existing imports continue to work during the transition.

import { interactPost, getInteractionStatus, getPostInteractionCounts, reportPost } from "./interaction-actions";

/** @deprecated Use interactPost from interaction-actions.ts */
export async function votePost(postId: string, voteType: 1 | -1) {
    return interactPost(postId, voteType);
}

/** @deprecated Use getInteractionStatus from interaction-actions.ts */
export async function getVoteStatus(postIds: string[]): Promise<Record<string, 1 | -1 | 0>> {
    return getInteractionStatus(postIds);
}

/** @deprecated Use getPostInteractionCounts from interaction-actions.ts */
export async function getPostVoteCounts(postId: string) {
    return getPostInteractionCounts(postId);
}

// Re-export reportPost unchanged
export { reportPost };
