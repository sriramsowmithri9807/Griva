/**
 * src/lib/workers.ts
 *
 * Single source of truth for all background data ingestion workers.
 *
 * Imported by:
 *   - src/instrumentation.ts       (scheduled cron, runs on server boot)
 *   - src/app/api/cron/route.ts    (manual trigger via HTTP)
 *   - src/app/api/ingest/route.ts  (one-shot manual trigger)
 *
 * Uses createClient from @supabase/supabase-js directly — NOT the SSR server
 * client — because workers run outside request context (no cookies available).
 */

import { createClient } from "@supabase/supabase-js";
import Parser from "rss-parser";
import { computeMetrics } from "@/lib/metrics";

// ---------------------------------------------------------------------------
// Supabase client factory — reads env vars at call time, safe for module load
// ---------------------------------------------------------------------------
function getSupabase() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error("[Workers] Missing Supabase env vars");
    return createClient(url, key);
}

const parser = new Parser();

// ---------------------------------------------------------------------------
// Data source definitions
// ---------------------------------------------------------------------------

const NEWS_FEEDS = [
    // ── Core AI Company Blogs ────────────────────────────────────────────────
    { url: "https://blog.google/technology/ai/rss/",                              category: "AI",   source: "Google AI Blog" },
    { url: "https://openai.com/blog/rss.xml",                                     category: "AI",   source: "OpenAI" },
    { url: "https://www.anthropic.com/rss.xml",                                   category: "AI",   source: "Anthropic" },
    { url: "https://deepmind.google/blog/feed/basic/",                            category: "AI",   source: "DeepMind" },
    { url: "https://ai.meta.com/blog/rss/",                                       category: "AI",   source: "Meta AI" },
    { url: "https://blogs.microsoft.com/ai/feed/",                                category: "AI",   source: "Microsoft AI" },
    { url: "https://aws.amazon.com/blogs/machine-learning/feed/",                 category: "AI",   source: "AWS ML Blog" },
    { url: "https://huggingface.co/blog/feed.xml",                                category: "AI",   source: "HuggingFace" },
    { url: "https://blogs.nvidia.com/feed/",                                      category: "AI",   source: "NVIDIA Blog" },
    // ── AI & Tech News ───────────────────────────────────────────────────────
    { url: "https://techcrunch.com/category/artificial-intelligence/feed/",       category: "AI",   source: "TechCrunch AI" },
    { url: "https://www.technologyreview.com/feed/",                              category: "Tech", source: "MIT Tech Review" },
    { url: "https://venturebeat.com/category/ai/feed/",                           category: "AI",   source: "VentureBeat AI" },
    { url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",   category: "AI",   source: "The Verge AI" },
    { url: "https://www.wired.com/feed/tag/ai/latest/rss",                        category: "Tech", source: "Wired AI" },
    { url: "https://feeds.arstechnica.com/arstechnica/technology-lab",            category: "Tech", source: "Ars Technica" },
    { url: "https://feed.infoq.com/ai-ml-data-eng/",                             category: "AI",   source: "InfoQ AI/ML" },
    // ── Developer Community ──────────────────────────────────────────────────
    { url: "https://news.ycombinator.com/rss",                                    category: "Dev",  source: "Hacker News" },
    { url: "https://dev.to/feed/tag/ai",                                          category: "Dev",  source: "dev.to AI" },
    { url: "https://dev.to/feed/tag/machinelearning",                             category: "AI",   source: "dev.to ML" },
    { url: "https://dev.to/feed/tag/llm",                                         category: "AI",   source: "dev.to LLM" },
    { url: "https://github.blog/feed/",                                           category: "Dev",  source: "GitHub Blog" },
    { url: "https://stackoverflow.blog/feed/",                                    category: "Dev",  source: "Stack Overflow" },
    // ── Research & Deep Dives ────────────────────────────────────────────────
    { url: "https://www.kdnuggets.com/feed",                                      category: "AI",   source: "KDnuggets" },
    { url: "https://towardsdatascience.com/feed",                                 category: "AI",   source: "Towards Data Science" },
    { url: "https://simonwillison.net/atom/everything/",                          category: "AI",   source: "Simon Willison" },
    { url: "https://lilianweng.github.io/index.xml",                              category: "AI",   source: "Lilian Weng" },
];

const ARXIV_FEEDS = [
    { url: "https://rss.arxiv.org/rss/cs.AI", category: "Artificial Intelligence" },
    { url: "https://rss.arxiv.org/rss/cs.LG", category: "Machine Learning" },
    { url: "https://rss.arxiv.org/rss/cs.CL", category: "NLP" },
    { url: "https://rss.arxiv.org/rss/cs.CV", category: "Computer Vision" },
    { url: "https://rss.arxiv.org/rss/cs.RO", category: "Robotics" },
    { url: "https://rss.arxiv.org/rss/cs.NE", category: "Neural Computing" },
    { url: "https://rss.arxiv.org/rss/stat.ML", category: "Statistics ML" },
    { url: "https://rss.arxiv.org/rss/cs.IR", category: "Information Retrieval" },
];

// Pipeline tags to query HuggingFace by category for breadth
const HF_PIPELINE_TAGS = [
    "text-generation",
    "text2text-generation",
    "text-to-image",
    "image-to-image",
    "image-classification",
    "object-detection",
    "image-segmentation",
    "automatic-speech-recognition",
    "text-to-speech",
    "audio-classification",
    "text-classification",
    "token-classification",
    "question-answering",
    "summarization",
    "translation",
    "fill-mask",
    "sentence-similarity",
    "feature-extraction",
    "zero-shot-classification",
    "reinforcement-learning",
    "tabular-classification",
    "depth-estimation",
    "video-classification",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapPipelineTag(tag?: string): string {
    if (!tag) return "General";
    const map: Record<string, string> = {
        "text-generation":              "LLM",
        "text2text-generation":         "LLM",
        "fill-mask":                    "LLM",
        "text-to-image":                "Image",
        "image-classification":         "Vision",
        "object-detection":             "Vision",
        "automatic-speech-recognition": "Audio",
        "text-to-speech":               "Audio",
        "text-classification":          "NLP",
        "token-classification":         "NLP",
        "question-answering":           "NLP",
    };
    return map[tag] ?? tag.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout after ${ms}ms: ${label}`)), ms)
        ),
    ]);
}

// ---------------------------------------------------------------------------
// Worker: News (RSS feeds)
// ---------------------------------------------------------------------------
export async function runNewsWorker(): Promise<{ count: number; errors: string[] }> {
    console.log("[Worker:News] Starting...");
    const supabase = getSupabase();
    let count = 0;
    const errors: string[] = [];

    for (const feed of NEWS_FEEDS) {
        try {
            const parsed = await withTimeout(
                parser.parseURL(feed.url),
                15_000,
                feed.source
            );

            const articles = (parsed.items || []).slice(0, 50).map((item) => ({
                title:        (item.title || "").slice(0, 500),
                summary:      (item.contentSnippet || item.content || "")
                                  .replace(/<[^>]*>/g, "")
                                  .slice(0, 1000),
                source:       feed.source,
                url:          item.link || "",
                published_at: item.pubDate
                                  ? new Date(item.pubDate).toISOString()
                                  : new Date().toISOString(),
                category:     feed.category,
            }));

            if (articles.length > 0) {
                const { error } = await supabase
                    .from("news_articles")
                    .upsert(articles, { onConflict: "url", ignoreDuplicates: true });

                if (error) errors.push(`News[${feed.source}]: ${error.message}`);
                else count += articles.length;
            }
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            errors.push(`News[${feed.source}]: ${msg}`);
            console.error(`[Worker:News] ${feed.source} failed:`, msg);
        }
    }

    console.log(`[Worker:News] Done — ${count} articles, ${errors.length} errors`);
    return { count, errors };
}

// ---------------------------------------------------------------------------
// Worker: Research Papers (arXiv RSS)
// ---------------------------------------------------------------------------
export async function runPapersWorker(): Promise<{ count: number; errors: string[] }> {
    console.log("[Worker:Papers] Starting...");
    const supabase = getSupabase();
    let count = 0;
    const errors: string[] = [];

    for (const feed of ARXIV_FEEDS) {
        try {
            const parsed = await withTimeout(
                parser.parseURL(feed.url),
                20_000,
                feed.category
            );

            const papers = (parsed.items || []).slice(0, 100).map((item) => {
                const link  = item.link || "";
                const absId = link.replace(/https?:\/\/arxiv\.org\/abs\//, "").trim();
                return {
                    title:          (item.title || "").replace(/\n/g, " ").trim().slice(0, 500),
                    authors:        (item.creator || item.author || "Unknown").slice(0, 500),
                    abstract:       (item.contentSnippet || item.content || "")
                                        .replace(/<[^>]*>/g, "")
                                        .slice(0, 2000),
                    category:       feed.category,
                    pdf_url:        `https://arxiv.org/pdf/${absId}`,
                    arxiv_id:       absId,
                    published_date: item.pubDate
                                        ? new Date(item.pubDate).toISOString()
                                        : new Date().toISOString(),
                };
            });

            if (papers.length > 0) {
                // ignoreDuplicates: true — arXiv papers are immutable after publication
                const { error } = await supabase
                    .from("research_papers")
                    .upsert(papers, { onConflict: "arxiv_id", ignoreDuplicates: true });

                if (error) errors.push(`Papers[${feed.category}]: ${error.message}`);
                else count += papers.length;
            }
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            errors.push(`Papers[${feed.category}]: ${msg}`);
            console.error(`[Worker:Papers] ${feed.category} failed:`, msg);
        }
    }

    console.log(`[Worker:Papers] Done — ${count} papers, ${errors.length} errors`);
    return { count, errors };
}

