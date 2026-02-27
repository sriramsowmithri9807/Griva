"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPost } from "@/lib/actions/post-actions";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";
import { Hexagon } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";

interface CreatePostFormProps {
    communityId: string;
}

export function CreatePostForm({ communityId }: CreatePostFormProps) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const router = useRouter();
    const { profile, user } = useAuth();

    const initials = (profile?.full_name || user?.email || "?")
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    async function handleSubmit() {
        if (!title.trim() || loading) return;
        setLoading(true);
        try {
            await createPost(communityId, title.trim(), content.trim());
            setTitle("");
            setContent("");
            setExpanded(false);
            router.refresh();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    return (
        <motion.div variants={fadeInUp}>
            <Card className="glass-panel border-border/50 shadow-lg">
                <CardContent className="pt-6">
                    <div className="flex gap-4">
                        <div className="size-10 rounded-md bg-foreground flex items-center justify-center shrink-0 shadow-inner">
                            <span className="text-xs font-serif font-bold text-background">{initials}</span>
                        </div>
                        <div className="flex-1 space-y-3">
                            {!expanded ? (
                                <div
                                    onClick={() => setExpanded(true)}
                                    className="h-12 rounded-md bg-background/50 border border-border/50 px-4 font-serif text-muted-foreground text-sm flex items-center italic hover:bg-background/80 transition-colors duration-500 cursor-text"
                                >
                                    Share a thought, hypothesis, or finding...
                                </div>
                            ) : (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                                    <input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Title"
                                        className="w-full h-10 rounded-md bg-background/50 border border-border/50 px-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-foreground/20 placeholder:text-muted-foreground/50"
                                    />
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Elaborate on your thought... (optional)"
                                        className="w-full h-24 rounded-md bg-background/50 border border-border/50 p-4 font-light text-sm resize-none focus:outline-none focus:ring-1 focus:ring-foreground/20 placeholder:text-muted-foreground/50"
                                    />
                                    <div className="flex justify-between items-center">
                                        <div className="flex gap-2">
                                            <div className="h-8 px-3 rounded-md bg-muted/50 flex items-center justify-center text-xs text-foreground cursor-pointer hover:bg-muted transition-colors">
                                                <Hexagon className="size-3 mr-2" /> Add Tag
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => { setExpanded(false); setTitle(""); setContent(""); }}
                                                className="h-9 px-4 rounded-md text-sm text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSubmit}
                                                disabled={!title.trim() || loading}
                                                className="h-9 px-4 rounded-md bg-foreground text-background flex items-center justify-center text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
                                            >
                                                {loading ? "Publishing..." : "Publish"}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
