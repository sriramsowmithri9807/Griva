"use client";

import { useState } from "react";
import { Lightbulb, Swords } from "lucide-react";
import { interactPost } from "@/lib/actions/interaction-actions";
import { cn } from "@/lib/utils";

interface ImpactButtonProps {
    postId: string;
    initialInsights: number;
    initialChallenges: number;
    initialInteraction: 1 | -1 | 0;
}

export function ImpactButton({ postId, initialInsights, initialChallenges, initialInteraction }: ImpactButtonProps) {
    const [insights, setInsights] = useState(initialInsights);
    const [challenges, setChallenges] = useState(initialChallenges);
    const [myInteraction, setMyInteraction] = useState<1 | -1 | 0>(initialInteraction);

    async function handleInteraction(type: 1 | -1) {
        const prev = myInteraction;
        // Optimistic update
        let newInsights = insights;
        let newChallenges = challenges;
        let newInteraction: 1 | -1 | 0;

        if (prev === type) {
            // toggle off
            newInteraction = 0;
            if (type === 1) newInsights--;
            else newChallenges--;
        } else {
            if (prev === 1) newInsights--;
            if (prev === -1) newChallenges--;
            if (type === 1) newInsights++;
            else newChallenges++;
            newInteraction = type;
        }

        setInsights(Math.max(0, newInsights));
        setChallenges(Math.max(0, newChallenges));
        setMyInteraction(newInteraction);

        try {
            await interactPost(postId, type);
        } catch {
            // rollback
            setInsights(insights);
            setChallenges(challenges);
            setMyInteraction(prev);
        }
    }

    const impactScore = insights - challenges;

    return (
        <div className="flex items-center gap-1">
            <button
                onClick={(e) => { e.preventDefault(); handleInteraction(1); }}
                className={cn(
                    "flex items-center justify-center size-7 rounded-md transition-all duration-200",
                    myInteraction === 1
                        ? "bg-amber-500/20 text-amber-400"
                        : "text-muted-foreground/50 hover:text-amber-400 hover:bg-amber-500/10"
                )}
                title="Insight"
            >
                <Lightbulb className="size-4" />
            </button>
            <span
                className={cn(
                    "text-xs font-mono font-semibold tabular-nums min-w-[1.75rem] text-center transition-colors duration-200",
                    impactScore > 0 ? "text-amber-400" : impactScore < 0 ? "text-rose-400" : "text-muted-foreground/50"
                )}
                title="Impact Score"
            >
                {impactScore > 999 ? `${(impactScore / 1000).toFixed(1)}k` : impactScore}
            </span>
            <button
                onClick={(e) => { e.preventDefault(); handleInteraction(-1); }}
                className={cn(
                    "flex items-center justify-center size-7 rounded-md transition-all duration-200",
                    myInteraction === -1
                        ? "bg-rose-500/20 text-rose-400"
                        : "text-muted-foreground/50 hover:text-rose-400 hover:bg-rose-500/10"
                )}
                title="Challenge"
            >
                <Swords className="size-4" />
            </button>
        </div>
    );
}
