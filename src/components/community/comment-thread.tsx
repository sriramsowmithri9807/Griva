"use client";

import { useState } from "react";
import { createComment } from "@/lib/actions/comment-actions";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, CornerDownRight, SendHorizontal } from "lucide-react";

interface Comment {
    id: string;
    content: string;
    created_at: string;
    profiles: { id: string; username: string | null; full_name: string | null } | null;
    replies: Comment[];
}

interface CommentThreadProps {
    postId: string;
    comments: Comment[];
}

export function CommentThread({ postId, comments: initialComments }: CommentThreadProps) {
    const [comments, setComments] = useState(initialComments);
    const [rootContent, setRootContent] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmitRoot() {
        if (!rootContent.trim() || loading) return;
        setLoading(true);
        try {
            const newComment = await createComment(postId, rootContent.trim());
            setComments([...comments, { ...newComment, replies: [] }]);
            setRootContent("");
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            {/* Root comment input */}
            <div className="flex gap-3">
                <div className="flex-1">
                    <textarea
                        value={rootContent}
                        onChange={(e) => setRootContent(e.target.value)}
                        placeholder="Share your thoughts..."
                        className="w-full h-20 rounded-md bg-background/50 border border-border/50 p-3 text-sm font-light resize-none focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all placeholder:text-muted-foreground/50"
                    />
                    <div className="flex justify-end mt-2">
                        <Button
                            onClick={handleSubmitRoot}
                            disabled={!rootContent.trim() || loading}
                            size="sm"
                            className="bg-foreground text-background text-xs h-8 px-4"
                        >
                            <SendHorizontal className="size-3 mr-2" />
                            Comment
                        </Button>
                    </div>
                </div>
            </div>

            {/* Comment list */}
            <div className="space-y-1">
                <AnimatePresence>
                    {comments.map((comment) => (
                        <CommentNode key={comment.id} comment={comment} postId={postId} depth={0} />
                    ))}
                </AnimatePresence>
                {comments.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm font-light">
                        <MessageSquare className="size-5 mx-auto mb-2 opacity-40" />
                        No comments yet. Be the first to share your thoughts.
                    </div>
                )}
            </div>
        </div>
    );
}

function CommentNode({ comment, postId, depth }: { comment: Comment; postId: string; depth: number }) {
    const [showReply, setShowReply] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const [replies, setReplies] = useState(comment.replies);
    const [loading, setLoading] = useState(false);

    const authorName = comment.profiles?.full_name || comment.profiles?.username || "Anonymous";
    const initials = authorName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
    const timeAgo = getTimeAgo(comment.created_at);

    async function handleReply() {
        if (!replyContent.trim() || loading) return;
        setLoading(true);
        try {
            const newReply = await createComment(postId, replyContent.trim(), comment.id);
            setReplies([...replies, { ...newReply, replies: [] }]);
            setReplyContent("");
            setShowReply(false);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`${depth > 0 ? "ml-6 pl-4 border-l border-border/20" : ""}`}
        >
            <div className="py-3 group">
                <div className="flex gap-3">
                    <div className="size-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-serif font-bold text-foreground/70">{initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-foreground">{authorName}</span>
                            <span className="text-xs text-muted-foreground">{timeAgo}</span>
                        </div>
                        <p className="text-sm text-muted-foreground font-light leading-relaxed">{comment.content}</p>
                        {depth < 3 && (
                            <button
                                onClick={() => setShowReply(!showReply)}
                                className="flex items-center gap-1 mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <CornerDownRight className="size-3" />
                                Reply
                            </button>
                        )}
                    </div>
                </div>

                {showReply && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="ml-11 mt-3"
                    >
                        <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Write a reply..."
                            className="w-full h-16 rounded-md bg-background/50 border border-border/50 p-2.5 text-sm font-light resize-none focus:outline-none focus:ring-1 focus:ring-foreground/20 placeholder:text-muted-foreground/50"
                        />
                        <div className="flex justify-end gap-2 mt-1.5">
                            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setShowReply(false)}>
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                className="h-7 text-xs bg-foreground text-background"
                                onClick={handleReply}
                                disabled={!replyContent.trim() || loading}
                            >
                                Reply
                            </Button>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Nested replies */}
            {replies.map((reply) => (
                <CommentNode key={reply.id} comment={reply} postId={postId} depth={depth + 1} />
            ))}
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
