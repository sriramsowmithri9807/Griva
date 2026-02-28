"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { getPost } from "@/lib/actions/post-actions";
import { getComments } from "@/lib/actions/comment-actions";
import { getVoteStatus } from "@/lib/actions/vote-actions";
import { getCommunityRole } from "@/lib/actions/community-actions";
import { VoteButton } from "@/components/community/vote-button";
import { CommentThread } from "@/components/community/comment-thread";
import { MessageSquare, ArrowLeft, Link2, Lock } from "lucide-react";
import Link from "next/link";
import { useRealtimeTable } from "@/hooks/use-realtime";

export default function PostPage() {
    const params = useParams();
    const slug = params.slug as string;
    const postId = params.postId as string;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [post, setPost] = useState<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [comments, setComments] = useState<any[]>([]);
    const [myVote, setMyVote] = useState<1 | -1 | 0>(0);
    const [myRole, setMyRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Realtime: new comments appear live
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useRealtimeTable<any>("comments", {
        onInsert: (row) => {
            if (row.post_id === postId) {
                setComments((prev) => [...prev, { ...row, replies: [] }]);
            }
        },
    });

    useEffect(() => {
        async function load() {
            const [p, c, votes] = await Promise.all([
                getPost(postId),
                getComments(postId),
                getVoteStatus([postId]),
            ]);
            setPost(p);
            setComments(c);
            setMyVote(votes[postId] ?? 0);
            if (p?.communities?.id || p?.community_id) {
                const role = await getCommunityRole(p.community_id ?? p.communities?.id);
                setMyRole(role);
            }
            setLoading(false);
        }
        load();
    }, [postId]);

    if (loading) return <div className="text-center py-16 text-muted-foreground font-mono text-sm animate-pulse">Loading post...</div>;
    if (!post) return <div className="text-center py-16 text-muted-foreground font-light">Post not found.</div>;

    const authorName = post.profiles?.full_name || post.profiles?.username || "Anonymous";
    const authorInitials = authorName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
    const commentCount = post.comments?.[0]?.count ?? 0;
    const timeAgo = getTimeAgo(post.created_at);
    const isAdmin = myRole === "admin" || myRole === "moderator";

    return (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-3xl mx-auto space-y-6">
            <motion.div variants={fadeInUp}>
                <Link href={`/communities/${slug}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="size-4" />
                    Back to g/{post.communities?.name}
                </Link>
            </motion.div>

            <motion.div variants={fadeInUp}>
                <Card className="glass-panel border-border/50 shadow-lg">
                    <CardHeader className="pb-3 border-b border-border/10 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-md bg-foreground flex items-center justify-center shrink-0 shadow-inner">
                                <span className="text-xs font-serif font-bold text-background">{authorInitials}</span>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-foreground">{authorName}</span>
                                    {post.is_locked && <Lock className="size-3 text-yellow-500/60" />}
                                </div>
                                <div className="text-xs text-muted-foreground">{timeAgo}</div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <h1 className="text-2xl font-serif font-medium text-foreground mb-4">{post.title}</h1>

                        {post.post_type === "link" && post.link_url && (
                            <a href={post.link_url} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm text-blue-400/80 hover:text-blue-400 mb-4 font-mono">
                                <Link2 className="size-4" />
                                {post.link_url}
                            </a>
                        )}
                        {post.post_type === "image" && post.image_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={post.image_url} alt={post.title} className="w-full rounded-lg mb-4 max-h-[500px] object-contain bg-muted/20" />
                        )}
                        {post.content && (
                            <p className="text-muted-foreground font-light leading-relaxed whitespace-pre-wrap">{post.content}</p>
                        )}

                        <div className="flex items-center gap-6 pt-6 mt-6 border-t border-border/50 text-muted-foreground">
                            <VoteButton
                                postId={post.id}
                                initialUpvotes={post.upvotes ?? 0}
                                initialDownvotes={post.downvotes ?? 0}
                                initialVote={myVote}
                            />
                            <div className="flex items-center gap-2">
                                <MessageSquare className="size-4" />
                                <span className="text-sm font-medium font-mono">{commentCount}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
                <h3 className="text-lg font-serif font-medium text-foreground mb-4">
                    Discussion {post.is_locked && <span className="text-xs font-mono text-yellow-500/60 ml-2">(locked)</span>}
                </h3>
                <CommentThread postId={post.id} comments={comments} isLocked={!!post.is_locked} isAdmin={isAdmin} />
            </motion.div>
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
    return `${Math.floor(seconds / 86400)}d ago`;
}
