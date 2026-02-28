"use client";

import { useState } from "react";
import { createResponse, deleteResponse } from "@/lib/actions/response-actions";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, CornerDownRight, SendHorizontal, Trash2 } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";

interface Response {
    id: string;
    content: string;
    created_at: string;
    author_id: string;
    profiles: { id: string; username: string | null; full_name: string | null } | null;
    replies: Response[];
}

interface ResponseThreadProps {
    postId: string;
    responses: Response[];
    isLocked?: boolean;
    isAdmin?: boolean;
}

export function ResponseThread({ postId, responses: initialResponses, isLocked = false, isAdmin = false }: ResponseThreadProps) {
    const [responses, setResponses] = useState(initialResponses);
    const [rootContent, setRootContent] = useState("");
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    async function handleSubmitRoot() {
        if (!rootContent.trim() || loading || isLocked) return;
        setLoading(true);
        try {
            const newResponse = await createResponse(postId, rootContent.trim());
            setResponses([...responses, { ...newResponse, replies: [] }]);
            setRootContent("");
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function handleDeleteResponse(responseId: string) {
        try {
            await deleteResponse(responseId);
            setResponses((prev) => prev.filter((c) => c.id !== responseId));
        } catch (e) { console.error(e); }
    }

    return (
        <div className="space-y-6">
            {/* Root response input */}
            {!isLocked && (
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
                                Respond
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            {isLocked && (
                <p className="text-xs font-mono text-yellow-500/60 text-center py-2 border border-yellow-500/20 rounded-md bg-yellow-500/5">
                    This thread is locked. No new responses allowed.
                </p>
            )}

            {/* Response list */}
            <div className="space-y-1">
                <AnimatePresence>
                    {responses.map((response) => (
                        <ResponseNode
                            key={response.id}
                            response={response}
                            postId={postId}
                            depth={0}
                            isLocked={isLocked}
                            isAdmin={isAdmin}
                            currentUserId={user?.id}
                            onDelete={handleDeleteResponse}
                        />
                    ))}
                </AnimatePresence>
                {responses.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm font-light">
                        <MessageSquare className="size-5 mx-auto mb-2 opacity-40" />
                        No responses yet. Be the first to share your thoughts.
                    </div>
                )}
            </div>
        </div>
    );
}

function ResponseNode({
    response, postId, depth, isLocked, isAdmin, currentUserId, onDelete,
}: {
    response: Response;
    postId: string;
    depth: number;
    isLocked: boolean;
    isAdmin: boolean;
    currentUserId?: string;
    onDelete: (id: string) => void;
}) {
    const [showReply, setShowReply] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const [replies, setReplies] = useState(response.replies);
    const [loading, setLoading] = useState(false);
    const [deleted, setDeleted] = useState(false);

    const authorName = response.profiles?.full_name || response.profiles?.username || "Anonymous";
    const initials = authorName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
    const timeAgo = getTimeAgo(response.created_at);
    const canDelete = isAdmin || currentUserId === response.author_id;

    async function handleReply() {
        if (!replyContent.trim() || loading || isLocked) return;
        setLoading(true);
        try {
            const newReply = await createResponse(postId, replyContent.trim(), response.id);
            setReplies([...replies, { ...newReply, replies: [] }]);
            setReplyContent("");
            setShowReply(false);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }

    async function handleDelete() {
        if (!confirm("Delete this response?")) return;
        try {
            await deleteResponse(response.id);
            setDeleted(true);
            onDelete(response.id);
        } catch (e) { console.error(e); }
    }

    if (deleted) return null;

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
                            {canDelete && (
                                <button onClick={handleDelete}
                                    className="ml-auto opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[10px] text-muted-foreground/40 hover:text-red-400 transition-all">
                                    <Trash2 className="size-3" />
                                </button>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground font-light leading-relaxed">{response.content}</p>
                        {depth < 3 && !isLocked && (
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
                            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setShowReply(false)}>Cancel</Button>
                            <Button size="sm" className="h-7 text-xs bg-foreground text-background"
                                onClick={handleReply} disabled={!replyContent.trim() || loading}>
                                Reply
                            </Button>
                        </div>
                    </motion.div>
                )}
            </div>

            {replies.map((reply) => (
                <ResponseNode key={reply.id} response={reply} postId={postId} depth={depth + 1}
                    isLocked={isLocked} isAdmin={isAdmin} currentUserId={currentUserId}
                    onDelete={(id) => setReplies((prev) => prev.filter((r) => r.id !== id))} />
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
