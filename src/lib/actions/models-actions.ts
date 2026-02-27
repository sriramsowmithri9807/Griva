"use server";

import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 50;

export async function getModels(
    modelType?: string,
    search?: string,
    page = 1,
    limit = PAGE_SIZE
): Promise<{ data: unknown[]; total: number; hasMore: boolean }> {
    const supabase = await createClient();
    const offset = (page - 1) * limit;

    let query = supabase
        .from("ai_models")
        .select("*", { count: "exact" })
        .order("name")
        .range(offset, offset + limit - 1);

    if (modelType && modelType !== "all") query = query.eq("model_type", modelType);
    if (search) query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,provider.ilike.%${search}%`);

    const { data, error, count } = await query;
    if (error) return { data: [], total: 0, hasMore: false };
    const total = count ?? 0;
    return { data: data ?? [], total, hasMore: offset + limit < total };
}

export async function bookmarkModel(modelId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
        .from("model_bookmarks")
        .insert({ user_id: user.id, model_id: modelId });

    if (error && error.code !== "23505") throw new Error(error.message);
}

export async function unbookmarkModel(modelId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    await supabase
        .from("model_bookmarks")
        .delete()
        .eq("user_id", user.id)
        .eq("model_id", modelId);
}

export async function getBookmarkedModelIds() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
        .from("model_bookmarks")
        .select("model_id")
        .eq("user_id", user.id);

    return data?.map((d: { model_id: string }) => d.model_id) || [];
}

export async function getModelTypes() {
    const supabase = await createClient();
    const { data } = await supabase
        .from("ai_models")
        .select("model_type")
        .order("model_type");

    if (!data) return [];
    return [...new Set(data.map((d: { model_type: string }) => d.model_type))];
}
