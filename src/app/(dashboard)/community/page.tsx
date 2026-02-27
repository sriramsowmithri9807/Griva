"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { getFeedPosts } from "@/lib/actions/post-actions";
import { getUserCommunities } from "@/lib/actions/community-actions";
import { getLikeStatus } from "@/lib/actions/like-actions";
import { useRealtimeTable } from "@/hooks/use-realtime";
import { PostCard } from "@/components/community/post-card";
import { Users, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CommunityPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [posts, setPosts] = useState<any[]>([]);
    const [likeMap, setLikeMap] = useState<Record<string, boolean>>({});
    const [hasCommunities, setHasCommunities] = useState(true);
    const [loading, setLoading] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useRealtimeTable<any>("posts", {
        onInsert: (row) => {
            setPosts((prev) => [row, ...prev]);
        },
    });

    useEffect(() => {
        async function load() {
            const [communities, feedPosts] = await Promise.all([
                getUserCommunities(),
                getFeedPosts(),
            ]);

            setHasCommunities(communities.length > 0);
            setPosts(feedPosts);

            if (feedPosts.length > 0) {
                const likes = await getLikeStatus(feedPosts.map((p: { id: string }) => p.id));
                setLikeMap(likes);
            }
            setLoading(false);
        }
        load();
    }, []);

    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="max-w-3xl mx-auto space-y-8"
        >
            <div className="flex items-center justify-between">
                <motion.div variants={fadeInUp}>
                    <h2 className="text-3xl font-serif font-medium tracking-tight text-foreground">
                        Your Feed
                    </h2>
                    <p className="text-muted-foreground mt-1 font-light">Posts from communities you&apos;ve joined.</p>
                </motion.div>
                <motion.div variants={fadeInUp}>
                    <Link
                        href="/communities"
                        className="inline-flex items-center gap-2 h-9 px-4 rounded-md border border-border/50 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                        Browse All
                        <ArrowRight className="size-3" />
                    </Link>
                </motion.div>
            </div>

            {loading ? (
                <div className="text-center py-16 text-muted-foreground font-mono text-sm animate-pulse">Loading your feed...</div>
            ) : !hasCommunities ? (
                <motion.div variants={fadeInUp} className="text-center py-16 space-y-4">
                    <Users className="size-8 mx-auto text-muted-foreground/30" />
                    <p className="text-muted-foreground font-light">You haven&apos;t joined any communities yet.</p>
                    <Link
                        href="/communities"
                        className="inline-flex items-center gap-2 h-10 px-6 rounded-md bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                        Explore Communities
                        <ArrowRight className="size-4" />
                    </Link>
                </motion.div>
            ) : posts.length === 0 ? (
                <motion.div variants={fadeInUp} className="text-center py-16 text-muted-foreground font-light text-sm">
                    No posts in your communities yet. Be the first to publish!
                </motion.div>
            ) : (
                <div className="space-y-6">
                    {posts.map((post) => (
                        <PostCard key={post.id} post={post} liked={!!likeMap[post.id]} />
                    ))}
                </div>
            )}
        </motion.div>
    );
}
