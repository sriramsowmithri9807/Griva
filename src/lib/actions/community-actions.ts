"use server";

import { createClient } from "@/lib/supabase/server";

// ─── CREATE ────────────────────────────────────────────────
export async function createCommunity(
    name: string,
    description: string,
    category: string = "General",
    rules: string = "",
    tags: string[] = [],
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    // Try full insert with extended fields (requires migration to have been run)
    let { data: community, error } = await supabase
        .from("communities")
        .insert({ name, slug, description, creator_id: user.id, category, rules, tags })
        .select()
        .single();

    // If new columns don't exist yet (migration not run), fall back to base schema
    if (error && (error.message.includes("column") || error.message.includes("does not exist"))) {
        const result = await supabase
            .from("communities")
            .insert({ name, slug, description, creator_id: user.id })
            .select()
            .single();
        community = result.data;
        error = result.error;
    }

    if (error) throw new Error(error.message);

    await supabase
        .from("community_members")
        .insert({ community_id: community!.id, user_id: user.id, role: "admin" });

    return community!;
}

// ─── UPDATE (admin only) ────────────────────────────────────
export async function updateCommunity(
    communityId: string,
    updates: {
        description?: string;
        category?: string;
        rules?: string;
        tags?: string[];
        visibility?: string;
        avatar_url?: string;
        banner_url?: string;
    }
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const role = await getCommunityRole(communityId);
    if (role !== "admin" && role !== "moderator") throw new Error("Not authorized");

    const { data, error } = await supabase
        .from("communities")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", communityId)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

// ─── READ ──────────────────────────────────────────────────
export async function getCommunities() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("communities")
        .select("*, community_members(count)")
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data;
}

export async function getCommunity(slug: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("communities")
        .select("*, community_members(count)")
        .eq("slug", slug)
        .single();

    if (error) return null;
    return data;
}

export async function getTrendingCommunities(limit = 20) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("communities")
        .select("*, community_members(count)")
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) return [];

    return [...(data ?? [])].sort((a, b) => {
        const aCount = (a.community_members as { count: number }[])?.[0]?.count ?? 0;
        const bCount = (b.community_members as { count: number }[])?.[0]?.count ?? 0;
        return bCount - aCount;
    });
}

export async function getNewestCommunities(limit = 20) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("communities")
        .select("*, community_members(count)")
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) return [];
    return data ?? [];
}

export async function searchCommunities(query: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("communities")
        .select("*, community_members(count)")
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order("created_at", { ascending: false })
        .limit(30);

    if (error) return [];
    return data ?? [];
}

// ─── MEMBERSHIP ────────────────────────────────────────────
export async function joinCommunity(communityId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const banned = await isBanned(communityId, user.id);
    if (banned) throw new Error("You are banned from this community");

    const { error } = await supabase
        .from("community_members")
        .insert({ community_id: communityId, user_id: user.id, role: "member" });

    if (error) throw new Error(error.message);
}

export async function leaveCommunity(communityId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
        .from("community_members")
        .delete()
        .eq("community_id", communityId)
        .eq("user_id", user.id);

    if (error) throw new Error(error.message);
}

export async function getUserCommunities() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from("community_members")
        .select("community_id, communities(*)")
        .eq("user_id", user.id);

    if (error) return [];
    return data.map((m: { communities: unknown }) => m.communities);
}

export async function isMember(communityId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
        .from("community_members")
        .select("id")
        .eq("community_id", communityId)
        .eq("user_id", user.id)
        .single();

    return !!data;
}

export async function getCommunityRole(communityId: string): Promise<string | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
        .from("community_members")
        .select("role")
        .eq("community_id", communityId)
        .eq("user_id", user.id)
        .single();

    return data?.role ?? null;
}

export async function getCommunityMembers(communityId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("community_members")
        .select("*, profiles:user_id(id, username, full_name, avatar_url)")
        .eq("community_id", communityId)
        .order("joined_at", { ascending: false });

    if (error) return [];
    return data ?? [];
}

export async function promoteMember(communityId: string, userId: string, role: "moderator" | "member") {
    const supabase = await createClient();
    const myRole = await getCommunityRole(communityId);
    if (myRole !== "admin") throw new Error("Only admins can promote members");

    const { error } = await supabase
        .from("community_members")
        .update({ role })
        .eq("community_id", communityId)
        .eq("user_id", userId);

    if (error) throw new Error(error.message);
}

// ─── BANS ──────────────────────────────────────────────────
export async function banUser(communityId: string, userId: string, reason: string = "") {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const myRole = await getCommunityRole(communityId);
    if (myRole !== "admin" && myRole !== "moderator") throw new Error("Not authorized");

    await supabase
        .from("community_members")
        .delete()
        .eq("community_id", communityId)
        .eq("user_id", userId);

    const { error } = await supabase
        .from("community_bans")
        .insert({ community_id: communityId, user_id: userId, banned_by: user.id, reason });

    if (error) throw new Error(error.message);
}

export async function unbanUser(communityId: string, userId: string) {
    const supabase = await createClient();
    const myRole = await getCommunityRole(communityId);
    if (myRole !== "admin" && myRole !== "moderator") throw new Error("Not authorized");

    const { error } = await supabase
        .from("community_bans")
        .delete()
        .eq("community_id", communityId)
        .eq("user_id", userId);

    if (error) throw new Error(error.message);
}

export async function isBanned(communityId: string, userId?: string) {
    const supabase = await createClient();
    let uid = userId;
    if (!uid) {
        const { data: { user } } = await supabase.auth.getUser();
        uid = user?.id;
    }
    if (!uid) return false;

    const { data } = await supabase
        .from("community_bans")
        .select("id")
        .eq("community_id", communityId)
        .eq("user_id", uid)
        .single();

    return !!data;
}

// ─── IMAGE UPLOAD ──────────────────────────────────────────
export async function uploadCommunityImage(
    communityId: string,
    formData: FormData,
    type: "avatar" | "banner"
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const role = await getCommunityRole(communityId);
    if (role !== "admin") throw new Error("Only admins can upload images");

    const fileObj = formData.get("file") as File;
    if (!fileObj) throw new Error("No file provided");

    const ext = fileObj.name.split(".").pop();
    const path = `${communityId}/${type}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
        .from("community-images")
        .upload(path, fileObj, { upsert: true });

    if (uploadError) throw new Error(uploadError.message);

    const { data: urlData } = supabase.storage
        .from("community-images")
        .getPublicUrl(path);

    const column = type === "avatar" ? "avatar_url" : "banner_url";
    await supabase
        .from("communities")
        .update({ [column]: urlData.publicUrl })
        .eq("id", communityId);

    return urlData.publicUrl;
}

// ─── SHARE LINK ────────────────────────────────────────────
export async function getCommunityShareLink(slug: string) {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://griva.app";
    return `${base}/communities/${slug}`;
}
