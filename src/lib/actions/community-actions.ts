"use server";

import { createClient } from "@/lib/supabase/server";

export async function createCommunity(name: string, description: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const { data: community, error } = await supabase
        .from("communities")
        .insert({ name, slug, description, creator_id: user.id })
        .select()
        .single();

    if (error) throw new Error(error.message);

    // Auto-join creator as admin
    await supabase
        .from("community_members")
        .insert({ community_id: community.id, user_id: user.id, role: "admin" });

    return community;
}

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

export async function joinCommunity(communityId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

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
