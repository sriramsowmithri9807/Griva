"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { getResearchPapers, getResearchCategories, savePaper, unsavePaper, getSavedPaperIds } from "@/lib/actions/research-actions";
import { useRealtimeTable } from "@/hooks/use-realtime";
import { BookOpen, Search, Bookmark, BookmarkCheck, FileText, Radio, Loader2 } from "lucide-react";

interface Paper {
    id: string;
    title: string;
    authors: string | null;
    abstract: string | null;
    category: string;
    pdf_url: string | null;
    published_date: string;
}

const PAGE_SIZE = 20;

export default function ResearchPage() {
    const [papers, setPapers] = useState<Paper[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [savedIds, setSavedIds] = useState<string[]>([]);
    const [activeCategory, setActiveCategory] = useState("all");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [liveCount, setLiveCount] = useState(0);
    const sentinelRef = useRef<HTMLDivElement>(null);

    useRealtimeTable<Paper>("research_papers", {
        onInsert: (row) => {
            setPapers((prev) => [row, ...prev]);
            setLiveCount((c) => c + 1);
        },
    });

    // Initial load / filter change — resets list
    const loadPapers = useCallback(async () => {
        setLoading(true);
        setPage(1);
        const result = await getResearchPapers(
            activeCategory !== "all" ? activeCategory : undefined,
            search || undefined,
            1,
            PAGE_SIZE
        );
        setPapers(result.data as Paper[]);
        setHasMore(result.hasMore);
        setLoading(false);
    }, [activeCategory, search]);

    // Load next page and append
    const loadMore = useCallback(async () => {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);
        const nextPage = page + 1;
        const result = await getResearchPapers(
            activeCategory !== "all" ? activeCategory : undefined,
            search || undefined,
            nextPage,
            PAGE_SIZE
        );
        setPapers((prev) => [...prev, ...(result.data as Paper[])]);
        setHasMore(result.hasMore);
        setPage(nextPage);
        setLoadingMore(false);
    }, [loadingMore, hasMore, page, activeCategory, search]);

    useEffect(() => {
        getResearchCategories().then(setCategories);
        getSavedPaperIds().then(setSavedIds);
    }, []);

    useEffect(() => {
        const debounce = setTimeout(loadPapers, 300);
        return () => clearTimeout(debounce);
    }, [loadPapers]);

    // Silent 5-min poll — fallback for Realtime disconnects
    useEffect(() => {
        if (search || activeCategory !== "all") return;
        const id = setInterval(() => {
            getResearchPapers(undefined, undefined, 1, PAGE_SIZE).then((result) => {
                setPapers(result.data as Paper[]);
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

    async function handleToggleSave(paperId: string) {
        const isSaved = savedIds.includes(paperId);
        setSavedIds(isSaved ? savedIds.filter((id) => id !== paperId) : [...savedIds, paperId]);
        try {
            if (isSaved) await unsavePaper(paperId);
            else await savePaper(paperId);
        } catch {
            setSavedIds(isSaved ? [...savedIds, paperId] : savedIds.filter((id) => id !== paperId));
        }
    }

    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto space-y-8"
        >
            <motion.div variants={fadeInUp} className="flex items-end justify-between">
                <div>
                    <h2 className="text-3xl font-serif font-medium tracking-tight text-foreground">Research Papers</h2>
                    <p className="text-muted-foreground mt-1 font-light">Latest papers from arXiv and open research.</p>
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
                        placeholder="Search papers, authors..."
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

            {/* Papers */}
            {loading ? (
                <div className="text-center py-16 text-muted-foreground font-mono text-sm animate-pulse">Loading papers...</div>
            ) : papers.length === 0 ? (
                <motion.div variants={fadeInUp} className="text-center py-16">
                    <BookOpen className="size-8 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-muted-foreground font-light">No papers found. Run the ingestion endpoint to fetch from arXiv.</p>
                    <p className="text-xs text-muted-foreground/50 mt-2 font-mono">GET /api/ingest?secret=griva-ingest-2026</p>
                </motion.div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence initial={false}>
                        {papers.map((paper) => {
                            const isSaved = savedIds.includes(paper.id);
                            return (
                                <motion.div
                                    key={paper.id}
                                    variants={fadeInUp}
                                    initial="hidden"
                                    animate="visible"
                                    layout
                                >
                                    <Card className="glass-panel border-border/50 shadow-md group hover:shadow-xl hover:border-foreground/20 transition-all duration-500">
                                        <CardHeader className="pb-2 flex flex-row items-start justify-between gap-4">
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-base font-serif font-medium text-foreground group-hover:text-muted-foreground transition-colors line-clamp-2">
                                                    {paper.title}
                                                </h3>
                                                {paper.authors && (
                                                    <p className="text-xs text-muted-foreground/60 mt-1 font-mono line-clamp-1">{paper.authors}</p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleToggleSave(paper.id)}
                                                className="shrink-0 p-1.5 rounded-md hover:bg-muted/50 transition-colors"
                                            >
                                                {isSaved ? (
                                                    <BookmarkCheck className="size-4 text-foreground" />
                                                ) : (
                                                    <Bookmark className="size-4 text-muted-foreground/30 hover:text-foreground transition-colors" />
                                                )}
                                            </button>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            {paper.abstract && (
                                                <p className="text-sm text-muted-foreground font-light line-clamp-3 mb-3">{paper.abstract}</p>
                                            )}
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground/60">
                                                <Badge variant="outline" className="font-mono text-[10px]">{paper.category}</Badge>
                                                <span className="font-mono">{new Date(paper.published_date).toLocaleDateString()}</span>
                                                {paper.pdf_url && (
                                                    <a
                                                        href={paper.pdf_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="ml-auto flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                                                    >
                                                        <FileText className="size-3" />
                                                        <span>PDF</span>
                                                    </a>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {/* Infinite scroll sentinel */}
                    <div ref={sentinelRef} className="h-1" />

                    {loadingMore && (
                        <div className="flex justify-center py-6">
                            <Loader2 className="size-5 text-muted-foreground/40 animate-spin" />
                        </div>
                    )}

                    {!hasMore && papers.length > 0 && (
                        <p className="text-center text-xs font-mono text-muted-foreground/30 py-4">
                            — end of feed —
                        </p>
                    )}
                </div>
            )}
        </motion.div>
    );
}