// ---------------------------------------------------------------------------
// Worker: AI Models (HuggingFace API)
// ---------------------------------------------------------------------------

interface HFModel {
    id:            string;
    modelId?:      string;
    pipeline_tag?: string;
    downloads?:    number;
    tags?:         string[];
}

function buildModelRow(m: HFModel) {
    return {
        name:          m.modelId || m.id,
        description:   `${m.pipeline_tag || "General"} model · ${(m.downloads ?? 0).toLocaleString()} downloads`,
        provider:      (m.id || "").split("/")[0] || "Community",
        model_type:    mapPipelineTag(m.pipeline_tag),
        download_link: `https://huggingface.co/${m.id}`,
        tags:          (m.tags || []).slice(0, 5),
        hf_id:         m.id,
    };
}

async function fetchHFModels(params: Record<string, string>): Promise<HFModel[]> {
    const qs  = new URLSearchParams(params).toString();
    const res = await fetch(`https://huggingface.co/api/models?${qs}`, {
        signal:  AbortSignal.timeout(15_000),
        headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HF API ${res.status}: ${res.statusText}`);
    return res.json();
}

export async function runModelsWorker(): Promise<{ count: number; errors: string[] }> {
    console.log("[Worker:Models] Starting...");
    const supabase = getSupabase();
    const errors: string[] = [];

    // Deduplicate across all fetches using a Map keyed on hf_id
    const seen = new Map<string, ReturnType<typeof buildModelRow>>();

    // 1. Top-500 most downloaded models (broad discovery)
    try {
        const models = await fetchHFModels({ sort: "downloads", limit: "500" });
        for (const m of models) seen.set(m.id, buildModelRow(m));
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        errors.push(`Models[trending]: ${msg}`);
        console.error("[Worker:Models] trending fetch failed:", msg);
    }

    // 2. Top-100 per pipeline tag (category-level discovery)
    for (const tag of HF_PIPELINE_TAGS) {
        try {
            const models = await fetchHFModels({ filter: tag, sort: "downloads", limit: "100" });
            for (const m of models) seen.set(m.id, buildModelRow(m));
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            errors.push(`Models[${tag}]: ${msg}`);
            console.error(`[Worker:Models] ${tag} fetch failed:`, msg);
        }
    }

    // 3. Most liked models (second angle for diversity)
    try {
        const models = await fetchHFModels({ sort: "likes", limit: "300" });
        for (const m of models) seen.set(m.id, buildModelRow(m));
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        errors.push(`Models[most-liked]: ${msg}`);
        console.error("[Worker:Models] most-liked fetch failed:", msg);
    }

    const rows = Array.from(seen.values());

    if (rows.length > 0) {
        // NO ignoreDuplicates — we want to update download counts each run
        const { error } = await supabase
            .from("ai_models")
            .upsert(rows, { onConflict: "hf_id" });

        if (error) {
            errors.push(`Models[upsert]: ${error.message}`);
            console.error("[Worker:Models] upsert failed:", error.message);
        }
    }

    console.log(`[Worker:Models] Done — ${rows.length} models, ${errors.length} errors`);
    return { count: rows.length, errors };
}

// ---------------------------------------------------------------------------
// Worker: Metrics
// ---------------------------------------------------------------------------
export async function runMetricsWorker(): Promise<void> {
    console.log("[Worker:Metrics] Starting...");
    try {
        await computeMetrics();
        console.log("[Worker:Metrics] Done");
    } catch (e) {
        console.error("[Worker:Metrics] Failed:", e instanceof Error ? e.message : e);
    }
}

// ---------------------------------------------------------------------------
// Run all workers in parallel (used by manual-trigger endpoints)
// ---------------------------------------------------------------------------
export async function runAllWorkers() {
    return Promise.allSettled([
        runNewsWorker(),
        runPapersWorker(),
        runModelsWorker(),
        runMetricsWorker(),
    ]);
}
