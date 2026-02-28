// Griva-native interaction constants
// interaction_type column in post_votes: 1 = Insight, -1 = Challenge

export const INSIGHT   = 1  as const;
export const CHALLENGE = -1 as const;
export type Interaction = typeof INSIGHT | typeof CHALLENGE | 0;

export const ROLE_ADMIN   = "admin"   as const;
export const ROLE_CURATOR = "curator" as const;  // formerly "moderator"
export const ROLE_MEMBER  = "member"  as const;
export type CommunityRole = typeof ROLE_ADMIN | typeof ROLE_CURATOR | typeof ROLE_MEMBER;
