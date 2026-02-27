"use server";

import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 50;

export async function getNews(
    category?: string,
    search?: string,
    page = 1,
    limit = PAGE_SIZE
): Promise<{ data: unknown[]; total: number; hasMore: boolean }> {
    const supabase = await createClient();
    const offset = (page - 1) * limit;

    let query = supabase
        .from("news_articles")
        .select("*", { count: "exact" })
        .order("published_at", { ascending: false })
        .range(offset, offset + limit - 1);

    if (category && category !== "all") query = query.eq("category", category);
    if (search) query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%`);

    const { data, error, count } = await query;
    if (error) return { data: [], total: 0, hasMore: false };
    const total = count ?? 0;
    return { data: data ?? [], total, hasMore: offset + limit < total };
}

export async function getNewsCategories() {
    const supabase = await createClient();
    const { data } = await supabase
        .from("news_articles")
        .select("category")
        .order("category");

    if (!data) return [];
    const unique = [...new Set(data.map((d: { category: string }) => d.category))];
    return unique;
}
