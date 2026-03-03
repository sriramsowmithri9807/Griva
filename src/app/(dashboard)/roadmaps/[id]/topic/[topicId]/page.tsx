"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import {
    getTopicContext,
    getTopicProblems,
    getUserSubmissions,
    submitProblemAnswer,
    toggleTopicComplete,
    getUserProgress,
} from "@/lib/actions/roadmap-actions";
import { getTopicContent } from "@/lib/topic-content";
import {
    ArrowLeft, ArrowRight, CheckCircle2, Circle, BookOpen,
    Code, HelpCircle, Lightbulb, ExternalLink, ChevronRight
} from "lucide-react";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────────────────
interface Problem {
    id: string;
    title: string;
    description: string;
    type: "mcq" | "coding" | "short_answer";
    difficulty: string;
    starter_code?: string | null;
    solution?: string | null;
    options?: string[] | null;
    correct_option?: number | null;
    hints?: string[] | null;
    order_index: number;
}

interface Submission {
    status: string;
    code?: string;
    answer?: string;
    selected_option?: number;
}

interface Topic { id: string; title: string; resource_link: string | null; order_index: number; }
interface Section { id: string; title: string; roadmap_id: string; }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Roadmap { id: string; title: string; roadmap_sections: any[] }

// ── Helpers ────────────────────────────────────────────────────────────────
function difficultyColor(d: string) {
    if (d === "advanced") return "text-red-400 border-red-400/30 bg-red-400/5";
    if (d === "intermediate") return "text-yellow-400 border-yellow-400/30 bg-yellow-400/5";
    return "text-green-400 border-green-400/30 bg-green-400/5";
}

function statusBadge(status: string) {
    if (status === "correct") return "text-green-400 bg-green-400/10 border-green-400/20";
    if (status === "incorrect") return "text-red-400 bg-red-400/10 border-red-400/20";
    return "text-cyan-400 bg-cyan-400/10 border-cyan-400/20";
}

