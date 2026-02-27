/**
 * Platform Metrics Service
 * Computes real-time metrics from actual database tables.
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface PlatformMetrics {
    active_users: number;
    daily_contributors: number;
    total_documents: number;
    query_count: number;
    total_posts: number;
    total_papers: number;
    total_models: number;
    total_news: number;
    updated_at: string;
}

export async function computeMetrics(): Promise<PlatformMetrics> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    // Total documents count (parallel queries)
    const [postsRes, papersRes, modelsRes, newsRes, contributorsRes, chatRes] = await Promise.all([
        supabase.from("posts").select("id", { count: "exact", head: true }),
        supabase.from("research_papers").select("id", { count: "exact", head: true }),
        supabase.from("ai_models").select("id", { count: "exact", head: true }),
        supabase.from("news_articles").select("id", { count: "exact", head: true }),
        // Daily contributors: unique users who posted or commented today
        supabase.from("posts").select("author_id").gte("created_at", todayStart),
        // Query count: AI chat messages today
        supabase.from("chat_messages").select("id", { count: "exact", head: true }).gte("created_at", todayStart),
    ]);

    const totalPosts = postsRes.count ?? 0;
    const totalPapers = papersRes.count ?? 0;
    const totalModels = modelsRes.count ?? 0;
    const totalNews = newsRes.count ?? 0;
    const queryCount = chatRes.count ?? 0;

    // Unique contributors today
    const contributorIds = new Set(
        (contributorsRes.data || []).map((p: { author_id: string }) => p.author_id)
    );

    const metrics: PlatformMetrics = {
        active_users: contributorIds.size + 1, // +1 for current user
        daily_contributors: contributorIds.size,
        total_documents: totalPosts + totalPapers + totalModels + totalNews,
        query_count: queryCount,
        total_posts: totalPosts,
        total_papers: totalPapers,
        total_models: totalModels,
        total_news: totalNews,
        updated_at: now.toISOString(),
    };

    // Upsert to platform_metrics table
    await supabase
        .from("platform_metrics")
        .upsert({ id: "global", ...metrics }, { onConflict: "id" });

    return metrics;
}

export async function getMetrics(): Promise<PlatformMetrics | null> {
    const { data } = await supabase
        .from("platform_metrics")
        .select("*")
        .eq("id", "global")
        .single();

    return data as PlatformMetrics | null;
}
