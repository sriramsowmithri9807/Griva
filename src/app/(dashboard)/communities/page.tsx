"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { getCommunities } from "@/lib/actions/community-actions";
import { CreateCommunityDialog } from "@/components/community/create-community-dialog";
import { Users } from "lucide-react";
import Link from "next/link";

interface Community {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    created_at: string;
    community_members: { count: number }[];
}

export default function CommunitiesPage() {
    const [communities, setCommunities] = useState<Community[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCommunities().then((data) => {
            setCommunities(data as Community[]);
            setLoading(false);
        });
    }, []);

    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto space-y-8"
        >
            <div className="flex items-center justify-between">
                <motion.div variants={fadeInUp}>
                    <h2 className="text-3xl font-serif font-medium tracking-tight text-foreground">
                        Communities
                    </h2>
                    <p className="text-muted-foreground mt-1 font-light">Browse and join communities.</p>
                </motion.div>
                <motion.div variants={fadeInUp}>
                    <CreateCommunityDialog />
                </motion.div>
            </div>

            {loading ? (
                <div className="text-center py-16 text-muted-foreground font-mono text-sm animate-pulse">Loading communities...</div>
            ) : communities.length === 0 ? (
                <motion.div variants={fadeInUp} className="text-center py-16">
                    <Users className="size-8 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-muted-foreground font-light">No communities yet. Create the first one!</p>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {communities.map((community) => (
                        <motion.div key={community.id} variants={fadeInUp}>
                            <Link href={`/communities/${community.slug}`}>
                                <Card className="glass-panel border-border/50 shadow-md group cursor-pointer hover:shadow-xl hover:border-foreground/20 transition-all duration-500 h-full">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg font-serif font-medium group-hover:text-muted-foreground transition-colors">
                                            g/{community.name}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground font-light line-clamp-2 mb-3">
                                            {community.description || "No description"}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
                                            <Users className="size-3" />
                                            <span className="font-mono">{community.community_members?.[0]?.count ?? 0} members</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
