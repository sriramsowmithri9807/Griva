"use client";

import { useState } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { votePost } from "@/lib/actions/vote-actions";
import { cn } from "@/lib/utils";

interface VoteButtonProps {
    postId: string;
    initialUpvotes: number;
    initialDownvotes: number;
    initialVote: 1 | -1 | 0;
}

export function VoteButton({ postId, initialUpvotes, initialDownvotes, initialVote }: VoteButtonProps) {
    const [upvotes, setUpvotes] = useState(initialUpvotes);
    const [downvotes, setDownvotes] = useState(initialDownvotes);
    const [myVote, setMyVote] = useState<1 | -1 | 0>(initialVote);

    async function handleVote(type: 1 | -1) {
        const prev = myVote;
        // Optimistic update
        let newUp = upvotes;
        let newDown = downvotes;
        let newVote: 1 | -1 | 0;

        if (prev === type) {
            // toggle off
            newVote = 0;
            if (type === 1) newUp--;
            else newDown--;
        } else {
            if (prev === 1) newUp--;
            if (prev === -1) newDown--;
            if (type === 1) newUp++;
            else newDown++;
            newVote = type;
        }

        setUpvotes(Math.max(0, newUp));
        setDownvotes(Math.max(0, newDown));
        setMyVote(newVote);

        try {
            await votePost(postId, type);
        } catch {
            // rollback
            setUpvotes(upvotes);
            setDownvotes(downvotes);
            setMyVote(prev);
        }
    }

    const net = upvotes - downvotes;

    return (
        <div className="flex items-center gap-1">
            <button
                onClick={(e) => { e.preventDefault(); handleVote(1); }}
                className={cn(
                    "flex items-center justify-center size-7 rounded-md transition-all duration-200",
                    myVote === 1
                        ? "bg-orange-500/20 text-orange-400"
                        : "text-muted-foreground/50 hover:text-orange-400 hover:bg-orange-500/10"
                )}
            >
                <ArrowUp className="size-4" />
            </button>
            <span
                className={cn(
                    "text-xs font-mono font-semibold tabular-nums min-w-[1.75rem] text-center",
                    net > 0 ? "text-orange-400" : net < 0 ? "text-blue-400" : "text-muted-foreground/50"
                )}
            >
                {net > 999 ? `${(net / 1000).toFixed(1)}k` : net}
            </span>
            <button
                onClick={(e) => { e.preventDefault(); handleVote(-1); }}
                className={cn(
                    "flex items-center justify-center size-7 rounded-md transition-all duration-200",
                    myVote === -1
                        ? "bg-blue-500/20 text-blue-400"
                        : "text-muted-foreground/50 hover:text-blue-400 hover:bg-blue-500/10"
                )}
            >
                <ArrowDown className="size-4" />
            </button>
        </div>
    );
}
