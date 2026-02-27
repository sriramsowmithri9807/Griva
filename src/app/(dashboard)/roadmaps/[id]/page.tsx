"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import {
    getRoadmap,
    isEnrolled,
    enrollInRoadmap,
    unenrollFromRoadmap,
    getUserProgress,
    toggleTopicComplete,
} from "@/lib/actions/roadmap-actions";
import {
    BookOpen, ChevronDown, ChevronRight, CheckCircle2,
    Circle, ExternalLink, ArrowLeft, GraduationCap
} from "lucide-react";
import Link from "next/link";

interface Topic {
    id: string;
    title: string;
    resource_link: string | null;
    order_index: number;
}

interface Section {
    id: string;
    title: string;
    order_index: number;
    roadmap_topics: Topic[];
}

export default function RoadmapDetailPage() {
    const params = useParams();
    const roadmapId = params.id as string;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [roadmap, setRoadmap] = useState<any>(null);
    const [enrolled, setEnrolled] = useState(false);
    const [progress, setProgress] = useState<Record<string, boolean>>({});
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);

    useEffect(() => {
        async function load() {
            const [r, e] = await Promise.all([
                getRoadmap(roadmapId),
                isEnrolled(roadmapId),
            ]);
            setRoadmap(r);
            setEnrolled(e);

            if (e && r) {
                const p = await getUserProgress(roadmapId);
                setProgress(p);
                // Auto-expand first section
                if (r.roadmap_sections?.length > 0) {
                    setExpandedSections(new Set([r.roadmap_sections[0].id]));
                }
            }
            setLoading(false);
        }
        load();
    }, [roadmapId]);

    const toggleSection = useCallback((sectionId: string) => {
        setExpandedSections((prev) => {
            const next = new Set(prev);
            if (next.has(sectionId)) next.delete(sectionId);
            else next.add(sectionId);
            return next;
        });
    }, []);

    async function handleEnroll() {
        if (enrolling) return;
        setEnrolling(true);
        try {
            await enrollInRoadmap(roadmapId);
            setEnrolled(true);
            if (roadmap?.roadmap_sections?.length > 0) {
                setExpandedSections(new Set([roadmap.roadmap_sections[0].id]));
            }
        } catch (e) { console.error(e); }
        finally { setEnrolling(false); }
    }

    async function handleUnenroll() {
        if (enrolling) return;
        setEnrolling(true);
        try {
            await unenrollFromRoadmap(roadmapId);
            setEnrolled(false);
            setProgress({});
        } catch (e) { console.error(e); }
        finally { setEnrolling(false); }
    }

    async function handleToggleTopic(topicId: string) {
        // Optimistic update
        setProgress((prev) => ({ ...prev, [topicId]: !prev[topicId] }));
        try {
            await toggleTopicComplete(topicId);
        } catch {
            setProgress((prev) => ({ ...prev, [topicId]: !prev[topicId] }));
        }
    }

    if (loading) {
        return <div className="text-center py-16 text-muted-foreground font-mono text-sm animate-pulse">Loading roadmap...</div>;
    }

    if (!roadmap) {
        return <div className="text-center py-16 text-muted-foreground font-light">Roadmap not found.</div>;
    }

    const sections = (roadmap.roadmap_sections || []) as Section[];
    const allTopics = sections.flatMap((s) => s.roadmap_topics || []);
    const completedCount = allTopics.filter((t) => progress[t.id]).length;
    const totalCount = allTopics.length;
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="max-w-3xl mx-auto space-y-8"
        >
            {/* Back link */}
            <motion.div variants={fadeInUp}>
                <Link href="/roadmaps" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="size-4" />
                    All Roadmaps
                </Link>
            </motion.div>

            {/* Header */}
            <motion.div variants={fadeInUp} className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-border/50">
                <div>
                    <h2 className="text-3xl font-serif font-medium tracking-tight text-foreground">{roadmap.title}</h2>
                    {roadmap.category && (
                        <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-widest mt-2">
                            {roadmap.category}
                        </Badge>
                    )}
                    <p className="text-muted-foreground mt-2 font-light">{roadmap.description}</p>
                </div>
                <div>
                    {enrolled ? (
                        <Button onClick={handleUnenroll} disabled={enrolling} variant="outline" className="h-9 text-sm">
                            {enrolling ? "..." : "Unenroll"}
                        </Button>
                    ) : (
                        <Button onClick={handleEnroll} disabled={enrolling} className="h-9 text-sm bg-foreground text-background">
                            <GraduationCap className="size-3 mr-2" />
                            {enrolling ? "Enrolling..." : "Enroll"}
                        </Button>
                    )}
                </div>
            </motion.div>

            {/* Progress bar */}
            {enrolled && (
                <motion.div variants={fadeInUp}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground font-medium">Progress</span>
                        <span className="text-sm font-mono text-foreground">{completedCount}/{totalCount} topics · {progressPercent}%</span>
                    </div>
                    <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-foreground rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        />
                    </div>
                </motion.div>
            )}

            {/* Sections */}
            <div className="space-y-3">
                {sections.map((section, sectionIndex) => {
                    const isExpanded = expandedSections.has(section.id);
                    const topics = section.roadmap_topics || [];
                    const sectionCompleted = topics.filter((t) => progress[t.id]).length;

                    return (
                        <motion.div key={section.id} variants={fadeInUp}>
                            <Card className="glass-panel border-border/50 shadow-md overflow-hidden">
                                <button
                                    onClick={() => toggleSection(section.id)}
                                    className="w-full text-left"
                                >
                                    <CardHeader className="pb-3 flex flex-row items-center justify-between hover:bg-muted/20 transition-colors duration-300">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-mono text-muted-foreground/50 w-6">{String(sectionIndex + 1).padStart(2, "0")}</span>
                                            <CardTitle className="text-base font-serif font-medium">{section.title}</CardTitle>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {enrolled && (
                                                <span className="text-xs font-mono text-muted-foreground">
                                                    {sectionCompleted}/{topics.length}
                                                </span>
                                            )}
                                            {isExpanded ? (
                                                <ChevronDown className="size-4 text-muted-foreground" />
                                            ) : (
                                                <ChevronRight className="size-4 text-muted-foreground" />
                                            )}
                                        </div>
                                    </CardHeader>
                                </button>
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                        >
                                            <CardContent className="pt-0 border-t border-border/30">
                                                <div className="divide-y divide-border/20">
                                                    {topics.map((topic) => {
                                                        const isCompleted = progress[topic.id];
                                                        return (
                                                            <div
                                                                key={topic.id}
                                                                className="flex items-center gap-3 py-3 group"
                                                            >
                                                                {enrolled ? (
                                                                    <button
                                                                        onClick={() => handleToggleTopic(topic.id)}
                                                                        className="shrink-0"
                                                                    >
                                                                        {isCompleted ? (
                                                                            <CheckCircle2 className="size-5 text-foreground" />
                                                                        ) : (
                                                                            <Circle className="size-5 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
                                                                        )}
                                                                    </button>
                                                                ) : (
                                                                    <BookOpen className="size-4 text-muted-foreground/30 shrink-0" />
                                                                )}
                                                                <span
                                                                    className={`text-sm font-light flex-1 transition-colors ${isCompleted
                                                                            ? "text-muted-foreground line-through"
                                                                            : "text-foreground"
                                                                        }`}
                                                                >
                                                                    {topic.title}
                                                                </span>
                                                                {topic.resource_link && (
                                                                    <a
                                                                        href={topic.resource_link}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-muted-foreground/30 hover:text-foreground transition-colors"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        <ExternalLink className="size-3.5" />
                                                                    </a>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </CardContent>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}
