"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { getFeedItems, type FeedItem, type FeedItemType } from "@/lib/actions/feed-actions";
import { useRealtimeTable } from "@/hooks/use-realtime";
import {
    Newspaper, BookOpen, Cpu, ExternalLink,
    Search, Radio, Rss, ArrowUp,
} from "lucide-react";

// ─── helpers ────────────────────────────────────────────────────────────────

const TYPE_META: Record<FeedItemType, { label: string; Icon: typeof Newspaper; color: string; bg: string }> = {
    news:  { label: "News",  Icon: Newspaper, color: "rgba(0,210,255,0.9)",  bg: "rgba(0,210,255,0.08)"  },
    paper: { label: "Paper", Icon: BookOpen,  color: "rgba(160,120,255,0.9)", bg: "rgba(160,120,255,0.08)" },
    model: { label: "Model", Icon: Cpu,        color: "rgba(0,255,180,0.9)",  bg: "rgba(0,255,180,0.08)"  },
};

function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 7)  return `${d}d ago`;
    return new Date(iso).toLocaleDateString();
}

// ─── component ──────────────────────────────────────────────────────────────

const FILTERS: { label: string; value: FeedItemType | "all" }[] = [
    { label: "All",    value: "all" },
    { label: "News",   value: "news" },
    { label: "Papers", value: "paper" },
    { label: "Models", value: "model" },
];

