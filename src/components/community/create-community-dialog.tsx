"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createCommunity } from "@/lib/actions/community-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, ChevronDown } from "lucide-react";

const CATEGORIES = [
    "General", "Artificial Intelligence", "Machine Learning", "Deep Learning",
    "NLP", "Computer Vision", "Robotics", "Web Dev", "Systems", "Security",
    "Data Science", "Research", "Career", "Tools & Libraries", "Open Source",
];

export function CreateCommunityDialog() {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("General");
    const [rules, setRules] = useState("");
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    function addTag() {
        const t = tagInput.trim().toLowerCase();
        if (t && !tags.includes(t) && tags.length < 5) {
            setTags([...tags, t]);
            setTagInput("");
        }
    }

    function removeTag(t: string) { setTags(tags.filter((x) => x !== t)); }

    function reset() {
        setName(""); setDescription(""); setCategory("General");
        setRules(""); setTagInput(""); setTags([]); setError(null);
    }

    async function handleCreate() {
        if (!name.trim() || loading) return;
        setLoading(true);
        setError(null);
        try {
            const community = await createCommunity(name.trim(), description.trim(), category, rules.trim(), tags);
            setOpen(false);
            reset();
            router.push(`/communities/${community.slug}`);
            router.refresh();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Failed to create community");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Button onClick={() => setOpen(true)} className="bg-foreground text-background hover:opacity-90 h-9 text-sm">
                <Plus className="size-4 mr-2" />
                New Community
            </Button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
                        onClick={() => setOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-lg bg-card border border-border/50 rounded-xl p-6 shadow-2xl space-y-5 my-8"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-serif font-medium text-foreground">Create Community</h3>
                                <button onClick={() => { setOpen(false); reset(); }} className="text-muted-foreground hover:text-foreground transition-colors">
                                    <X className="size-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1.5 block">Community Name *</label>
                                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Machine Learning" className="h-10 bg-background/50" maxLength={50} />
                                    {name && <p className="text-[10px] font-mono text-muted-foreground/50 mt-1">URL: g/{slug}</p>}
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
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1.5 block">Description</label>
                                    <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                                        placeholder="What is this community about?"
                                        className="w-full h-20 rounded-md bg-background/50 border border-border/50 p-3 text-sm font-light resize-none focus:outline-none focus:ring-1 focus:ring-foreground/20 placeholder:text-muted-foreground/50" />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1.5 block">Community Rules</label>
                                    <textarea value={rules} onChange={(e) => setRules(e.target.value)}
                                        placeholder={"1. Be respectful\n2. No spam\n3. Stay on topic"}
                                        className="w-full h-20 rounded-md bg-background/50 border border-border/50 p-3 text-sm font-light resize-none focus:outline-none focus:ring-1 focus:ring-foreground/20 placeholder:text-muted-foreground/50" />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1.5 block">Tags (up to 5)</label>
                                    <div className="flex gap-2">
                                        <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                                            placeholder="add tag..." className="h-8 text-sm bg-background/50" />
                                        <Button type="button" onClick={addTag} variant="outline" className="h-8 px-3 text-xs shrink-0">Add</Button>
                                    </div>
                                    {tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {tags.map((t) => (
                                                <span key={t} className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-foreground/10 text-foreground/70">
                                                    #{t}
                                                    <button onClick={() => removeTag(t)} className="hover:text-red-400 transition-colors"><X className="size-2.5" /></button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {error && <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-md px-3 py-2">{error}</p>}

                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="outline" onClick={() => { setOpen(false); reset(); }} className="h-9 text-sm">Cancel</Button>
                                <Button onClick={handleCreate} disabled={!name.trim() || loading} className="h-9 text-sm bg-foreground text-background">
                                    {loading ? "Creating..." : "Create"}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
