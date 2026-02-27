"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { Bot, SendHorizontal, User, Sparkles, Loader2, BookOpen, Users, GraduationCap, Newspaper } from "lucide-react";
import Link from "next/link";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface Recommendation {
    type: "community" | "roadmap" | "paper" | "post";
    id: string;
    title: string;
    description: string;
    reason: string;
}

const SUGGESTED_QUERIES = [
    "What should I learn next?",
    "Explain transformers in NLP",
    "Recommend communities for me",
    "Summarize recent AI research",
];

export default function AssistantPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loadingRecs, setLoadingRecs] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch("/api/ai/recommendations")
            .then((r) => r.json())
            .then(setRecommendations)
            .catch(() => { })
            .finally(() => setLoadingRecs(false));
    }, []);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, [messages]);

    async function handleSend(text?: string) {
        const msg = text || input.trim();
        if (!msg || loading) return;

        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: msg }]);
        setLoading(true);

        try {
            const res = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: msg, conversationId }),
            });

            const data = await res.json();
            if (data.conversationId) setConversationId(data.conversationId);
            setMessages((prev) => [...prev, { role: "assistant", content: data.response || "No response." }]);
        } catch {
            setMessages((prev) => [...prev, { role: "assistant", content: "Connection error. Please try again." }]);
        } finally {
            setLoading(false);
        }
    }

    const getRecIcon = (type: string) => {
        switch (type) {
            case "community": return Users;
            case "roadmap": return GraduationCap;
            case "paper": return BookOpen;
            default: return Newspaper;
        }
    };

    const getRecHref = (rec: Recommendation) => {
        switch (rec.type) {
            case "community": return `/communities/${rec.id}`;
            case "roadmap": return `/roadmaps/${rec.id}`;
            case "paper": return `/research`;
            default: return `/news`;
        }
    };

    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto flex flex-col"
            style={{ height: "calc(100vh - 120px)" }}
        >
            {/* Header */}
            <motion.div variants={fadeInUp} className="shrink-0 mb-6">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-md bg-foreground flex items-center justify-center">
                        <Sparkles className="size-5 text-background" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-serif font-medium tracking-tight text-foreground">Griva AI</h2>
                        <p className="text-xs text-muted-foreground font-mono">Knowledge assistant · RAG-powered</p>
                    </div>
                </div>
            </motion.div>

            {/* Chat area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-2 min-h-0">
                {messages.length === 0 ? (
                    <motion.div variants={fadeInUp} className="space-y-8 pt-8">
                        {/* Suggestions */}
                        <div>
                            <p className="text-xs font-mono text-muted-foreground/50 uppercase tracking-widest mb-3">Try asking</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {SUGGESTED_QUERIES.map((q) => (
                                    <button
                                        key={q}
                                        onClick={() => handleSend(q)}
                                        className="text-left p-3 rounded-md border border-border/30 text-sm text-muted-foreground font-light hover:bg-muted/30 hover:text-foreground hover:border-foreground/20 transition-all duration-300"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Recommendations */}
                        {!loadingRecs && recommendations.length > 0 && (
                            <div>
                                <p className="text-xs font-mono text-muted-foreground/50 uppercase tracking-widest mb-3">Recommended for you</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {recommendations.slice(0, 4).map((rec, i) => {
                                        const Icon = getRecIcon(rec.type);
                                        return (
                                            <Link key={i} href={getRecHref(rec)}>
                                                <Card className="glass-panel border-border/30 shadow-sm group hover:shadow-md hover:border-foreground/20 transition-all duration-300">
                                                    <CardContent className="p-3 flex items-start gap-3">
                                                        <div className="size-8 rounded-md bg-muted/50 flex items-center justify-center shrink-0 group-hover:bg-foreground transition-colors duration-300">
                                                            <Icon className="size-3.5 text-muted-foreground group-hover:text-background transition-colors duration-300" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-foreground truncate">{rec.title}</p>
                                                            <p className="text-[10px] font-mono text-muted-foreground/50">{rec.reason}</p>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <AnimatePresence>
                        {messages.map((msg, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
                            >
                                {msg.role === "assistant" && (
                                    <div className="size-8 rounded-md bg-foreground flex items-center justify-center shrink-0 mt-0.5">
                                        <Bot className="size-4 text-background" />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[80%] rounded-lg px-4 py-3 text-sm font-light leading-relaxed ${msg.role === "user"
                                            ? "bg-foreground text-background"
                                            : "bg-muted/30 border border-border/30 text-foreground"
                                        }`}
                                >
                                    <div className="whitespace-pre-wrap prose prose-sm prose-invert max-w-none [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2 [&_strong]:text-foreground">
                                        {msg.content}
                                    </div>
                                </div>
                                {msg.role === "user" && (
                                    <div className="size-8 rounded-md bg-muted flex items-center justify-center shrink-0 mt-0.5">
                                        <User className="size-4 text-foreground/70" />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                        {loading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex gap-3"
                            >
                                <div className="size-8 rounded-md bg-foreground flex items-center justify-center shrink-0">
                                    <Bot className="size-4 text-background" />
                                </div>
                                <div className="bg-muted/30 border border-border/30 rounded-lg px-4 py-3">
                                    <Loader2 className="size-4 text-muted-foreground animate-spin" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>

            {/* Input */}
            <motion.div variants={fadeInUp} className="shrink-0 pt-4">
                <div className="flex gap-3">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                        placeholder="Ask Griva AI anything..."
                        disabled={loading}
                        className="flex-1 h-11 px-4 rounded-md bg-background/50 border border-border/50 text-sm font-light focus:outline-none focus:ring-1 focus:ring-foreground/20 placeholder:text-muted-foreground/40 disabled:opacity-50"
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={!input.trim() || loading}
                        className="h-11 w-11 rounded-md bg-foreground text-background flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-30"
                    >
                        <SendHorizontal className="size-4" />
                    </button>
                </div>
                <p className="text-[10px] text-muted-foreground/40 text-center mt-2 font-mono">
                    Powered by Ollama · RAG-enhanced · Responses are AI-generated
                </p>
            </motion.div>
        </motion.div>
    );
}