export default function LiveFeedPage() {
    const [items, setItems]           = useState<FeedItem[]>([]);
    const [filter, setFilter]         = useState<FeedItemType | "all">("all");
    const [search, setSearch]         = useState("");
    const [loading, setLoading]       = useState(true);
    const [newCount, setNewCount]     = useState(0);
    const [showTopBtn, setShowTopBtn] = useState(false);
    const topRef = useRef<HTMLDivElement>(null);

    // ── load / reload ───────────────────────────────────────────────────────
    const load = useCallback(async () => {
        setLoading(true);
        const data = await getFeedItems(
            filter !== "all" ? filter : undefined,
            search || undefined
        );
        setItems(data);
        setNewCount(0);
        setLoading(false);
    }, [filter, search]);

    useEffect(() => {
        const t = setTimeout(load, 300);
        return () => clearTimeout(t);
    }, [load]);

    // ── real-time subscriptions on all 3 tables ─────────────────────────────
    useRealtimeTable<{ id: string; title: string; summary: string | null; source: string; url: string; category: string; published_at: string }>(
        "news_articles",
        {
            onInsert: (row) => {
                if (filter !== "all" && filter !== "news") return;
                const item: FeedItem = {
                    id: row.id, type: "news",
                    title: row.title, subtitle: row.source,
                    description: row.summary, url: row.url,
                    category: row.category, timestamp: row.published_at,
                };
                setItems((prev) => [item, ...prev].slice(0, 90));
                setNewCount((c) => c + 1);
            },
        }
    );

    useRealtimeTable<{ id: string; title: string; authors: string | null; abstract: string | null; category: string; pdf_url: string | null; arxiv_id: string | null; published_date: string }>(
        "research_papers",
        {
            onInsert: (row) => {
                if (filter !== "all" && filter !== "paper") return;
                const item: FeedItem = {
                    id: row.id, type: "paper",
                    title: row.title, subtitle: row.authors ?? "Unknown",
                    description: row.abstract, category: row.category,
                    url: row.pdf_url ?? (row.arxiv_id ? `https://arxiv.org/abs/${row.arxiv_id}` : null),
                    timestamp: row.published_date,
                };
                setItems((prev) => [item, ...prev].slice(0, 90));
                setNewCount((c) => c + 1);
            },
        }
    );

    useRealtimeTable<{ id: string; name: string; description: string | null; provider: string | null; model_type: string | null; download_link: string | null; created_at: string }>(
        "ai_models",
        {
            onInsert: (row) => {
                if (filter !== "all" && filter !== "model") return;
                const item: FeedItem = {
                    id: row.id, type: "model",
                    title: row.name, subtitle: row.provider ?? "Community",
                    description: row.description, category: row.model_type,
                    url: row.download_link, timestamp: row.created_at,
                };
                setItems((prev) => [item, ...prev].slice(0, 90));
                setNewCount((c) => c + 1);
            },
        }
    );

    // ── scroll-to-top button ────────────────────────────────────────────────
    useEffect(() => {
        const el = document.querySelector(".overflow-y-auto");
        if (!el) return;
        const handler = () => setShowTopBtn(el.scrollTop > 400);
        el.addEventListener("scroll", handler);
        return () => el.removeEventListener("scroll", handler);
    }, []);

    function scrollToTop() {
        topRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    // ─── render ─────────────────────────────────────────────────────────────
    return (
        <motion.div
            ref={topRef}
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="max-w-3xl mx-auto space-y-6"
        >
            {/* Header */}
            <motion.div variants={fadeInUp} className="flex items-end justify-between">
                <div>
                    <div className="flex items-center gap-2.5 mb-1">
                        <Rss className="size-5" style={{ color: "hsl(186 100% 55%)" }} />
                        <h2 className="text-3xl font-serif font-medium tracking-tight text-foreground">
                            Live Feed
                        </h2>
                    </div>
                    <p className="text-muted-foreground font-light text-sm">
                        All sources — news, papers, and models — in one real-time stream.
                    </p>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono" style={{ color: "rgba(0,210,255,0.6)" }}>
                    <Radio className="size-3 animate-pulse" style={{ color: "hsl(186 100% 55%)" }} />
                    LIVE{newCount > 0 && <span className="ml-1 text-cyan-400 font-semibold">· +{newCount} new</span>}
                </div>
            </motion.div>

            {/* Stats bar */}
            <motion.div variants={fadeInUp} className="flex gap-4">
                {(["news", "paper", "model"] as FeedItemType[]).map((t) => {
                    const meta = TYPE_META[t];
                    const count = items.filter((i) => i.type === t).length;
                    return (
                        <div key={t} className="flex items-center gap-1.5 text-xs font-mono rounded-full px-3 py-1"
                            style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.color.replace("0.9", "0.2")}` }}>
                            <meta.Icon className="size-3" />
                            {count} {meta.label}s
                        </div>
                    );
                })}
            </motion.div>

            {/* Search + filters */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search across all sources…"
                        className="w-full h-10 pl-10 pr-4 rounded-md text-sm font-light focus:outline-none focus:ring-1 placeholder:text-muted-foreground/40"
                        style={{
                            background: "rgba(0,210,255,0.04)",
                            border: "1px solid rgba(0,210,255,0.12)",
                            color: "inherit",
                        }}
                    />
                </div>
                <div className="flex gap-2">
                    {FILTERS.map((f) => (
                        <button
                            key={f.value}
                            onClick={() => setFilter(f.value)}
                            className="h-10 px-4 rounded-md text-xs font-semibold transition-all duration-200"
                            style={filter === f.value
                                ? { background: "hsl(186 100% 50%)", color: "#000" }
                                : { background: "rgba(0,210,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(0,210,255,0.12)" }
                            }
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* New items toast */}
            <AnimatePresence>
                {newCount > 0 && (
                    <motion.button
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onClick={() => { setNewCount(0); scrollToTop(); }}
                        className="w-full py-2.5 rounded-md text-xs font-semibold font-mono tracking-wider transition-all duration-300"
                        style={{
                            background: "rgba(0,210,255,0.1)",
                            border: "1px solid rgba(0,210,255,0.25)",
                            color: "hsl(186 100% 60%)",
                        }}
                    >
                        ↑ {newCount} new item{newCount > 1 ? "s" : ""} — click to refresh
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Feed list */}
            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-24 rounded-xl animate-pulse"
                            style={{ background: "rgba(0,210,255,0.04)", border: "1px solid rgba(0,210,255,0.07)" }} />
                    ))}
                </div>
            ) : items.length === 0 ? (
                <motion.div variants={fadeInUp} className="text-center py-20">
                    <Rss className="size-10 mx-auto mb-4" style={{ color: "rgba(0,210,255,0.2)" }} />
                    <p className="text-muted-foreground font-light">No items yet.</p>
                    <p className="text-xs font-mono mt-2" style={{ color: "rgba(0,210,255,0.35)" }}>
                        GET /api/ingest to seed the feed
                    </p>
                </motion.div>
            ) : (
                <AnimatePresence mode="popLayout">
                    <div className="space-y-3">
                        {items.map((item) => {
                            const meta = TYPE_META[item.type];
                            const content = (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.97 }}
                                    transition={{ duration: 0.25 }}
                                    className="group relative rounded-xl p-4 transition-all duration-300 cursor-pointer"
                                    style={{
                                        background: "rgba(5, 12, 18, 0.7)",
                                        border: "1px solid rgba(0,210,255,0.08)",
                                        backdropFilter: "blur(8px)",
                                    }}
                                    whileHover={{
                                        borderColor: meta.color.replace("0.9", "0.25"),
                                        background: "rgba(5,12,18,0.9)",
                                    }}
                                >
                                    {/* Left accent bar */}
                                    <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full transition-all duration-300 group-hover:opacity-100 opacity-40"
                                        style={{ background: meta.color }} />

                                    <div className="flex items-start justify-between gap-3 pl-3">
                                        <div className="flex-1 min-w-0">
                                            {/* Type + category badges */}
                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold font-mono rounded-full px-2.5 py-0.5"
                                                    style={{ background: meta.bg, color: meta.color }}>
                                                    <meta.Icon className="size-3" />
                                                    {meta.label}
                                                </span>
                                                {item.category && (
                                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                                                        style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.07)" }}>
                                                        {item.category}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-sm font-serif font-medium text-white/90 group-hover:text-white line-clamp-2 leading-snug mb-1.5 transition-colors">
                                                {item.title}
                                            </h3>

                                            {/* Subtitle + description */}
                                            <p className="text-xs font-medium mb-1" style={{ color: meta.color.replace("0.9", "0.6") }}>
                                                {item.subtitle}
                                            </p>
                                            {item.description && (
                                                <p className="text-xs text-muted-foreground/60 line-clamp-2 font-light leading-relaxed">
                                                    {item.description}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex flex-col items-end gap-2 shrink-0">
                                            <ExternalLink className="size-3.5 opacity-0 group-hover:opacity-60 transition-opacity"
                                                style={{ color: meta.color }} />
                                            <span className="text-[10px] font-mono whitespace-nowrap" style={{ color: "rgba(255,255,255,0.25)" }}>
                                                {timeAgo(item.timestamp)}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            );

                            return item.url ? (
                                <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer">
                                    {content}
                                </a>
                            ) : (
                                <div key={item.id}>{content}</div>
                            );
                        })}
                    </div>
                </AnimatePresence>
            )}

            {/* Scroll to top floating button */}
            <AnimatePresence>
                {showTopBtn && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={scrollToTop}
                        className="fixed bottom-8 right-8 size-10 rounded-full flex items-center justify-center shadow-lg z-50"
                        style={{
                            background: "hsl(186 100% 50%)",
                            boxShadow: "0 0 20px rgba(0,210,255,0.4)",
                        }}
                    >
                        <ArrowUp className="size-4 text-black" />
                    </motion.button>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
