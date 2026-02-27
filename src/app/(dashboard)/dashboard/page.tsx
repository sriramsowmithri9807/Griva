"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { Network, Activity, Database, Users, GraduationCap, ArrowRight, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { getUserRoadmaps, getRoadmapProgress } from "@/lib/actions/roadmap-actions";
import Link from "next/link";

interface Metrics {
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

interface EnrolledRoadmap {
    roadmap_id: string;
    enrolled_at: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    roadmaps: any;
}

function formatNum(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toLocaleString();
}

export default function DashboardPage() {
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [enrolledRoadmaps, setEnrolledRoadmaps] = useState<EnrolledRoadmap[]>([]);
    const [progressMap, setProgressMap] = useState<Record<string, { completed: number; total: number }>>({});
    const [loadingRoadmaps, setLoadingRoadmaps] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<string>("");

    useEffect(() => {
        async function fetchMetrics() {
            try {
                const res = await fetch("/api/metrics");
                if (res.ok) {
                    const data = await res.json();
                    setMetrics(data);
                    setLastUpdated(new Date().toLocaleTimeString());
                }
            } catch { /* silent */ }
        }
        fetchMetrics();
        // Auto-refresh every 60 seconds
        const interval = setInterval(fetchMetrics, 60_000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        async function load() {
            const enrolled = await getUserRoadmaps() as EnrolledRoadmap[];
            setEnrolledRoadmaps(enrolled);
            const pMap: Record<string, { completed: number; total: number }> = {};
            await Promise.all(
                enrolled.map(async (e) => {
                    const p = await getRoadmapProgress(e.roadmap_id);
                    pMap[e.roadmap_id] = p;
                })
            );
            setProgressMap(pMap);
            setLoadingRoadmaps(false);
        }
        load();
    }, []);

    const stats = [
        {
            title: "Active Nodes",
            value: metrics ? formatNum(metrics.active_users) : "—",
            icon: Network,
            trend: metrics ? `${metrics.total_posts} posts · ${metrics.total_news} articles` : "Loading...",
        },
        {
            title: "Contributors",
            value: metrics ? formatNum(metrics.daily_contributors) : "—",
            icon: Users,
            trend: metrics ? `active today` : "Loading...",
        },
        {
            title: "Knowledge Base",
            value: metrics ? formatNum(metrics.total_documents) : "—",
            icon: Database,
            trend: metrics ? `${metrics.total_papers} papers · ${metrics.total_models} models` : "Loading...",
        },
        {
            title: "Query Volume",
            value: metrics ? formatNum(metrics.query_count) : "—",
            icon: Activity,
            trend: metrics ? `AI queries today` : "Loading...",
        },
    ];

    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            <motion.div variants={fadeInUp} className="flex items-end justify-between">
                <div>
                    <h2 className="text-3xl font-serif font-medium tracking-tight text-foreground">Terminal Overview</h2>
                    <p className="text-muted-foreground mt-1 font-light">Real-time metrics from your knowledge graph.</p>
                </div>
                {lastUpdated && (
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground/40 font-mono">
                        <RefreshCw className="size-3 animate-spin" style={{ animationDuration: "3s" }} />
                        {lastUpdated}
                    </div>
                )}
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                    <motion.div key={i} variants={fadeInUp} whileHover={{ y: -4, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}>
                        <Card className="glass-panel group shadow-lg hover:shadow-xl transition-all duration-500 border-border/50">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                                    {stat.title}
                                </CardTitle>
                                <div className="p-2 rounded-md bg-foreground/5 text-foreground/70 group-hover:bg-foreground group-hover:text-background transition-colors duration-500">
                                    <stat.icon className="size-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-serif font-medium mt-2">{stat.value}</div>
                                <p className="text-xs text-muted-foreground mt-2 font-mono">
                                    {stat.trend}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <motion.div variants={fadeInUp} className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 glass-panel border-border/50 shadow-lg">
                    <CardHeader>
                        <CardTitle className="font-serif">Network Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-end justify-between p-6 gap-3 border-t border-border/50 mt-4 relative">
                        {/* Abstract grid lines */}
                        <div className="absolute inset-0 grid grid-cols-12 opacity-10 pointer-events-none">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className="border-r border-foreground/50 h-full w-full" />
                            ))}
                        </div>
                        {/* Animated bars - derived from real metrics */}
                        {(() => {
                            const m = metrics;
                            const bars = m ? [
                                Math.min((m.total_posts || 1) * 5, 95),
                                Math.min((m.total_papers || 1) * 3, 90),
                                Math.min((m.total_models || 1) * 4, 85),
                                Math.min((m.total_news || 1) * 2, 80),
                                Math.min((m.active_users || 1) * 15, 95),
                                Math.min((m.daily_contributors || 1) * 20, 90),
                                Math.min((m.query_count || 1) * 10, 85),
                                Math.min((m.total_documents || 1) * 1, 80),
                                35, 55, 40, 60,
                            ] : [20, 40, 30, 70, 50, 90, 60, 80, 45, 65, 30, 50];
                            return bars.map((height, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${height}%` }}
                                    transition={{ duration: 1.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                                    className="w-full bg-foreground/10 hover:bg-foreground/30 transition-colors duration-500 rounded-t-sm z-10"
                                />
                            ));
                        })()}
                    </CardContent>
                </Card>

                {/* Learning Progress Widget */}
                <Card className="col-span-3 glass-panel border-border/50 shadow-lg">
                    <CardHeader className="border-b border-border/50 pb-4 mb-4 flex flex-row items-center justify-between">
                        <CardTitle className="font-serif">Learning Progress</CardTitle>
                        <Link href="/roadmaps" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                            Browse <ArrowRight className="size-3" />
                        </Link>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        {loadingRoadmaps ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <Skeleton className="size-8 rounded-md bg-muted/50" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-3 w-3/4 bg-muted/50" />
                                            <Skeleton className="h-2 w-full bg-muted/30" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : enrolledRoadmaps.length === 0 ? (
                            <div className="text-center py-8">
                                <GraduationCap className="size-6 mx-auto mb-3 text-muted-foreground/30" />
                                <p className="text-sm text-muted-foreground font-light">No roadmaps enrolled yet.</p>
                                <Link href="/roadmaps" className="text-xs text-foreground hover:text-muted-foreground transition-colors mt-2 inline-block">
                                    Explore roadmaps →
                                </Link>
                            </div>
                        ) : (
                            enrolledRoadmaps.slice(0, 4).map((e) => {
                                const p = progressMap[e.roadmap_id] || { completed: 0, total: 0 };
                                const pct = p.total > 0 ? Math.round((p.completed / p.total) * 100) : 0;
                                return (
                                    <Link key={e.roadmap_id} href={`/roadmaps/${e.roadmap_id}`} className="block group">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-md bg-muted/50 flex items-center justify-center shrink-0 border border-border/50 group-hover:bg-foreground transition-colors duration-500">
                                                <GraduationCap className="size-4 text-muted-foreground group-hover:text-background transition-colors duration-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-medium text-foreground truncate group-hover:text-muted-foreground transition-colors">
                                                        {e.roadmaps?.title}
                                                    </span>
                                                    <span className="text-xs font-mono text-muted-foreground ml-2">{pct}%</span>
                                                </div>
                                                <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                                                    <motion.div
                                                        className="h-full bg-foreground/60 rounded-full"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${pct}%` }}
                                                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
