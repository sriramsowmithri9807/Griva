"use client";

import { useState } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { interactPost } from "@/lib/actions/interaction-actions";
import { INSIGHT, CHALLENGE, type Interaction } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface InsightButtonProps {
    postId: string;
    initialInsights: number;
    initialChallenges: number;
    initialInteraction: Interaction;
}

export function InsightButton({
    postId,
    initialInsights,
    initialChallenges,
    initialInteraction,
}: InsightButtonProps) {
    const [insights,     setInsights]     = useState(initialInsights);
    const [challenges,   setChallenges]   = useState(initialChallenges);
    const [myInteraction, setMyInteraction] = useState<Interaction>(initialInteraction);

    async function handleInteraction(type: 1 | -1) {
        const prev = myInteraction;
        let newIns  = insights;
        let newChal = challenges;
        let newState: Interaction;

        if (prev === type) {
            // toggle off
            newState = 0;
            if (type === INSIGHT)    newIns--;
            else                     newChal--;
        } else {
            if (prev === INSIGHT)    newIns--;
            if (prev === CHALLENGE)  newChal--;
            if (type === INSIGHT)    newIns++;
            else                     newChal++;
            newState = type;
        }

        setInsights(Math.max(0, newIns));
        setChallenges(Math.max(0, newChal));
        setMyInteraction(newState);

        try {
            await interactPost(postId, type);
        } catch {
            // rollback on error
            setInsights(insights);
            setChallenges(challenges);
            setMyInteraction(prev);
        }
    }

    const impactScore = insights - challenges;

    return (
        <div className="flex items-center gap-1" title="Impact Score">
            {/* Insight button */}
            <button
                onClick={(e) => { e.preventDefault(); handleInteraction(INSIGHT); }}
                title="Mark as Insightful"
                className={cn(
                    "flex items-center justify-center size-7 rounded-md transition-all duration-200",
                    myInteraction === INSIGHT
                        ? "bg-orange-500/20 text-orange-400"
                        : "text-muted-foreground/50 hover:text-orange-400 hover:bg-orange-500/10"
                )}
            >
                <ArrowUp className="size-4" />
            </button>

            {/* Animated Impact Score counter */}
            <AnimatePresence mode="wait" initial={false}>
                <motion.span
                    key={impactScore}
                    initial={{ y: -8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 8, opacity: 0 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className={cn(
                        "text-xs font-mono font-semibold tabular-nums min-w-[1.75rem] text-center",
                        impactScore > 0
                            ? "text-orange-400"
                            : impactScore < 0
                            ? "text-blue-400"
                            : "text-muted-foreground/50"
                    )}
                >
                    {impactScore > 999 ? `${(impactScore / 1000).toFixed(1)}k` : impactScore}
                </motion.span>
            </AnimatePresence>

            {/* Challenge button */}
            <button
                onClick={(e) => { e.preventDefault(); handleInteraction(CHALLENGE); }}
                title="Challenge this"
                className={cn(
                    "flex items-center justify-center size-7 rounded-md transition-all duration-200",
                    myInteraction === CHALLENGE
                        ? "bg-blue-500/20 text-blue-400"
                        : "text-muted-foreground/50 hover:text-blue-400 hover:bg-blue-500/10"
                )}
            >
                <ArrowDown className="size-4" />
            </button>
        </div>
    );
}
