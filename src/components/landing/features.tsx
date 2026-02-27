"use client";

import { motion } from "framer-motion";
import { Network, Users, BookOpen, Map, Fingerprint, Library } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const features = [
    {
        title: "Community Swarm",
        description: "A space for real developer discourse — not algorithmic noise.",
        icon: Users,
    },
    {
        title: "Visual Roadmaps",
        description: "Non-linear learning paths that respect how engineers actually think.",
        icon: Map,
    },
    {
        title: "Deep Research",
        description: "Explore interconnected clusters of high-density developer knowledge.",
        icon: Library,
    },
    {
        title: "Connected Graph",
        description: "Every snippet, paper, and decision linked through a global graph.",
        icon: Network,
    },
    {
        title: "Scholar Mode",
        description: "Draft, publish, and share findings in environments built for code.",
        icon: BookOpen,
    },
    {
        title: "Verified Identity",
        description: "Build reputation based on contribution merit, not engagement metrics.",
        icon: Fingerprint,
    },
];

export function Features() {
    return (
        <section className="py-32 relative overflow-hidden bg-background" id="features">
            {/* Cyber grid background */}
            <div className="absolute inset-0 cyber-grid opacity-100" />

            {/* Glow blobs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none"
                style={{ background: "rgba(0,210,255,0.04)" }} />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none"
                style={{ background: "rgba(0,150,255,0.04)" }} />

            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                {/* Section header */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={staggerContainer}
                    className="mx-auto max-w-2xl text-center mb-20"
                >
                    <motion.div variants={fadeInUp} className="inline-block mb-5">
                        <span className="text-xs font-mono uppercase tracking-[0.3em] pb-1"
                            style={{ color: "hsl(186 100% 60%)" }}>
                            What&apos;s Inside
                        </span>
                        <div className="neon-line mt-2 w-full" />
                    </motion.div>
                    <motion.p variants={fadeInUp} className="mt-4 text-4xl font-serif tracking-tight text-foreground sm:text-5xl">
                        Tools that respect your focus.
                    </motion.p>
                    <motion.p variants={fadeInUp} className="mt-6 text-lg font-light text-muted-foreground max-w-lg mx-auto">
                        No distractions. No social feed algorithms. Just the features that help you build, learn, and ship.
                    </motion.p>
                </motion.div>

                {/* Feature bento grid */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={staggerContainer}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px rounded-2xl overflow-hidden"
                    style={{
                        background: "rgba(0,210,255,0.06)",
                        border: "1px solid rgba(0,210,255,0.1)",
                    }}
                >
                    {features.map((feature, i) => (
                        <motion.div
                            key={feature.title}
                            variants={fadeInUp}
                            className="group bg-background p-8 md:p-10 relative cursor-default transition-all duration-500"
                            style={{ background: "hsl(var(--background))" }}
                            whileHover={{ background: "rgba(0,210,255,0.025)" }}
                        >
                            {/* Index label */}
                            <span className="absolute top-4 right-5 text-[10px] font-mono tracking-widest"
                                style={{ color: "rgba(0,210,255,0.25)" }}>
                                0{i + 1}
                            </span>

                            {/* Icon */}
                            <div className="mb-6 flex size-12 items-center justify-center rounded-lg neon-icon">
                                <feature.icon className="size-5" aria-hidden="true" />
                            </div>

                            <h3 className="text-lg font-serif font-medium text-foreground mb-2.5">{feature.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed font-light">
                                {feature.description}
                            </p>

                            {/* Hover bottom accent line */}
                            <div
                                className="absolute bottom-0 left-0 h-[1px] w-0 group-hover:w-full transition-all duration-500"
                                style={{ background: "linear-gradient(90deg, transparent, rgba(0,210,255,0.4), transparent)" }}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
