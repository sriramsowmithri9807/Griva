"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { getCommunity, isMember, joinCommunity, leaveCommunity } from "@/lib/actions/community-actions";
import { getPosts } from "@/lib/actions/post-actions";
import { getLikeStatus } from "@/lib/actions/like-actions";
import { PostCard } from "@/components/community/post-card";
import { CreatePostForm } from "@/components/community/create-post-form";
import { Button } from "@/components/ui/button";
import { Users, LogIn, LogOut as LogOutIcon } from "lucide-react";

export default function CommunitySlugPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [community, setCommunity] = useState<Record<string, unknown> | null>(null);
    const [posts, setPosts] = useState<Record<string, unknown>[]>([]);
    const [likeMap, setLikeMap] = useState<Record<string, boolean>>({});
    const [memberStatus, setMemberStatus] = useState(false);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);

    useEffect(() => {
        async function load() {
            const c = await getCommunity(slug);
            if (!c) { setLoading(false); return; }
            setCommunity(c);

            const [p, m] = await Promise.all([
                getPosts(c.id as string),
                isMember(c.id as string),
            ]);
            setPosts(p);
            setMemberStatus(m);

            if (p.length > 0) {
                const likes = await getLikeStatus(p.map((post: Record<string, unknown>) => post.id as string));
                setLikeMap(likes);
            }
            setLoading(false);
        }
        load();
    }, [slug]);

    async function handleJoin() {
        if (!community || joining) return;
        setJoining(true);
        try {
            await joinCommunity(community.id as string);
            setMemberStatus(true);
            router.refresh();
        } catch (e) { console.error(e); }
        finally { setJoining(false); }
    }

    async function handleLeave() {
        if (!community || joining) return;
        setJoining(true);
        try {
            await leaveCommunity(community.id as string);
            setMemberStatus(false);
            router.refresh();
        } catch (e) { console.error(e); }
        finally { setJoining(false); }
    }

    if (loading) {
        return <div className="text-center py-16 text-muted-foreground font-mono text-sm animate-pulse">Loading community...</div>;
    }

    if (!community) {
        return <div className="text-center py-16 text-muted-foreground font-light">Community not found.</div>;
    }

    const memberCount = (community.community_members as { count: number }[])?.[0]?.count ?? 0;

    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="max-w-3xl mx-auto space-y-8"
        >
            {/* Community Header */}
            <motion.div variants={fadeInUp} className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-border/50">
                <div>
                    <h2 className="text-3xl font-serif font-medium tracking-tight text-foreground">
                        g/{community.name as string}
                    </h2>
                    <p className="text-muted-foreground mt-1 font-light">{(community.description as string) || "No description"}</p>
                    <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                        <Users className="size-3" />
                        <span className="font-mono">{memberCount} members</span>
                    </div>
                </div>
                <div>
                    {memberStatus ? (
                        <Button
                            onClick={handleLeave}
                            disabled={joining}
                            variant="outline"
                            className="h-9 text-sm"
                        >
                            <LogOutIcon className="size-3 mr-2" />
                            {joining ? "Leaving..." : "Leave"}
                        </Button>
                    ) : (
                        <Button
                            onClick={handleJoin}
                            disabled={joining}
                            className="h-9 text-sm bg-foreground text-background"
                        >
                            <LogIn className="size-3 mr-2" />
                            {joining ? "Joining..." : "Join Community"}
                        </Button>
                    )}
                </div>
            </motion.div>

            {/* Post creation (only for members) */}
            {memberStatus && <CreatePostForm communityId={community.id as string} />}

            {/* Posts feed */}
            <div className="space-y-6">
                {posts.length === 0 ? (
                    <motion.div variants={fadeInUp} className="text-center py-16 text-muted-foreground font-light text-sm">
                        No posts yet. {memberStatus ? "Be the first to publish!" : "Join to start posting."}
                    </motion.div>
                ) : (
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    posts.map((post: any) => (
                        <PostCard key={post.id} post={post} liked={!!likeMap[post.id]} />
                    ))
                )}
            </div>
        </motion.div>
    );
}
