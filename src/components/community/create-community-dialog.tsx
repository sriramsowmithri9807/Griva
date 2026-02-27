"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createCommunity } from "@/lib/actions/community-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";

export function CreateCommunityDialog() {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function handleCreate() {
        if (!name.trim() || loading) return;
        setLoading(true);
        setError(null);
        try {
            const community = await createCommunity(name.trim(), description.trim());
            setOpen(false);
            setName("");
            setDescription("");
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
            <Button
                onClick={() => setOpen(true)}
                className="bg-foreground text-background hover:opacity-90 h-9 text-sm"
            >
                <Plus className="size-4 mr-2" />
                New Community
            </Button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => setOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md bg-card border border-border/50 rounded-xl p-6 shadow-2xl space-y-5"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-serif font-medium text-foreground">Create Community</h3>
                                <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                                    <X className="size-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1.5 block">Name</label>
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Machine Learning"
                                        className="h-10 bg-background/50"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1.5 block">Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="What is this community about?"
                                        className="w-full h-20 rounded-md bg-background/50 border border-border/50 p-3 text-sm font-light resize-none focus:outline-none focus:ring-1 focus:ring-foreground/20 placeholder:text-muted-foreground/50"
                                    />
                                </div>
                            </div>

                            {error && (
                                <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-md px-3 py-2">{error}</p>
                            )}

                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="outline" onClick={() => setOpen(false)} className="h-9 text-sm">
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCreate}
                                    disabled={!name.trim() || loading}
                                    className="h-9 text-sm bg-foreground text-background"
                                >
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
