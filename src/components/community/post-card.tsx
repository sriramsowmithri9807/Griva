"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MessageSquare, Share2 } from "lucide-react";
import { fadeInUp } from "@/lib/animations";
import { LikeButton } from "./like-button";
import Link from "next/link";

interface PostCardProps {
    post: {
        id: string;
        title: string;
        content: string | null;
        created_at: string;
        profiles: { id: string; username: string | null; full_name: string | null } | null;
        communities: { name: string; slug: string } | null;
        comments: { count: number }[];
        likes: { count: number }[];
    };
    liked?: boolean;
}

export function PostCard({ post, liked = false }: PostCardProps) {
    const authorName = post.profiles?.full_name || post.profiles?.username || "Anonymous";
    const authorInitials = authorName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
    const communitySlug = post.communities?.slug || "";
    const commentCount = post.comments?.[0]?.count ?? 0;
    const likeCount = post.likes?.[0]?.count ?? 0;
    const timeAgo = getTimeAgo(post.created_at);

    return (
        <motion.div variants={fadeInUp}>
            <Card className="glass-panel border-border/50 shadow-md group cursor-pointer hover:shadow-xl hover:border-foreground/20 transition-all duration-500">
                <CardHeader className="pb-3 border-b border-border/10 mb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-md bg-foreground flex items-center justify-center shrink-0 shadow-inner">
                                <span className="text-xs font-serif font-bold text-background">{authorInitials}</span>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-foreground">{authorName}</div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    {post.communities && (
                                        <>
                                            <Link
                                                href={`/communities/${communitySlug}`}
                                                className="hover:text-foreground transition-colors"
                                            >
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
                        {post.content && (
                            <p className="text-sm text-muted-foreground font-light leading-relaxed mb-4 line-clamp-3">
                                {post.content}
                            </p>
                        )}
                    </Link>
                    <div className="flex items-center gap-6 pt-4 border-t border-border/50 text-muted-foreground">
                        <LikeButton postId={post.id} initialCount={likeCount} initialLiked={liked} />
                        <Link
                            href={`/communities/${communitySlug}/post/${post.id}`}
                            className="flex items-center gap-2 hover:text-foreground transition-colors hover:bg-muted/50 p-2 rounded-md duration-300"
                        >
                            <MessageSquare className="size-4" />
                            <span className="text-sm font-medium font-mono">{commentCount}</span>
                        </Link>
                        <div className="flex items-center gap-2 hover:text-foreground transition-colors ml-auto hover:bg-muted/50 p-2 rounded-md -mr-2 duration-300">
                            <Share2 className="size-4" />
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
