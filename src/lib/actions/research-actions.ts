"use server";

import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 50;

export async function getResearchPapers(
    category?: string,
    search?: string,
    page = 1,
    limit = PAGE_SIZE
): Promise<{ data: unknown[]; total: number; hasMore: boolean }> {
    const supabase = await createClient();
    const offset = (page - 1) * limit;

    let query = supabase
        .from("research_papers")
        .select("*", { count: "exact" })
        .order("published_date", { ascending: false })
        .range(offset, offset + limit - 1);

    if (category && category !== "all") query = query.eq("category", category);
    if (search) query = query.or(`title.ilike.%${search}%,abstract.ilike.%${search}%,authors.ilike.%${search}%`);

    const { data, error, count } = await query;
    if (error) return { data: [], total: 0, hasMore: false };
    const total = count ?? 0;
    return { data: data ?? [], total, hasMore: offset + limit < total };
}

export async function savePaper(paperId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
        .from("saved_papers")
        .insert({ user_id: user.id, paper_id: paperId });

    if (error && error.code !== "23505") throw new Error(error.message); // ignore duplicate
}

export async function unsavePaper(paperId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    await supabase
        .from("saved_papers")
        .delete()
        .eq("user_id", user.id)
        .eq("paper_id", paperId);
}

export async function getSavedPaperIds() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
        .from("saved_papers")
        .select("paper_id")
        .eq("user_id", user.id);

    return data?.map((d: { paper_id: string }) => d.paper_id) || [];
}

export async function getResearchCategories() {
    const supabase = await createClient();
    const { data } = await supabase
        .from("research_papers")
        .select("category")
        .order("category");

    if (!data) return [];
    return [...new Set(data.map((d: { category: string }) => d.category))];
}