// ── Main component ────────────────────────────────────────────────────────
export default function TopicDetailPage() {
    const params = useParams();
    const roadmapId = params.id as string;
    const topicId = params.topicId as string;

    const [loading, setLoading] = useState(true);
    const [topic, setTopic] = useState<Topic | null>(null);
    const [section, setSection] = useState<Section | null>(null);
    const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
    const [problems, setProblems] = useState<Problem[]>([]);
    const [submissions, setSubmissions] = useState<Record<string, Submission>>({});
    const [isCompleted, setIsCompleted] = useState(false);
    const [completing, setCompleting] = useState(false);

    // Problem interaction state
    const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({});
    const [codeAnswers, setCodeAnswers] = useState<Record<string, string>>({});
    const [shortAnswers, setShortAnswers] = useState<Record<string, string>>({});
    const [showHints, setShowHints] = useState<Record<string, boolean>>({});
    const [submitting, setSubmitting] = useState<Record<string, boolean>>({});

    const load = useCallback(async () => {
        const [ctx, probs] = await Promise.all([
            getTopicContext(topicId),
            getTopicProblems(topicId),
        ]);

        if (!ctx) { setLoading(false); return; }

        setTopic(ctx.topic as unknown as Topic);
        setSection(ctx.section as unknown as Section);
        setRoadmap(ctx.roadmap as unknown as Roadmap);
        setProblems(probs as Problem[]);

        // Load submissions and progress
        const [subs, progress] = await Promise.all([
            getUserSubmissions(topicId),
            getUserProgress(ctx.roadmap.id as string),
        ]);
        setSubmissions(subs);

        const progressMap = progress as Record<string, boolean>;
        setIsCompleted(!!progressMap[topicId]);

        // Pre-fill answers from previous submissions
        const opts: Record<string, number> = {};
        const codes: Record<string, string> = {};
        const shorts: Record<string, string> = {};
        for (const [problemId, sub] of Object.entries(subs)) {
            if (sub.selected_option !== undefined && sub.selected_option !== null) opts[problemId] = sub.selected_option;
            if (sub.code) codes[problemId] = sub.code;
            if (sub.answer) shorts[problemId] = sub.answer;
        }
        setSelectedOptions(opts);
        setCodeAnswers(codes);
        setShortAnswers(shorts);

        setLoading(false);
    }, [topicId]);

    useEffect(() => { load(); }, [load]);

    // ── Navigation helpers ─────────────────────────────────────────────────
    const { prevTopic, nextTopic } = (() => {
        if (!roadmap) return { prevTopic: null, nextTopic: null };
        const allTopics: Topic[] = roadmap.roadmap_sections.flatMap(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (s: any) => (s.roadmap_topics ?? []) as Topic[]
        );
        const idx = allTopics.findIndex(t => t.id === topicId);
        return {
            prevTopic: idx > 0 ? allTopics[idx - 1] : null,
            nextTopic: idx < allTopics.length - 1 ? allTopics[idx + 1] : null,
        };
    })();

    // ── Handlers ──────────────────────────────────────────────────────────
    async function handleMCQSubmit(problem: Problem) {
        const selected = selectedOptions[problem.id];
        if (selected === undefined) return;

        setSubmitting(s => ({ ...s, [problem.id]: true }));
        const isCorrect = selected === problem.correct_option;
        const status = isCorrect ? "correct" : "incorrect";

        try {
            await submitProblemAnswer(problem.id, { selected_option: selected, status });
            setSubmissions(s => ({ ...s, [problem.id]: { status, selected_option: selected } }));
        } catch { /* silent */ }
        setSubmitting(s => ({ ...s, [problem.id]: false }));
    }

    async function handleCodeSubmit(problem: Problem) {
        const code = codeAnswers[problem.id] ?? "";
        setSubmitting(s => ({ ...s, [problem.id]: true }));
        try {
            await submitProblemAnswer(problem.id, { code, status: "submitted" });
            setSubmissions(s => ({ ...s, [problem.id]: { status: "submitted", code } }));
        } catch { /* silent */ }
        setSubmitting(s => ({ ...s, [problem.id]: false }));
    }

    async function handleShortSubmit(problem: Problem) {
        const answer = shortAnswers[problem.id] ?? "";
        setSubmitting(s => ({ ...s, [problem.id]: true }));
        try {
            await submitProblemAnswer(problem.id, { answer, status: "submitted" });
            setSubmissions(s => ({ ...s, [problem.id]: { status: "submitted", answer } }));
        } catch { /* silent */ }
        setSubmitting(s => ({ ...s, [problem.id]: false }));
    }

    async function handleMarkComplete() {
        if (completing) return;
        setCompleting(true);
        try {
            const result = await toggleTopicComplete(topicId);
            setIsCompleted(result.completed);
        } catch { /* silent */ }
        setCompleting(false);
    }

    // ── Tab handling in textarea ───────────────────────────────────────────
    function handleTabInEditor(e: React.KeyboardEvent<HTMLTextAreaElement>, problemId: string) {
        if (e.key === "Tab") {
            e.preventDefault();
            const ta = e.currentTarget;
            const start = ta.selectionStart;
            const end = ta.selectionEnd;
            const newVal = ta.value.substring(0, start) + "  " + ta.value.substring(end);
            setCodeAnswers(c => ({ ...c, [problemId]: newVal }));
            // Restore cursor position after React re-render
            requestAnimationFrame(() => {
                ta.selectionStart = ta.selectionEnd = start + 2;
            });
        }
    }

    // ── Loading / Error states ─────────────────────────────────────────────
    if (loading) {
        return (
            <div className="text-center py-16 text-muted-foreground font-mono text-sm animate-pulse">
                Loading topic...
            </div>
        );
    }

    if (!topic || !section || !roadmap) {
        return (
            <div className="text-center py-16 text-muted-foreground font-light">
                Topic not found.
            </div>
        );
    }

    const content = getTopicContent(topic.title);

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="max-w-7xl mx-auto space-y-6"
        >
            {/* Breadcrumb */}
            <motion.div variants={fadeInUp} className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                <Link href="/roadmaps" className="hover:text-foreground transition-colors">Roadmaps</Link>
                <ChevronRight className="size-3.5" />
                <Link href={`/roadmaps/${roadmapId}`} className="hover:text-foreground transition-colors">
                    {roadmap.title}
                </Link>
                <ChevronRight className="size-3.5" />
                <span className="text-muted-foreground/60">{section.title}</span>
                <ChevronRight className="size-3.5" />
                <span className="text-foreground font-medium truncate max-w-xs">{topic.title}</span>
            </motion.div>

            {/* Title row */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-serif font-medium tracking-tight text-foreground">{topic.title}</h1>
                    <p className="text-sm text-muted-foreground font-light">{section.title} · {roadmap.title}</p>
                </div>
                <Button
                    onClick={handleMarkComplete}
                    disabled={completing}
                    variant={isCompleted ? "outline" : "default"}
                    className="shrink-0 h-9 text-sm gap-2"
                >
                    {isCompleted
                        ? <><CheckCircle2 className="size-4 text-green-400" /> Completed</>
                        : <><Circle className="size-4" /> Mark Complete</>
                    }
                </Button>
            </motion.div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

                {/* ── Left: Reading Content ─────────────────────────────── */}
                <motion.div variants={fadeInUp} className="space-y-4">

                    {/* Overview */}
                    <Card className="glass-panel border-border/50 shadow-md">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base font-serif font-medium">
                                <BookOpen className="size-4 text-cyan-400" />
                                Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground leading-relaxed font-light">{content.overview}</p>
                        </CardContent>
                    </Card>

                    {/* Key Points */}
                    <Card className="glass-panel border-border/50 shadow-md">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base font-serif font-medium">
                                <Lightbulb className="size-4 text-yellow-400" />
                                Key Points
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {content.keyPoints.map((pt, i) => (
                                    <li key={i} className="flex gap-2 text-sm text-muted-foreground font-light">
                                        <span className="text-cyan-400/60 font-mono text-xs mt-0.5 shrink-0">
                                            {String(i + 1).padStart(2, "0")}
                                        </span>
                                        <span>{pt}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Code Example */}
                    {content.codeExample && (
                        <Card className="glass-panel border-border/50 shadow-md">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base font-serif font-medium">
                                    <Code className="size-4 text-purple-400" />
                                    Code Example
                                    {content.language && (
                                        <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-widest ml-auto">
                                            {content.language}
                                        </Badge>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <pre className="text-xs font-mono text-foreground/80 bg-muted/30 rounded-lg p-4 overflow-x-auto whitespace-pre leading-relaxed border border-border/30">
                                    <code>{content.codeExample}</code>
                                </pre>
                            </CardContent>
                        </Card>
                    )}

                    {/* Best Practices */}
                    <Card className="glass-panel border-border/50 shadow-md">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base font-serif font-medium">
                                <CheckCircle2 className="size-4 text-green-400" />
                                Best Practices
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {content.bestPractices.map((bp, i) => (
                                    <li key={i} className="flex gap-2 text-sm text-muted-foreground font-light">
                                        <span className="text-green-400 mt-0.5 shrink-0">✓</span>
                                        <span>{bp}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Resources */}
                    {content.resources.length > 0 && (
                        <Card className="glass-panel border-border/50 shadow-md">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base font-serif font-medium">
                                    <ExternalLink className="size-4 text-blue-400" />
                                    Learn More
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {content.resources.map((r, i) => (
                                        <li key={i}>
                                            <a
                                                href={r.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors underline underline-offset-2 font-light"
                                            >
                                                {r.title}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}
                </motion.div>

                {/* ── Right: Practice Problems ───────────────────────────── */}
                <motion.div variants={fadeInUp} className="space-y-4">
                    {problems.length === 0 ? (
                        <Card className="glass-panel border-border/50 shadow-md">
                            <CardContent className="py-12 text-center">
                                <HelpCircle className="size-8 mx-auto mb-3 text-muted-foreground/30" />
                                <p className="text-sm text-muted-foreground font-light">
                                    No practice problems yet for this topic.
                                </p>
                                <p className="text-xs text-muted-foreground/60 mt-1">
                                    Run the seed endpoint to generate problems.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        problems.map((problem) => {
                            const sub = submissions[problem.id];
                            const isSubmitting = !!submitting[problem.id];

                            return (
                                <Card key={problem.id} className="glass-panel border-border/50 shadow-md">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="space-y-1 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Badge
                                                        variant="outline"
                                                        className={`font-mono text-[10px] uppercase tracking-widest ${difficultyColor(problem.difficulty)}`}
                                                    >
                                                        {problem.difficulty}
                                                    </Badge>
                                                    <Badge
                                                        variant="outline"
                                                        className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
                                                    >
                                                        {problem.type === "mcq" ? "Multiple Choice" : problem.type === "coding" ? "Coding" : "Short Answer"}
                                                    </Badge>
                                                    {sub && (
                                                        <Badge variant="outline" className={`font-mono text-[10px] uppercase tracking-widest ${statusBadge(sub.status)}`}>
                                                            {sub.status}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <CardTitle className="text-sm font-serif font-medium leading-snug">
                                                    {problem.title}
                                                </CardTitle>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <p className="text-sm text-muted-foreground font-light leading-relaxed">
                                            {problem.description}
                                        </p>

                                        {/* MCQ */}
                                        {problem.type === "mcq" && problem.options && (
                                            <div className="space-y-2">
                                                {problem.options.map((opt, i) => {
                                                    const isSelected = selectedOptions[problem.id] === i;
                                                    const submitted = !!sub;
                                                    const isCorrectAns = i === problem.correct_option;
                                                    let cls = "border border-border/40 text-muted-foreground hover:border-cyan-400/40 hover:text-foreground";
                                                    if (submitted) {
                                                        if (isCorrectAns) cls = "border border-green-400/50 text-green-300 bg-green-400/5";
                                                        else if (isSelected && !isCorrectAns) cls = "border border-red-400/50 text-red-300 bg-red-400/5";
                                                        else cls = "border border-border/20 text-muted-foreground/50";
                                                    } else if (isSelected) {
                                                        cls = "border border-cyan-400/50 text-cyan-300 bg-cyan-400/5";
                                                    }

                                                    return (
                                                        <button
                                                            key={i}
                                                            disabled={submitted}
                                                            onClick={() => setSelectedOptions(s => ({ ...s, [problem.id]: i }))}
                                                            className={`w-full text-left text-sm rounded-lg px-4 py-2.5 transition-all duration-200 ${cls}`}
                                                        >
                                                            <span className="font-mono text-xs mr-2 opacity-60">{String.fromCharCode(65 + i)}.</span>
                                                            {opt}
                                                        </button>
                                                    );
                                                })}
                                                {!sub && (
                                                    <Button
                                                        onClick={() => handleMCQSubmit(problem)}
                                                        disabled={selectedOptions[problem.id] === undefined || isSubmitting}
                                                        className="w-full h-8 text-sm mt-2"
                                                        size="sm"
                                                    >
                                                        {isSubmitting ? "Checking..." : "Submit Answer"}
                                                    </Button>
                                                )}
                                            </div>
                                        )}

                                        {/* Coding */}
                                        {problem.type === "coding" && (
                                            <div className="space-y-2">
                                                <textarea
                                                    className="w-full h-36 font-mono text-xs bg-muted/30 text-foreground rounded-lg p-3 border border-border/40 focus:outline-none focus:border-cyan-400/50 resize-y"
                                                    placeholder={problem.starter_code ?? "// Write your solution here..."}
                                                    value={codeAnswers[problem.id] ?? problem.starter_code ?? ""}
                                                    onChange={e => setCodeAnswers(c => ({ ...c, [problem.id]: e.target.value }))}
                                                    onKeyDown={e => handleTabInEditor(e, problem.id)}
                                                    spellCheck={false}
                                                />
                                                <Button
                                                    onClick={() => handleCodeSubmit(problem)}
                                                    disabled={isSubmitting}
                                                    className="w-full h-8 text-sm"
                                                    variant={sub?.status === "submitted" ? "outline" : "default"}
                                                    size="sm"
                                                >
                                                    {isSubmitting ? "Saving..." : sub?.status === "submitted" ? "Update Submission" : "Submit Code"}
                                                </Button>
                                            </div>
                                        )}

                                        {/* Short Answer */}
                                        {problem.type === "short_answer" && (
                                            <div className="space-y-2">
                                                <textarea
                                                    className="w-full h-20 text-sm bg-muted/30 text-foreground rounded-lg p-3 border border-border/40 focus:outline-none focus:border-cyan-400/50 resize-y"
                                                    placeholder="Write your answer here..."
                                                    value={shortAnswers[problem.id] ?? ""}
                                                    onChange={e => setShortAnswers(s => ({ ...s, [problem.id]: e.target.value }))}
                                                />
                                                <Button
                                                    onClick={() => handleShortSubmit(problem)}
                                                    disabled={isSubmitting || !(shortAnswers[problem.id]?.trim())}
                                                    className="w-full h-8 text-sm"
                                                    variant={sub?.status === "submitted" ? "outline" : "default"}
                                                    size="sm"
                                                >
                                                    {isSubmitting ? "Saving..." : sub?.status === "submitted" ? "Update Answer" : "Submit Answer"}
                                                </Button>
                                            </div>
                                        )}

                                        {/* Hints */}
                                        {problem.hints && problem.hints.length > 0 && (
                                            <div>
                                                <button
                                                    onClick={() => setShowHints(h => ({ ...h, [problem.id]: !h[problem.id] }))}
                                                    className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors flex items-center gap-1"
                                                >
                                                    <Lightbulb className="size-3" />
                                                    {showHints[problem.id] ? "Hide hints" : "Show hint"}
                                                </button>
                                                {showHints[problem.id] && (
                                                    <div className="mt-2 p-3 rounded-lg bg-yellow-400/5 border border-yellow-400/20 text-xs text-yellow-300/80 font-light">
                                                        {problem.hints[0]}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </motion.div>
            </div>

            {/* Navigation */}
            <motion.div variants={fadeInUp} className="flex items-center justify-between pt-4 border-t border-border/30">
                <div>
                    {prevTopic ? (
                        <Link href={`/roadmaps/${roadmapId}/topic/${prevTopic.id}`}>
                            <Button variant="outline" className="gap-2 h-9 text-sm">
                                <ArrowLeft className="size-3.5" />
                                <span className="max-w-[180px] truncate">{prevTopic.title}</span>
                            </Button>
                        </Link>
                    ) : (
                        <Link href={`/roadmaps/${roadmapId}`}>
                            <Button variant="outline" className="gap-2 h-9 text-sm">
                                <ArrowLeft className="size-3.5" />
                                Back to Roadmap
                            </Button>
                        </Link>
                    )}
                </div>
                <div>
                    {nextTopic ? (
                        <Link href={`/roadmaps/${roadmapId}/topic/${nextTopic.id}`}>
                            <Button className="gap-2 h-9 text-sm bg-foreground text-background">
                                <span className="max-w-[180px] truncate">{nextTopic.title}</span>
                                <ArrowRight className="size-3.5" />
                            </Button>
                        </Link>
                    ) : (
                        <Link href={`/roadmaps/${roadmapId}`}>
                            <Button className="gap-2 h-9 text-sm bg-foreground text-background">
                                Finish Roadmap
                                <CheckCircle2 className="size-3.5" />
                            </Button>
                        </Link>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
