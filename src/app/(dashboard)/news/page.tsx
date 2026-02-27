"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { getNews, getNewsCategories } from "@/lib/actions/news-actions";
import { useRealtimeTable } from "@/hooks/use-realtime";
import { ExternalLink, Newspaper, Search, Radio, Loader2 } from "lucide-react";

interface Article {
    id: string;
    title: string;
    summary: string | null;
    source: string;
    url: string;
    published_at: string;
    category: string;
}

const PAGE_SIZE = 20;

export default function NewsPage() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [activeCategory, setActiveCategory] = useState("all");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [liveCount, setLiveCount] = useState(0);
    const sentinelRef = useRef<HTMLDivElement>(null);

    // Real-time: new articles appear instantly
    useRealtimeTable<Article>("news_articles", {
        onInsert: (row) => {
            setArticles((prev) => [row, ...prev]);
            setLiveCount((c) => c + 1);
        },
    });

    // Initial load / filter change — resets list
    const loadArticles = useCallback(async () => {
        setLoading(true);
        setPage(1);
        const result = await getNews(
            activeCategory !== "all" ? activeCategory : undefined,
            search || undefined,
            1,
            PAGE_SIZE
        );
        setArticles(result.data as Article[]);
        setHasMore(result.hasMore);
        setLoading(false);
    }, [activeCategory, search]);

    // Load next page and append
    const loadMore = useCallback(async () => {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);
        const nextPage = page + 1;
        const result = await getNews(
            activeCategory !== "all" ? activeCategory : undefined,
            search || undefined,
            nextPage,
            PAGE_SIZE
        );
        setArticles((prev) => [...prev, ...(result.data as Article[])]);
        setHasMore(result.hasMore);
        setPage(nextPage);
        setLoadingMore(false);
    }, [loadingMore, hasMore, page, activeCategory, search]);

    useEffect(() => {
        getNewsCategories().then(setCategories);
    }, []);

    useEffect(() => {
        const debounce = setTimeout(loadArticles, 300);
        return () => clearTimeout(debounce);
    }, [loadArticles]);

    // Silent 5-min poll — fallback for Realtime disconnects
    useEffect(() => {
        if (search || activeCategory !== "all") return;
        const id = setInterval(() => {
            getNews(undefined, undefined, 1, PAGE_SIZE).then((result) => {
                setArticles(result.data as Article[]);
                setHasMore(result.hasMore);
                setPage(1);
            });
        }, 5 * 60 * 1000);
        return () => clearInterval(id);
    }, [search, activeCategory]);

    // Infinite scroll via IntersectionObserver
    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) loadMore();
            },
            { rootMargin: "200px" }
        );
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [loadMore]);

    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto space-y-8"
        >
            <motion.div variants={fadeInUp} className="flex items-end justify-between">
                <div>
                    <h2 className="text-3xl font-serif font-medium tracking-tight text-foreground">News & Signals</h2>
                    <p className="text-muted-foreground mt-1 font-light">Latest from the AI and tech frontier.</p>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground/50">
                    <Radio className="size-3 text-green-400 animate-pulse" />
                    LIVE{liveCount > 0 && ` · +${liveCount}`}
                </div>
            </motion.div>

            {/* Search + Filters */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search articles..."
                        className="w-full h-10 pl-10 pr-4 rounded-md bg-background/50 border border-border/50 text-sm font-light focus:outline-none focus:ring-1 focus:ring-foreground/20 placeholder:text-muted-foreground/40"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => setActiveCategory("all")}
                        className={`h-8 px-3 rounded-md text-xs font-medium transition-colors ${activeCategory === "all" ? "bg-foreground text-background" : "bg-muted/50 text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        All
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`h-8 px-3 rounded-md text-xs font-medium transition-colors ${activeCategory === cat ? "bg-foreground text-background" : "bg-muted/50 text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Articles */}
            {loading ? (
                <div className="text-center py-16 text-muted-foreground font-mono text-sm animate-pulse">Loading articles...</div>
            ) : articles.length === 0 ? (
                <motion.div variants={fadeInUp} className="text-center py-16">
                    <Newspaper className="size-8 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-muted-foreground font-light">No articles found. Run the ingestion endpoint to fetch news.</p>
                    <p className="text-xs text-muted-foreground/50 mt-2 font-mono">GET /api/ingest?secret=griva-ingest-2026</p>
                </motion.div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence initial={false}>
                        {articles.map((article) => (
                            <motion.div
                                key={article.id}
                                variants={fadeInUp}
                                initial="hidden"
                                animate="visible"
                                layout
                            >
                                <a href={article.url} target="_blank" rel="noopener noreferrer">
                                    <Card className="glass-panel border-border/50 shadow-md group cursor-pointer hover:shadow-xl hover:border-foreground/20 transition-all duration-500">
                                        <CardHeader className="pb-2 flex flex-row items-start justify-between gap-4">
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-base font-serif font-medium text-foreground group-hover:text-muted-foreground transition-colors line-clamp-2">
                                                    {article.title}
                                                </h3>
                                            </div>
                                            <ExternalLink className="size-4 text-muted-foreground/30 group-hover:text-foreground shrink-0 mt-1 transition-colors" />
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            {article.summary && (
                                                <p className="text-sm text-muted-foreground font-light line-clamp-2 mb-3">{article.summary}</p>
                                            )}
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground/60">
                                                <Badge variant="outline" className="font-mono text-[10px]">{article.source}</Badge>
                                                <Badge variant="outline" className="font-mono text-[10px]">{article.category}</Badge>
                                                <span className="font-mono ml-auto">{formatDate(article.published_at)}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </a>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Infinite scroll sentinel */}
                    <div ref={sentinelRef} className="h-1" />

                    {loadingMore && (
                        <div className="flex justify-center py-6">
                            <Loader2 className="size-5 text-muted-foreground/40 animate-spin" />
                        </div>
                    )}

                    {!hasMore && articles.length > 0 && (
                        <p className="text-center text-xs font-mono text-muted-foreground/30 py-4">
                            — end of feed —
                        </p>
                    )}
                </div>
            )}
        </motion.div>
    );
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const hours = Math.floor((now.getTime() - date.getTime()) / 3600000);
    if (hours < 1) return "just now";
    if (hours < 24) return `${hours}h ago`;
    if (hours < 168) return `${Math.floor(hours / 24)}d ago`;
    return date.toLocaleDateString();
}
