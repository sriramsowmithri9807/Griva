"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MessageSquare, Share2, Link2, Image, MessageCircle, AlignLeft, Copy, Check, Trash2, Lock } from "lucide-react";
import { fadeInUp } from "@/lib/animations";
import { ImpactButton } from "./impact-button";
import Link from "next/link";
import { deletePost, lockPost } from "@/lib/actions/post-actions";
import { useRouter } from "next/navigation";

const TYPE_ICONS: Record<string, React.ElementType> = {
    text: AlignLeft,
    link: Link2,
    image: Image,
    discussion: MessageCircle,
};

const TYPE_COLORS: Record<string, string> = {
    text: "text-muted-foreground/40",
    link: "text-blue-400/60",
    image: "text-purple-400/60",
    discussion: "text-green-400/60",
};

interface PostCardProps {
    post: {
        id: string;
        title: string;
        content: string | null;
        post_type?: string;
        link_url?: string | null;
        image_url?: string | null;
        is_locked?: boolean;
        created_at: string;
        insights?: number;
        challenges?: number;
        impact_score?: number;
        profiles: { id: string; username: string | null; full_name: string | null; avatar_url?: string | null } | null;
        communities: { name: string; slug: string } | null;
        responses: { count: number }[];
    };
    myInteraction?: 1 | -1 | 0;
    isAdmin?: boolean;
}

export function PostCard({ post, myInteraction = 0, isAdmin = false }: PostCardProps) {
    const authorName = post.profiles?.full_name || post.profiles?.username || "Anonymous";
    const authorInitials = authorName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
    const communitySlug = post.communities?.slug || "";
    const responseCount = post.responses?.[0]?.count ?? 0;
    const timeAgo = getTimeAgo(post.created_at);
    const postType = post.post_type ?? "text";
    const TypeIcon = TYPE_ICONS[postType] ?? AlignLeft;
    const [copied, setCopied] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const router = useRouter();

    function copyLink() {
        const url = `${window.location.origin}/communities/${communitySlug}/post/${post.id}`;
        navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
    }

    async function handleDelete() {
        if (!confirm("Delete this post?")) return;
        setDeleting(true);
        try { await deletePost(post.id); router.refresh(); }
        catch (e) { console.error(e); setDeleting(false); }
    }

    async function handleLock() {
        try { await lockPost(post.id, !post.is_locked); router.refresh(); }
        catch (e) { console.error(e); }
    }

    return (
        <motion.div variants={fadeInUp}>
            <Card className="glass-panel border-border/50 shadow-md group hover:shadow-xl hover:border-foreground/20 transition-all duration-500">
                {/* Image preview */}
                {postType === "image" && post.image_url && (
                    <div className="rounded-t-xl overflow-hidden h-48 bg-muted/20">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                )}

                <CardHeader className="pb-3 border-b border-border/10 mb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-md bg-foreground flex items-center justify-center shrink-0 shadow-inner">
                                <span className="text-xs font-serif font-bold text-background">{authorInitials}</span>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-foreground">{authorName}</span>
                                    <TypeIcon className={`size-3 ${TYPE_COLORS[postType]}`} />
                                    {post.is_locked && <Lock className="size-3 text-yellow-500/60" />}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    {post.communities && (
                                        <>
                                            <Link href={`/communities/${communitySlug}`} className="hover:text-foreground transition-colors">
                                                g/{post.communities.name}
                                            </Link>
                                            <span>·</span>
                                        </>
                                    )}
                                    <span>{timeAgo}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <Link href={`/communities/${communitySlug}/post/${post.id}`}>
                        <h3 className="text-lg font-serif font-medium text-foreground mb-2 group-hover:text-muted-foreground transition-colors">
                            {post.title}
                        </h3>
                        {postType === "link" && post.link_url && (
                            <a href={post.link_url} target="_blank" rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1.5 text-xs text-blue-400/80 hover:text-blue-400 mb-3 font-mono truncate max-w-full">
                                <Link2 className="size-3 shrink-0" />
                                <span className="truncate">{post.link_url}</span>
                            </a>
                        )}
                        {post.content && (
                            <p className="text-sm text-muted-foreground font-light leading-relaxed mb-4 line-clamp-3">
                                {post.content}
                            </p>
                        )}
                    </Link>

                    <div className="flex items-center gap-4 pt-4 border-t border-border/50 text-muted-foreground">
                        <ImpactButton
                            postId={post.id}
                            initialInsights={post.insights ?? 0}
                            initialChallenges={post.challenges ?? 0}
                            initialInteraction={myInteraction}
                        />
                        <Link href={`/communities/${communitySlug}/post/${post.id}`}
                            className="flex items-center gap-2 hover:text-foreground transition-colors hover:bg-muted/50 px-2 py-1.5 rounded-md duration-300">
                            <MessageSquare className="size-4" />
                            <span className="text-sm font-medium font-mono">{responseCount}</span>
                        </Link>
                        <div className="ml-auto flex items-center gap-1">
                            {isAdmin && (
                                <>
                                    <button onClick={handleLock}
                                        className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-xs hover:bg-muted/50 transition-colors ${post.is_locked ? "text-yellow-500" : "text-muted-foreground/50"}`}>
                                        <Lock className="size-3.5" />
                                    </button>
                                    <button onClick={handleDelete} disabled={deleting}
                                        className="flex items-center gap-1 px-2 py-1.5 rounded-md text-xs text-muted-foreground/50 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                                        <Trash2 className="size-3.5" />
                                    </button>
                                </>
                            )}
                            <button onClick={copyLink}
                                className="flex items-center gap-2 hover:text-foreground transition-colors hover:bg-muted/50 px-2 py-1.5 rounded-md duration-300">
                                {copied ? <Check className="size-4 text-green-400" /> : <Share2 className="size-4" />}
                            </button>
                            <button onClick={copyLink} className="sr-only">Copy link</button>
                            <Copy className="size-3 hidden" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

function getTimeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
}
