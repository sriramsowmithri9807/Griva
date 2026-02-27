"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { getFullProfile, updateProfile, uploadProfileImage, deleteProfileImage } from "@/lib/actions/profile-actions";
import {
    Camera, Upload, Trash2, Save, Loader2, Github, Linkedin, Twitter,
    Globe, MapPin, ArrowLeft, CheckCircle2, User
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Profile {
    id: string;
    username: string | null;
    full_name: string | null;
    bio: string | null;
    avatar_url: string | null;
    cover_image_url: string | null;
    github_url: string | null;
    linkedin_url: string | null;
    twitter_url: string | null;
    website_url: string | null;
    location: string | null;
}

export default function ProfileSettingsPage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);

    const [form, setForm] = useState({
        username: "",
        full_name: "",
        bio: "",
        github_url: "",
        linkedin_url: "",
        twitter_url: "",
        website_url: "",
        location: "",
    });

    const avatarRef = useRef<HTMLInputElement>(null);
    const coverRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        getFullProfile().then((data) => {
            if (data) {
                setProfile(data as Profile);
                setForm({
                    username: data.username || "",
                    full_name: data.full_name || "",
                    bio: data.bio || "",
                    github_url: data.github_url || "",
                    linkedin_url: data.linkedin_url || "",
                    twitter_url: data.twitter_url || "",
                    website_url: data.website_url || "",
                    location: data.location || "",
                });
            }
            setLoading(false);
        });
    }, []);

    async function handleSave() {
        setSaving(true);
        setSaved(false);
        try {
            await updateProfile(form);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (e) {
            console.error(e);
        }
        setSaving(false);
    }

    async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingAvatar(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("bucket", "avatars");
            const url = await uploadProfileImage(formData);
            await updateProfile({ avatar_url: url });
            setProfile((prev) => prev ? { ...prev, avatar_url: url } : prev);
        } catch (err) {
            console.error(err);
        }
        setUploadingAvatar(false);
    }

    async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingCover(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("bucket", "covers");
            const url = await uploadProfileImage(formData);
            await updateProfile({ cover_image_url: url });
            setProfile((prev) => prev ? { ...prev, cover_image_url: url } : prev);
        } catch (err) {
            console.error(err);
        }
        setUploadingCover(false);
    }

    async function handleDeleteAvatar() {
        try {
            await deleteProfileImage("avatars");
            setProfile((prev) => prev ? { ...prev, avatar_url: null } : prev);
        } catch (e) { console.error(e); }
    }

    async function handleDeleteCover() {
        try {
            await deleteProfileImage("covers");
            setProfile((prev) => prev ? { ...prev, cover_image_url: null } : prev);
        } catch (e) { console.error(e); }
    }

    const initials = (form.full_name || form.username || "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

    if (loading) {
        return <div className="text-center py-16 text-muted-foreground font-mono text-sm animate-pulse">Loading settings...</div>;
    }

    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="max-w-3xl mx-auto space-y-8"
        >
            <motion.div variants={fadeInUp}>
                <Link href="/profile" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
                    <ArrowLeft className="size-4" /> Back to Profile
                </Link>
                <h2 className="text-3xl font-serif font-medium tracking-tight text-foreground">Profile Settings</h2>
                <p className="text-muted-foreground mt-1 font-light">Customize your identity on Griva.</p>
            </motion.div>

            {/* Cover Image */}
            <motion.div variants={fadeInUp}>
                <Card className="glass-panel border-border/50 shadow-md overflow-hidden">
                    <div className="relative h-48 bg-muted/30">
                        {profile?.cover_image_url ? (
                            <Image src={profile.cover_image_url} alt="Cover" fill className="object-cover" unoptimized />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 via-transparent to-foreground/10" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                        <div className="absolute bottom-3 right-3 flex gap-2">
                            <button
                                onClick={() => coverRef.current?.click()}
                                disabled={uploadingCover}
                                className="h-8 px-3 rounded-md bg-background/80 backdrop-blur-sm border border-border/50 text-xs font-medium flex items-center gap-1.5 hover:bg-background transition-colors"
                            >
                                {uploadingCover ? <Loader2 className="size-3 animate-spin" /> : <Upload className="size-3" />}
                                {uploadingCover ? "Uploading..." : "Change Cover"}
                            </button>
                            {profile?.cover_image_url && (
                                <button onClick={handleDeleteCover} className="h-8 w-8 rounded-md bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:bg-destructive/20 transition-colors">
                                    <Trash2 className="size-3" />
                                </button>
                            )}
                        </div>
                        <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                    </div>

                    {/* Avatar */}
                    <div className="px-6 pb-6 -mt-12 relative z-10">
                        <div className="flex items-end gap-4">
                            <div className="relative group">
                                <div className="size-24 rounded-lg bg-muted border-4 border-background shadow-lg overflow-hidden flex items-center justify-center">
                                    {profile?.avatar_url ? (
                                        <Image src={profile.avatar_url} alt="Avatar" width={96} height={96} className="object-cover size-full" unoptimized />
                                    ) : (
                                        <span className="text-3xl font-serif font-bold text-foreground/80">{initials}</span>
                                    )}
                                </div>
                                <button
                                    onClick={() => avatarRef.current?.click()}
                                    disabled={uploadingAvatar}
                                    className="absolute inset-0 rounded-lg bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                >
                                    {uploadingAvatar ? <Loader2 className="size-5 text-white animate-spin" /> : <Camera className="size-5 text-white" />}
                                </button>
                                <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                            </div>
                            <div className="flex gap-2 pb-1">
                                {profile?.avatar_url && (
                                    <button onClick={handleDeleteAvatar} className="text-xs text-muted-foreground hover:text-destructive transition-colors">
                                        Remove avatar
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Basic Info */}
            <motion.div variants={fadeInUp}>
                <Card className="glass-panel border-border/50 shadow-md">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
                            <User className="size-3 inline mr-2" />Basic Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-muted-foreground font-mono mb-1.5 block">Username</label>
                                <input
                                    value={form.username}
                                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                                    className="w-full h-10 px-3 rounded-md bg-background/50 border border-border/50 text-sm font-light focus:outline-none focus:ring-1 focus:ring-foreground/20"
                                    placeholder="your_username"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground font-mono mb-1.5 block">Full Name</label>
                                <input
                                    value={form.full_name}
                                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                                    className="w-full h-10 px-3 rounded-md bg-background/50 border border-border/50 text-sm font-light focus:outline-none focus:ring-1 focus:ring-foreground/20"
                                    placeholder="Your Name"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground font-mono mb-1.5 block">Bio</label>
                            <textarea
                                value={form.bio}
                                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                                rows={3}
                                className="w-full px-3 py-2 rounded-md bg-background/50 border border-border/50 text-sm font-light focus:outline-none focus:ring-1 focus:ring-foreground/20 resize-none"
                                placeholder="Tell us about yourself..."
                            />
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground font-mono mb-1.5 block">Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
                                <input
                                    value={form.location}
                                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                                    className="w-full h-10 pl-10 pr-3 rounded-md bg-background/50 border border-border/50 text-sm font-light focus:outline-none focus:ring-1 focus:ring-foreground/20"
                                    placeholder="City, Country"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Social Links */}
            <motion.div variants={fadeInUp}>
                <Card className="glass-panel border-border/50 shadow-md">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
                            <Globe className="size-3 inline mr-2" />Social Links
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            { key: "github_url", icon: Github, label: "GitHub", placeholder: "https://github.com/username" },
                            { key: "linkedin_url", icon: Linkedin, label: "LinkedIn", placeholder: "https://linkedin.com/in/username" },
                            { key: "twitter_url", icon: Twitter, label: "X / Twitter", placeholder: "https://x.com/username" },
                            { key: "website_url", icon: Globe, label: "Website", placeholder: "https://your-site.com" },
                        ].map(({ key, icon: Icon, label, placeholder }) => (
                            <div key={key}>
                                <label className="text-xs text-muted-foreground font-mono mb-1.5 flex items-center gap-1.5">
                                    <Icon className="size-3" /> {label}
                                </label>
                                <input
                                    value={form[key as keyof typeof form]}
                                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                                    className="w-full h-10 px-3 rounded-md bg-background/50 border border-border/50 text-sm font-light focus:outline-none focus:ring-1 focus:ring-foreground/20"
                                    placeholder={placeholder}
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Save */}
            <motion.div variants={fadeInUp} className="flex items-center justify-between pb-8">
                <div>
                    {saved && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2 text-sm text-green-400 font-mono"
                        >
                            <CheckCircle2 className="size-4" /> Saved successfully
                        </motion.div>
                    )}
                </div>
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="h-10 px-6 bg-foreground text-background hover:opacity-90"
                >
                    {saving ? <Loader2 className="size-4 animate-spin mr-2" /> : <Save className="size-4 mr-2" />}
                    {saving ? "Saving..." : "Save Changes"}
                </Button>
            </motion.div>
        </motion.div>
    );
}
