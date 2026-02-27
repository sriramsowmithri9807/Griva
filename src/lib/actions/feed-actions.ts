"use server";

import { createClient } from "@/lib/supabase/server";

export type FeedItemType = "news" | "paper" | "model";

export interface FeedItem {
    id: string;
    type: FeedItemType;
    title: string;
    subtitle: string;      // source / authors / provider
    description: string | null;
    url: string | null;
    category: string | null;
    timestamp: string;     // ISO string for sorting
}

// How many of each to fetch per request
const LIMIT = 30;

export async function getFeedItems(
    filter?: FeedItemType,
    search?: string
): Promise<FeedItem[]> {
    const supabase = await createClient();

    const buckets: FeedItem[][] = [];

    // ── News articles ─────────────────────────────────────────────────────────
    if (!filter || filter === "news") {
        let q = supabase
            .from("news_articles")
            .select("id, title, summary, source, url, category, published_at")
            .order("published_at", { ascending: false })
            .limit(LIMIT);

        if (search) q = q.or(`title.ilike.%${search}%,summary.ilike.%${search}%`);

        const { data } = await q;
        if (data) {
            buckets.push(
                data.map((r) => ({
                    id:          r.id,
                    type:        "news" as const,
                    title:       r.title,
                    subtitle:    r.source,
                    description: r.summary ?? null,
                    url:         r.url,
                    category:    r.category,
                    timestamp:   r.published_at,
                }))
            );
        }
    }

    // ── Research papers ───────────────────────────────────────────────────────
    if (!filter || filter === "paper") {
        let q = supabase
            .from("research_papers")
            .select("id, title, authors, abstract, category, pdf_url, arxiv_id, published_date")
            .order("published_date", { ascending: false })
            .limit(LIMIT);

        if (search) q = q.or(`title.ilike.%${search}%,abstract.ilike.%${search}%,authors.ilike.%${search}%`);

        const { data } = await q;
        if (data) {
            buckets.push(
                data.map((r) => ({
                    id:          r.id,
                    type:        "paper" as const,
                    title:       r.title,
                    subtitle:    r.authors ?? "Unknown authors",
                    description: r.abstract ?? null,
                    url:         r.pdf_url ?? (r.arxiv_id ? `https://arxiv.org/abs/${r.arxiv_id}` : null),
                    category:    r.category,
                    timestamp:   r.published_date,
                }))
            );
        }
    }

    // ── AI models ─────────────────────────────────────────────────────────────
    if (!filter || filter === "model") {
        let q = supabase
            .from("ai_models")
            .select("id, name, description, provider, model_type, download_link, created_at")
            .order("created_at", { ascending: false })
            .limit(LIMIT);

        if (search) q = q.or(`name.ilike.%${search}%,description.ilike.%${search}%,provider.ilike.%${search}%`);

        const { data } = await q;
        if (data) {
            buckets.push(
                data.map((r) => ({
                    id:          r.id,
                    type:        "model" as const,
                    title:       r.name,
                    subtitle:    r.provider ?? "Community",
                    description: r.description ?? null,
                    url:         r.download_link ?? null,
                    category:    r.model_type ?? null,
                    timestamp:   r.created_at,
                }))
            );
        }
    }

    // Merge all buckets and sort by timestamp descending
    return buckets
        .flat()
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 90);
}
