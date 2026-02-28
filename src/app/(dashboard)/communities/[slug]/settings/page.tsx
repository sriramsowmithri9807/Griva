"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import {
    getCommunity, getCommunityRole, updateCommunity, uploadCommunityImage,
    getCommunityMembers, promoteMember, banUser, unbanUser, isBanned,
    getCommunityShareLink,
} from "@/lib/actions/community-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Upload, Copy, Check, Shield, UserX, ChevronDown, Globe, Lock, Eye } from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
    "General", "Artificial Intelligence", "Machine Learning", "Deep Learning",
    "NLP", "Computer Vision", "Robotics", "Web Dev", "Systems", "Security",
    "Data Science", "Research", "Career", "Tools & Libraries", "Open Source",
];

interface Member {
    id: string;
    user_id: string;
    role: string;
    profiles: { id: string; username: string | null; full_name: string | null; avatar_url: string | null } | null;
}

export default function CommunitySettingsPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [community, setCommunity] = useState<Record<string, unknown> | null>(null);
    const [myRole, setMyRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState("");
    const [copied, setCopied] = useState(false);
    const [shareLink, setShareLink] = useState("");
    const [members, setMembers] = useState<Member[]>([]);

    // Form state
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("General");
    const [rules, setRules] = useState("");
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [visibility, setVisibility] = useState("public");

    // Image upload state
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);

    const load = useCallback(async () => {
        const c = await getCommunity(slug);
        if (!c) { router.push("/communities"); return; }
        setCommunity(c);

        const role = await getCommunityRole(c.id as string);
        if (role !== "admin" && role !== "curator") { router.push(`/communities/${slug}`); return; }
        setMyRole(role);

        setDescription((c.description as string) ?? "");
        setCategory((c.category as string) ?? "General");
        setRules((c.rules as string) ?? "");
        setTags((c.tags as string[]) ?? []);
        setVisibility((c.visibility as string) ?? "public");

        const [link, memberList] = await Promise.all([
            getCommunityShareLink(slug),
            getCommunityMembers(c.id as string),
        ]);
        setShareLink(link);
        setMembers(memberList as Member[]);
        setLoading(false);
    }, [slug, router]);

    useEffect(() => { load(); }, [load]);

    function addTag() {
        const t = tagInput.trim().toLowerCase();
        if (t && !tags.includes(t) && tags.length < 5) { setTags([...tags, t]); setTagInput(""); }
    }

    function pickFile(type: "avatar" | "banner", file: File) {
        const url = URL.createObjectURL(file);
        if (type === "avatar") { setAvatarFile(file); setAvatarPreview(url); }
        else { setBannerFile(file); setBannerPreview(url); }
    }

    async function handleSave() {
        if (!community) return;
        setSaving(true);
        setSaveMsg("");
        try {
            await updateCommunity(community.id as string, { description, category, rules, tags, visibility });

            if (avatarFile) {
                const fd = new FormData(); fd.append("file", avatarFile);
                await uploadCommunityImage(community.id as string, fd, "avatar");
            }
            if (bannerFile) {
                const fd = new FormData(); fd.append("file", bannerFile);
                await uploadCommunityImage(community.id as string, fd, "banner");
            }

            setSaveMsg("Saved successfully!");
            setTimeout(() => setSaveMsg(""), 3000);
        } catch (e) {
            setSaveMsg(e instanceof Error ? e.message : "Save failed");
        } finally { setSaving(false); }
    }

    function copyLink() {
        navigator.clipboard.writeText(shareLink).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
    }

    async function handlePromote(userId: string, newRole: "curator" | "member") {
        if (!community) return;
        try { await promoteMember(community.id as string, userId, newRole); load(); }
        catch (e) { console.error(e); }
    }

    async function handleBan(userId: string) {
        if (!community || !confirm("Ban this user?")) return;
        try { await banUser(community.id as string, userId, "Banned by admin"); load(); }
        catch (e) { console.error(e); }
    }

    async function handleUnban(userId: string) {
        if (!community) return;
        try { await unbanUser(community.id as string, userId); }
        catch (e) { console.error(e); }
    }

    // Check ban status for members
    const [bannedIds, setBannedIds] = useState<Set<string>>(new Set());
    useEffect(() => {
        if (!community || members.length === 0) return;
        Promise.all(members.map(async (m) => {
            const banned = await isBanned(community.id as string, m.user_id);
            return { id: m.user_id, banned };
        })).then((results) => {
            setBannedIds(new Set(results.filter((r) => r.banned).map((r) => r.id)));
        });
    }, [community, members]);

    if (loading) return <div className="text-center py-16 text-muted-foreground font-mono text-sm animate-pulse">Loading settings...</div>;
    if (!community) return null;

    const VISIBILITY_OPTS = [
        { value: "public", label: "Public", icon: Globe, desc: "Anyone can see and join" },
        { value: "restricted", label: "Restricted", icon: Eye, desc: "Anyone can see, only approved members post" },
        { value: "private", label: "Private", icon: Lock, desc: "Only members can see content" },
    ];

    return (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-3xl mx-auto space-y-8">
            {/* Back nav */}
            <motion.div variants={fadeInUp}>
                <Link href={`/communities/${slug}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="size-4" />
                    Back to g/{community.name as string}
                </Link>
            </motion.div>

            <motion.div variants={fadeInUp}>
                <h2 className="text-3xl font-serif font-medium tracking-tight text-foreground">Sphere Settings</h2>
                <p className="text-muted-foreground mt-1 font-light">Manage your sphere preferences.</p>
            </motion.div>

            {/* ── Banner & Avatar ── */}
            <motion.div variants={fadeInUp} className="bg-card/50 border border-border/50 rounded-xl overflow-hidden">
                {/* Banner upload */}
                <div className="relative h-32 bg-gradient-to-br from-cyan-900/20 to-background overflow-hidden group">
                    {Boolean(bannerPreview || community.banner_url) && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={bannerPreview ?? (community.banner_url as string)} alt="banner" className="w-full h-full object-cover" />
                    )}
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <div className="flex flex-col items-center gap-1 text-white">
                            <Upload className="size-5" />
                            <span className="text-xs">Upload Banner</span>
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) pickFile("banner", e.target.files[0]); }} />
                    </label>
                </div>

                <div className="p-6 flex items-start gap-4">
                    {/* Avatar upload */}
                    <label className="size-16 -mt-10 rounded-xl border-2 border-card overflow-hidden bg-muted/30 flex items-center justify-center text-xl font-serif font-bold text-muted-foreground/50 cursor-pointer group relative shrink-0">
                        {(avatarPreview || community.avatar_url)
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={avatarPreview ?? community.avatar_url as string} alt="avatar" className="w-full h-full object-cover" />
                            : (community.name as string).charAt(0).toUpperCase()
                        }
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Upload className="size-4 text-white" />
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) pickFile("avatar", e.target.files[0]); }} />
                    </label>
                    <div>
                        <h3 className="font-serif font-medium text-foreground">g/{community.name as string}</h3>
                        <p className="text-xs text-muted-foreground/50 font-mono">Click avatar or banner to upload images</p>
                    </div>
                </div>
            </motion.div>

            {/* ── Basic info ── */}
            <motion.div variants={fadeInUp} className="bg-card/50 border border-border/50 rounded-xl p-6 space-y-5">
                <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground/60">Basic Info</h3>

                <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1.5 block">Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                        className="w-full h-20 rounded-md bg-background/50 border border-border/50 p-3 text-sm font-light resize-none focus:outline-none focus:ring-1 focus:ring-foreground/20 placeholder:text-muted-foreground/50"
                        placeholder="Describe your community..." />
                </div>

                <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1.5 block">Category</label>
                    <div className="relative">
                        <select value={category} onChange={(e) => setCategory(e.target.value)}
                            className="w-full h-10 rounded-md bg-background/50 border border-border/50 px-3 text-sm font-light appearance-none focus:outline-none focus:ring-1 focus:ring-foreground/20 pr-8">
                            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50 pointer-events-none" />
                    </div>
                </div>

                <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1.5 block">Sphere Rules</label>
                    <textarea value={rules} onChange={(e) => setRules(e.target.value)}
                        className="w-full h-24 rounded-md bg-background/50 border border-border/50 p-3 text-sm font-light resize-none focus:outline-none focus:ring-1 focus:ring-foreground/20 placeholder:text-muted-foreground/50"
                        placeholder={"1. Be respectful\n2. No spam\n3. Stay on topic"} />
                </div>

                <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1.5 block">Tags (up to 5)</label>
                    <div className="flex gap-2 mb-2">
                        <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                            placeholder="add tag..." className="h-8 text-sm bg-background/50" />
                        <Button type="button" onClick={addTag} variant="outline" className="h-8 px-3 text-xs shrink-0">Add</Button>
                    </div>
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {tags.map((t) => (
                                <span key={t} className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-foreground/10 text-foreground/70">
                                    #{t}
                                    <button onClick={() => setTags(tags.filter((x) => x !== t))} className="hover:text-red-400 transition-colors text-xs leading-none">×</button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>

            {/* ── Visibility ── */}
            <motion.div variants={fadeInUp} className="bg-card/50 border border-border/50 rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground/60">Visibility</h3>
                <div className="space-y-2">
                    {VISIBILITY_OPTS.map(({ value, label, icon: Icon, desc }) => (
                        <button key={value} onClick={() => setVisibility(value)}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${visibility === value ? "border-foreground/30 bg-foreground/5" : "border-border/40 hover:border-foreground/20"}`}>
                            <Icon className={`size-4 shrink-0 ${visibility === value ? "text-foreground" : "text-muted-foreground/50"}`} />
                            <div>
                                <div className={`text-sm font-medium ${visibility === value ? "text-foreground" : "text-muted-foreground"}`}>{label}</div>
                                <div className="text-xs text-muted-foreground/50">{desc}</div>
                            </div>
                            {visibility === value && <div className="ml-auto size-2 rounded-full bg-foreground" />}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* ── Share Link ── */}
            <motion.div variants={fadeInUp} className="bg-card/50 border border-border/50 rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground/60">Share Link</h3>
                <div className="flex gap-2">
                    <div className="flex-1 h-10 rounded-md bg-background/50 border border-border/50 px-3 flex items-center text-sm font-mono text-muted-foreground/70 overflow-hidden">
                        <span className="truncate">{shareLink}</span>
                    </div>
                    <Button onClick={copyLink} variant="outline" className="h-10 px-4 shrink-0 gap-2">
                        {copied ? <Check className="size-4 text-green-400" /> : <Copy className="size-4" />}
                        {copied ? "Copied!" : "Copy"}
                    </Button>
                </div>
            </motion.div>

            {/* ── Save button ── */}
            <motion.div variants={fadeInUp} className="flex items-center gap-4">
                <Button onClick={handleSave} disabled={saving} className="h-10 px-6 bg-foreground text-background">
                    {saving ? "Saving..." : "Save Changes"}
                </Button>
                {saveMsg && (
                    <span className={`text-sm font-mono ${saveMsg.includes("success") ? "text-green-400" : "text-red-400"}`}>
                        {saveMsg}
                    </span>
                )}
            </motion.div>

            {/* ── Members & Moderation ── */}
            {myRole === "admin" && (
                <motion.div variants={fadeInUp} className="bg-card/50 border border-border/50 rounded-xl p-6 space-y-4">
                    <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground/60">Members &amp; Curation</h3>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                        {members.map((member) => {
                            const name = member.profiles?.full_name || member.profiles?.username || "Unknown";
                            const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
                            const isBannedMember = bannedIds.has(member.user_id);
                            return (
                                <div key={member.id} className="flex items-center gap-3 py-2 border-b border-border/20 last:border-0">
                                    <div className="size-8 rounded-md bg-foreground/10 flex items-center justify-center text-xs font-mono font-bold text-foreground/60 shrink-0">
                                        {initials}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">{name}</p>
                                        <p className="text-[10px] font-mono text-muted-foreground/50">{member.role}</p>
                                    </div>
                                    {member.role !== "admin" && (
                                        <div className="flex items-center gap-1 shrink-0">
                                            {member.role === "member" ? (
                                                <button onClick={() => handlePromote(member.user_id, "curator")}
                                                    className="flex items-center gap-1 h-7 px-2.5 rounded-md text-[10px] font-mono text-blue-400/70 hover:text-blue-400 hover:bg-blue-400/10 transition-colors">
                                                    <Shield className="size-3" /> Promote
                                                </button>
                                            ) : (
                                                <button onClick={() => handlePromote(member.user_id, "member")}
                                                    className="flex items-center gap-1 h-7 px-2.5 rounded-md text-[10px] font-mono text-muted-foreground/50 hover:text-foreground hover:bg-muted/50 transition-colors">
                                                    Demote
                                                </button>
                                            )}
                                            {isBannedMember ? (
                                                <button onClick={() => handleUnban(member.user_id)}
                                                    className="flex items-center gap-1 h-7 px-2.5 rounded-md text-[10px] font-mono text-green-400/70 hover:text-green-400 hover:bg-green-400/10 transition-colors">
                                                    Unban
                                                </button>
                                            ) : (
                                                <button onClick={() => handleBan(member.user_id)}
                                                    className="flex items-center gap-1 h-7 px-2.5 rounded-md text-[10px] font-mono text-red-400/50 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                                                    <UserX className="size-3" /> Ban
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
