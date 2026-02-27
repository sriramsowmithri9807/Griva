"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { getModels, getModelTypes, bookmarkModel, unbookmarkModel, getBookmarkedModelIds } from "@/lib/actions/models-actions";
import { useRealtimeTable } from "@/hooks/use-realtime";
import { Search, Star, StarOff, ExternalLink, Cpu, Radio } from "lucide-react";

interface Model {
    id: string;
    name: string;
    description: string | null;
    provider: string;
    model_type: string;
    download_link: string | null;
    tags: string[] | null;
}

export default function ModelsPage() {
    const [models, setModels] = useState<Model[]>([]);
    const [types, setTypes] = useState<string[]>([]);
    const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
    const [activeType, setActiveType] = useState("all");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [liveCount, setLiveCount] = useState(0);

    useRealtimeTable<Model>("ai_models", {
        onInsert: (row) => {
            setModels((prev) => [row, ...prev]);
            setLiveCount((c) => c + 1);
        },
    });

    const loadModels = useCallback(async () => {
        setLoading(true);
        const data = await getModels(
            activeType !== "all" ? activeType : undefined,
            search || undefined
        );
        setModels(data as Model[]);
        setLoading(false);
    }, [activeType, search]);

    useEffect(() => {
        getModelTypes().then(setTypes);
        getBookmarkedModelIds().then(setBookmarkedIds);
    }, []);

    useEffect(() => {
        const debounce = setTimeout(loadModels, 300);
        return () => clearTimeout(debounce);
    }, [loadModels]);

    // Silent 5-min poll — fallback for Realtime disconnects.
    // Only runs when no search/filter is active to avoid disrupting the user's view.
    useEffect(() => {
        if (search || activeType !== "all") return;
        const id = setInterval(() => {
            getModels().then((data) => setModels(data as Model[]));
        }, 5 * 60 * 1000);
        return () => clearInterval(id);
    }, [search, activeType]);

    async function handleToggleBookmark(modelId: string) {
        const isBookmarked = bookmarkedIds.includes(modelId);
        setBookmarkedIds(isBookmarked ? bookmarkedIds.filter((id) => id !== modelId) : [...bookmarkedIds, modelId]);
        try {
            if (isBookmarked) await unbookmarkModel(modelId);
            else await bookmarkModel(modelId);
        } catch {
            setBookmarkedIds(isBookmarked ? [...bookmarkedIds, modelId] : bookmarkedIds.filter((id) => id !== modelId));
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
                    <h2 className="text-3xl font-serif font-medium tracking-tight text-foreground">AI Models</h2>
                    <p className="text-muted-foreground mt-1 font-light">Explore and bookmark open-source AI models.</p>
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
                        placeholder="Search models, providers..."
                        className="w-full h-10 pl-10 pr-4 rounded-md bg-background/50 border border-border/50 text-sm font-light focus:outline-none focus:ring-1 focus:ring-foreground/20 placeholder:text-muted-foreground/40"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => setActiveType("all")}
                        className={`h-8 px-3 rounded-md text-xs font-medium transition-colors ${activeType === "all" ? "bg-foreground text-background" : "bg-muted/50 text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        All
                    </button>
                    {types.map((type) => (
                        <button
                            key={type}
                            onClick={() => setActiveType(type)}
                            className={`h-8 px-3 rounded-md text-xs font-medium transition-colors ${activeType === type ? "bg-foreground text-background" : "bg-muted/50 text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Models grid */}
            {loading ? (
                <div className="text-center py-16 text-muted-foreground font-mono text-sm animate-pulse">Loading models...</div>
            ) : models.length === 0 ? (
                <motion.div variants={fadeInUp} className="text-center py-16">
                    <Cpu className="size-8 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-muted-foreground font-light">No models found. Seed data needs to be ingested.</p>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {models.map((model) => {
                        const isBookmarked = bookmarkedIds.includes(model.id);
                        return (
                            <motion.div key={model.id} variants={fadeInUp}>
                                <Card className="glass-panel border-border/50 shadow-md group hover:shadow-xl hover:border-foreground/20 transition-all duration-500 h-full">
                                    <CardHeader className="pb-2 flex flex-row items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-base font-serif font-medium text-foreground group-hover:text-muted-foreground transition-colors">
                                                {model.name}
                                            </h3>
                                            <p className="text-xs text-muted-foreground/60 font-mono mt-0.5">{model.provider}</p>
                                        </div>
                                        <button
                                            onClick={() => handleToggleBookmark(model.id)}
                                            className="shrink-0 p-1.5 rounded-md hover:bg-muted/50 transition-colors"
                                        >
                                            {isBookmarked ? (
                                                <Star className="size-4 text-yellow-400 fill-current" />
                                            ) : (
                                                <StarOff className="size-4 text-muted-foreground/30 hover:text-foreground transition-colors" />
                                            )}
                                        </button>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        {model.description && (
                                            <p className="text-sm text-muted-foreground font-light line-clamp-2 mb-3">{model.description}</p>
                                        )}
                                        <div className="flex flex-wrap items-center gap-2 mb-3">
                                            <Badge variant="outline" className="font-mono text-[10px]">{model.model_type}</Badge>
                                            {model.tags?.slice(0, 3).map((tag) => (
                                                <Badge key={tag} variant="outline" className="font-mono text-[10px] text-muted-foreground/50">{tag}</Badge>
                                            ))}
                                        </div>
                                        {model.download_link && (
                                            <a
                                                href={model.download_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                <ExternalLink className="size-3" />
                                                View Model
                                            </a>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
}
