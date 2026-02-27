"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { BookOpen, Activity, Star, Settings2, Github, Linkedin, Twitter, Globe, MapPin } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useRealtimeTable } from "@/hooks/use-realtime";
import { useEffect, useState } from "react";
import { getFullProfile } from "@/lib/actions/profile-actions";
import Link from "next/link";
import Image from "next/image";

export default function ProfilePage() {
    const { user, loading: authLoading } = useAuth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getFullProfile().then((data) => {
            setProfile(data);
            setLoading(false);
        });
    }, []);

    // Real-time profile updates
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useRealtimeTable<any>("profiles", {
        onUpdate: (row) => {
            if (row.id === user?.id) setProfile(row);
        },
    });

    if (loading || authLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground font-mono text-sm animate-pulse">Loading profile...</div>
            </div>
        );
    }

    const displayName = profile?.full_name || profile?.username || user?.email?.split("@")[0] || "User";
    const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
    const bio = profile?.bio || "No bio set yet.";
    const username = profile?.username || user?.email?.split("@")[0] || "—";

    const socialLinks = [
        { url: profile?.github_url, icon: Github, label: "GitHub" },
        { url: profile?.linkedin_url, icon: Linkedin, label: "LinkedIn" },
        { url: profile?.twitter_url, icon: Twitter, label: "Twitter" },
        { url: profile?.website_url, icon: Globe, label: "Website" },
    ].filter((l) => l.url);

    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto space-y-8"
        >
            {/* Cover + Avatar Header */}
            <motion.div variants={fadeInUp} className="relative rounded-lg overflow-hidden border border-border/50 shadow-lg">
                <div className="h-48 bg-muted/30 relative">
                    {profile?.cover_image_url ? (
                        <Image src={profile.cover_image_url} alt="Cover" fill className="object-cover" unoptimized />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 via-transparent to-foreground/10" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                </div>

                <div className="px-6 pb-6 -mt-12 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="flex items-end gap-5">
                            <motion.div
                                variants={fadeInUp}
                                className="size-24 md:size-28 rounded-lg bg-muted border-4 border-background shadow-lg overflow-hidden flex items-center justify-center"
                            >
                                {profile?.avatar_url ? (
                                    <Image src={profile.avatar_url} alt="Avatar" width={112} height={112} className="object-cover size-full" unoptimized />
                                ) : (
                                    <span className="text-4xl font-serif font-bold text-foreground/80">{initials}</span>
                                )}
                            </motion.div>
                            <div className="space-y-1 pb-1">
                                <h2 className="text-3xl md:text-4xl font-serif font-medium tracking-tight text-foreground">{displayName}</h2>
                                <p className="text-muted-foreground font-mono text-sm tracking-widest uppercase">@{username}</p>
                                <div className="flex items-center gap-2 pt-1 flex-wrap">
                                    <Badge className="glass bg-foreground/5 hover:bg-foreground/10 text-foreground transition-colors font-mono font-light text-[10px]">{user?.email}</Badge>
                                    {profile?.location && (
                                        <Badge variant="outline" className="font-mono text-[10px] gap-1">
                                            <MapPin className="size-2.5" /> {profile.location}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                        <Link href="/settings/profile">
                            <button className="h-10 px-4 rounded-md border border-border/50 bg-background/50 hover:bg-muted/50 transition-colors duration-300 flex items-center gap-2 text-sm font-medium">
                                <Settings2 className="size-4" />
                                Edit Profile
                            </button>
                        </Link>
                    </div>
                </div>
            </motion.div>

            {/* Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Sidebar */}
                <motion.div variants={fadeInUp} className="space-y-6 md:col-span-1">
                    <Card className="glass-panel border-border/50 shadow-md">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">About</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground font-light leading-relaxed">{bio}</p>
                        </CardContent>
                    </Card>

                    {/* Social Links */}
                    {socialLinks.length > 0 && (
                        <Card className="glass-panel border-border/50 shadow-md">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">Links</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {socialLinks.map(({ url, icon: Icon, label }) => (
                                    <a
                                        key={label}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                                    >
                                        <Icon className="size-4 group-hover:scale-110 transition-transform" />
                                        <span className="truncate font-light">{url.replace(/https?:\/\/(www\.)?/, "")}</span>
                                    </a>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    <Card className="glass-panel border-border/50 shadow-md">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">Metrics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center border-b border-border/20 pb-2">
                                <span className="text-foreground text-sm font-medium flex items-center gap-2"><BookOpen className="size-3 text-muted-foreground" /> Posts</span>
                                <span className="font-mono text-sm font-medium">0</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-border/20 pb-2">
                                <span className="text-foreground text-sm font-medium flex items-center gap-2"><Activity className="size-3 text-muted-foreground" /> Contributions</span>
                                <span className="font-mono text-sm font-medium">0</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-foreground text-sm font-medium flex items-center gap-2"><Star className="size-3 text-muted-foreground" /> Reputation</span>
                                <span className="font-mono text-sm font-medium">0</span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Main Activity */}
                <motion.div variants={fadeInUp} className="md:col-span-2 space-y-6">
                    <h3 className="text-xl font-serif font-medium border-b border-border/30 pb-2 mb-6 text-foreground">Recent Activity</h3>
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <p className="text-muted-foreground font-light text-sm">No activity yet. Start by joining a discussion in the Community.</p>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
