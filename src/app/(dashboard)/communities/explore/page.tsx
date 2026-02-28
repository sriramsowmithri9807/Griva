"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { getTrendingCommunities, getNewestCommunities, searchCommunities } from "@/lib/actions/community-actions";
import { CreateCommunityDialog } from "@/components/community/create-community-dialog";
import { Users, TrendingUp, Sparkles, Search } from "lucide-react";
import Link from "next/link";

interface Community {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    category: string | null;
    avatar_url: string | null;
    tags: string[] | null;
    created_at: string;
    community_members: { count: number }[];
}

type Tab = "trending" | "newest";

const CATEGORIES = [
    "All", "Artificial Intelligence", "Machine Learning", "Deep Learning",
    "NLP", "Computer Vision", "Web Dev", "Security", "Data Science",
    "Research", "Tools & Libraries", "Open Source", "Career",
];

export default function ExplorePage() {
    const [communities, setCommunities] = useState<Community[]>([]);
    const [tab, setTab] = useState<Tab>("trending");
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [loading, setLoading] = useState(true);

    // Inline debounce
    useEffect(() => {
        const id = setTimeout(() => setDebouncedSearch(search), 350);
        return () => clearTimeout(id);
    }, [search]);

    const load = useCallback(async () => {
        setLoading(true);
        let data: Community[];
        if (debouncedSearch.trim()) {
            data = await searchCommunities(debouncedSearch.trim()) as Community[];
        } else if (tab === "trending") {
            data = await getTrendingCommunities(50) as Community[];
        } else {
            data = await getNewestCommunities(50) as Community[];
        }
        if (category !== "All") {
            data = data.filter((c) => c.category === category);
        }
        setCommunities(data);
        setLoading(false);
    }, [tab, debouncedSearch, category]);

    useEffect(() => { load(); }, [load]);

    return (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-5xl mx-auto space-y-8">
            <motion.div variants={fadeInUp} className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-serif font-medium tracking-tight text-foreground">Explore</h2>
                    <p className="text-muted-foreground mt-1 font-light">Discover communities built by developers.</p>
                </div>
                <CreateCommunityDialog />
            </motion.div>

            <motion.div variants={fadeInUp} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search communities..."
                    className="w-full h-12 pl-11 pr-4 rounded-xl bg-background/50 border border-border/50 text-sm font-light focus:outline-none focus:ring-1 focus:ring-foreground/20 placeholder:text-muted-foreground/40"
                />
            </motion.div>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-wrap">
                {!search && (
                    <div className="flex gap-1 p-1 rounded-lg bg-muted/30 border border-border/30 shrink-0">
                        <button onClick={() => setTab("trending")}
                            className={`flex items-center gap-1.5 h-8 px-4 rounded-md text-xs font-medium transition-all ${tab === "trending" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>
                            <TrendingUp className="size-3" /> Trending
                        </button>
                        <button onClick={() => setTab("newest")}
                            className={`flex items-center gap-1.5 h-8 px-4 rounded-md text-xs font-medium transition-all ${tab === "newest" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>
                            <Sparkles className="size-3" /> Newest
                        </button>
                    </div>
                )}
                <div className="flex gap-1.5 flex-wrap">
                    {CATEGORIES.map((c) => (
                        <button key={c} onClick={() => setCategory(c)}
                            className={`h-7 px-3 rounded-full text-xs font-medium transition-all border ${category === c ? "bg-foreground text-background border-transparent" : "border-border/40 text-muted-foreground hover:text-foreground hover:border-foreground/30"}`}>
                            {c}
                        </button>
                    ))}
                </div>
            </motion.div>

            {loading ? (
                <div className="text-center py-16 text-muted-foreground font-mono text-sm animate-pulse">Loading communities...</div>
            ) : communities.length === 0 ? (
                <motion.div variants={fadeInUp} className="text-center py-16">
                    <Users className="size-8 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-muted-foreground font-light">
                        {search ? `No results for "${search}"` : "No communities yet. Create the first one!"}
                    </p>
                </motion.div>
            ) : (
                <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {communities.map((community) => {
                        const memberCount = community.community_members?.[0]?.count ?? 0;
                        return (
                            <Link key={community.id} href={`/communities/${community.slug}`}>
                                <div className="group h-full bg-card/50 border border-border/50 rounded-xl p-4 hover:border-foreground/20 hover:shadow-xl transition-all duration-300 space-y-3 cursor-pointer">
                                    <div className="flex items-start gap-3">
                                        <div className="size-10 rounded-lg border border-border/50 overflow-hidden bg-muted/30 shrink-0 flex items-center justify-center text-sm font-serif font-bold text-muted-foreground/50">
                                            {community.avatar_url
                                                // eslint-disable-next-line @next/next/no-img-element
                                                ? <img src={community.avatar_url} alt={community.name} className="w-full h-full object-cover" />
                                                : community.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-sm font-serif font-medium text-foreground group-hover:text-muted-foreground transition-colors truncate">
                                                g/{community.name}
                                            </h3>
                                            {community.category && (
                                                <p className="text-[10px] font-mono text-muted-foreground/50">{community.category}</p>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-light line-clamp-2 leading-relaxed">
                                        {community.description || "No description"}
                                    </p>
                                    {community.tags && community.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {community.tags.slice(0, 3).map((t) => (
                                                <span key={t} className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-foreground/5 border border-border/30 text-muted-foreground/50">#{t}</span>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground/50">
                                        <Users className="size-3" />
                                        <span className="font-mono">{memberCount} members</span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </motion.div>
            )}
        </motion.div>
    );
}
