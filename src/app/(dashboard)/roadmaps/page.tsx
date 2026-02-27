"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { getRoadmaps } from "@/lib/actions/roadmap-actions";
import { BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Roadmap {
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    created_at: string;
    roadmap_sections: { count: number }[];
}

export default function RoadmapsPage() {
    const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getRoadmaps().then((data) => {
            setRoadmaps(data as Roadmap[]);
            setLoading(false);
        });
    }, []);

    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto space-y-8"
        >
            <div className="flex flex-col gap-3">
                <motion.h2 variants={fadeInUp} className="text-3xl font-serif font-medium tracking-tight text-foreground">
                    Learning Roadmaps
                </motion.h2>
                <motion.p variants={fadeInUp} className="text-muted-foreground font-light">
                    Structured career paths to accelerate your growth.
                </motion.p>
            </div>

            {loading ? (
                <div className="text-center py-16 text-muted-foreground font-mono text-sm animate-pulse">Loading roadmaps...</div>
            ) : roadmaps.length === 0 ? (
                <motion.div variants={fadeInUp} className="text-center py-16">
                    <BookOpen className="size-8 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-muted-foreground font-light">No roadmaps available yet.</p>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {roadmaps.map((roadmap) => (
                        <motion.div key={roadmap.id} variants={fadeInUp}>
                            <Link href={`/roadmaps/${roadmap.id}`}>
                                <Card className="glass-panel border-border/50 shadow-md group cursor-pointer hover:shadow-xl hover:border-foreground/20 transition-all duration-500 h-full">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-start justify-between">
                                            <CardTitle className="text-lg font-serif font-medium group-hover:text-muted-foreground transition-colors">
                                                {roadmap.title}
                                            </CardTitle>
                                            <ArrowRight className="size-4 text-muted-foreground/30 group-hover:text-foreground group-hover:translate-x-1 transition-all duration-300" />
                                        </div>
                                        {roadmap.category && (
                                            <CardDescription>
                                                <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-widest mt-1">
                                                    {roadmap.category}
                                                </Badge>
                                            </CardDescription>
                                        )}
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground font-light line-clamp-2 mb-3">
                                            {roadmap.description || "No description"}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
                                            <BookOpen className="size-3" />
                                            <span className="font-mono">{roadmap.roadmap_sections?.[0]?.count ?? 0} sections</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
