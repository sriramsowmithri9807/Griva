"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { getCommunity, isMember, joinCommunity, leaveCommunity, getCommunityRole } from "@/lib/actions/community-actions";
import { getPosts } from "@/lib/actions/post-actions";
import { getInteractionStatus } from "@/lib/actions/interaction-actions";
import { PostCard } from "@/components/community/post-card";
import { CreatePostForm } from "@/components/community/create-post-form";
import { Button } from "@/components/ui/button";
import { Users, LogIn, LogOut as LogOutIcon, Settings, Share2, Copy, Check, Shield } from "lucide-react";
import Link from "next/link";
import { useRealtimeTable } from "@/hooks/use-realtime";

export default function CommunitySlugPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [community, setCommunity] = useState<Record<string, unknown> | null>(null);
    const [posts, setPosts] = useState<Record<string, unknown>[]>([]);
    const [interactionMap, setInteractionMap] = useState<Record<string, 1 | -1 | 0>>({});
    const [memberStatus, setMemberStatus] = useState(false);
    const [myRole, setMyRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [copied, setCopied] = useState(false);

    // Realtime: new posts appear instantly
    useRealtimeTable<{ id: string; community_id: string }>("posts", {
        onInsert: (row) => {
            if (row.community_id === (community as Record<string, unknown>)?.id) {
                setPosts((prev) => [row as Record<string, unknown>, ...prev]);
            }
        },
    });

    const loadPage = useCallback(async () => {
        const c = await getCommunity(slug);
        if (!c) { setLoading(false); return; }
        setCommunity(c);

        const [p, m, role] = await Promise.all([
            getPosts(c.id as string),
            isMember(c.id as string),
            getCommunityRole(c.id as string),
        ]);
        setPosts(p as Record<string, unknown>[]);
        setMemberStatus(m);
        setMyRole(role);

        if (p.length > 0) {
            const interactions = await getInteractionStatus(p.map((post) => (post as Record<string, unknown>).id as string));
            setInteractionMap(interactions);
        }
        setLoading(false);
    }, [slug]);

    useEffect(() => { loadPage(); }, [loadPage]);

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
            setMyRole(null);
            router.refresh();
        } catch (e) { console.error(e); }
        finally { setJoining(false); }
    }

    function copyLink() {
        navigator.clipboard.writeText(`${window.location.origin}/communities/${slug}`)
            .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
    }

    if (loading) return <div className="text-center py-16 text-muted-foreground font-mono text-sm animate-pulse">Loading community...</div>;
    if (!community) return <div className="text-center py-16 text-muted-foreground font-light">Community not found.</div>;

    const memberCount = (community.community_members as { count: number }[])?.[0]?.count ?? 0;
    const isAdmin = myRole === "admin";
    const isCurator = myRole === "curator";
    const tags = (community.tags as string[]) ?? [];
    const rules = community.rules as string | null;
    const category = community.category as string | null;

    return (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-5xl mx-auto">
            {/* Banner */}
            <motion.div variants={fadeInUp} className="relative w-full h-36 rounded-xl mb-0 overflow-hidden bg-gradient-to-br from-cyan-900/20 to-background border border-border/30">
                {community.banner_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={community.banner_url as string} alt="banner" className="w-full h-full object-cover" />
                ) : (
                    <div className="absolute inset-0 cyber-grid opacity-30" />
                )}
            </motion.div>

            {/* Community header card */}
            <motion.div variants={fadeInUp}
                className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl -mt-4 mx-4 p-6 shadow-xl mb-8">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                    {/* Avatar */}
                    <div className="size-16 rounded-xl border-2 border-border/50 overflow-hidden bg-muted/30 shrink-0 flex items-center justify-center text-2xl font-serif font-bold text-muted-foreground/50"
                        style={{ marginTop: "-2rem" }}>
                        {community.avatar_url
                            ? <img src={community.avatar_url as string} alt="avatar" className="w-full h-full object-cover" />
                            : (community.name as string).charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h2 className="text-2xl font-serif font-medium tracking-tight text-foreground">
                                        g/{community.name as string}
                                    </h2>
                                    {isAdmin && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                                            <Shield className="size-2.5" />ADMIN
                                        </span>
                                    )}
                                    {isCurator && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                            <Shield className="size-2.5" />CURATOR
                                        </span>
                                    )}
                                </div>
                                {category && <p className="text-xs font-mono text-muted-foreground/50 mt-0.5">{category}</p>}
                                <p className="text-sm text-muted-foreground font-light mt-1">{(community.description as string) || "No description"}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground/60 flex-wrap">
                                    <span className="flex items-center gap-1"><Users className="size-3" /> <span className="font-mono">{memberCount} members</span></span>
                                </div>
                                {tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {tags.map((t) => (
                                            <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-foreground/8 border border-border/30 text-muted-foreground/60">#{t}</span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-2 shrink-0 flex-wrap">
                                <button onClick={copyLink}
                                    className="flex items-center gap-1.5 h-9 px-3 rounded-md border border-border/50 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all">
                                    {copied ? <Check className="size-3.5 text-green-400" /> : <Share2 className="size-3.5" />}
                                    <span className="hidden sm:inline">{copied ? "Copied!" : "Share"}</span>
                                    <Copy className="size-3 hidden" />
                                </button>
                                {isAdmin && (
                                    <Link href={`/communities/${slug}/settings`}>
                                        <Button variant="outline" className="h-9 px-3 text-xs gap-1.5">
                                            <Settings className="size-3.5" />
                                            <span className="hidden sm:inline">Settings</span>
                                        </Button>
                                    </Link>
                                )}
                                {memberStatus ? (
                                    <Button onClick={handleLeave} disabled={joining} variant="outline" className="h-9 text-xs">
                                        <LogOutIcon className="size-3 mr-1.5" />
                                        {joining ? "Leaving..." : "Leave"}
                                    </Button>
                                ) : (
                                    <Button onClick={handleJoin} disabled={joining} className="h-9 text-xs bg-foreground text-background">
                                        <LogIn className="size-3 mr-1.5" />
                                        {joining ? "Joining..." : "Join"}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Main layout: posts + sidebar */}
            <div className="flex gap-6">
                {/* Posts column */}
                <div className="flex-1 min-w-0 space-y-6">
                    {memberStatus && <CreatePostForm communityId={community.id as string} />}

                    <AnimatePresence initial={false}>
                        {posts.length === 0 ? (
                            <motion.div variants={fadeInUp} className="text-center py-16 text-muted-foreground font-light text-sm">
                                No posts yet. {memberStatus ? "Be the first to publish!" : "Join to start posting."}
                            </motion.div>
                        ) : (
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            posts.map((post: any) => (
                                <PostCard key={post.id} post={post} myInteraction={interactionMap[post.id] ?? 0} isAdmin={isAdmin || isCurator} />
                            ))
                        )}
                    </AnimatePresence>
                </div>

                {/* Sidebar — rules */}
                <div className="hidden lg:block w-64 shrink-0 space-y-4">
                    <div className="rounded-xl border border-border/50 bg-card/50 p-4 space-y-3">
                        <h4 className="text-xs font-mono uppercase tracking-widest text-muted-foreground/60">About</h4>
                        <p className="text-sm font-light text-muted-foreground leading-relaxed">
                            {(community.description as string) || "Welcome to this community."}
                        </p>
                        <div className="text-xs font-mono text-muted-foreground/50">
                            <span className="font-medium text-foreground/70">{memberCount}</span> members
                        </div>
                    </div>

                    {rules && (
                        <div className="rounded-xl border border-border/50 bg-card/50 p-4 space-y-3">
                            <h4 className="text-xs font-mono uppercase tracking-widest text-muted-foreground/60">Rules</h4>
                            <pre className="text-xs text-muted-foreground font-light whitespace-pre-wrap leading-relaxed">{rules}</pre>
                        </div>
                    )}

                    {(isAdmin || isCurator) && (
                        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 space-y-2">
                            <h4 className="text-xs font-mono uppercase tracking-widest text-yellow-500/70">Curator Tools</h4>
                            <Link href={`/communities/${slug}/settings`}
                                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors py-1">
                                <Settings className="size-3.5" /> Sphere Settings
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
