"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { toggleLike } from "@/lib/actions/like-actions";

interface LikeButtonProps {
    postId: string;
    initialCount: number;
    initialLiked: boolean;
}

export function LikeButton({ postId, initialCount, initialLiked }: LikeButtonProps) {
    const [liked, setLiked] = useState(initialLiked);
    const [count, setCount] = useState(initialCount);
    const [loading, setLoading] = useState(false);

    async function handleToggle() {
        if (loading) return;
        setLoading(true);

        // Optimistic update
        setLiked(!liked);
        setCount(liked ? count - 1 : count + 1);

        try {
            await toggleLike(postId);
        } catch {
            // Revert on error
            setLiked(liked);
            setCount(count);
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            onClick={handleToggle}
            className={`flex items-center gap-2 hover:text-foreground transition-colors hover:bg-muted/50 p-2 rounded-md -ml-2 duration-300 ${liked ? "text-red-400" : "text-muted-foreground"
                }`}
        >
            <Heart className={`size-4 ${liked ? "fill-current" : ""}`} />
            <span className="text-sm font-medium font-mono">{count}</span>
        </button>
    );
}
