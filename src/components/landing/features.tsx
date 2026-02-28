"use client";

import { motion } from "framer-motion";
import { Network, Users, BookOpen, Map, Fingerprint, Library, ArrowUpRight } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const features = [
    {
        title: "Community Swarm",
        description: "Real developer discourse without the algorithmic noise. Post, discuss, and collaborate in topic-focused spaces.",
        icon: Users,
    },
    {
        title: "Visual Roadmaps",
        description: "Non-linear learning paths that respect how engineers actually think — branch, explore, and revisit on your terms.",
        icon: Map,
    },
    {
        title: "Deep Research",
        description: "1,200+ arXiv papers across 18 AI/ML categories, refreshed every 5 minutes with save and search built in.",
        icon: Library,
    },
    {
        title: "Connected Graph",
        description: "Every snippet, paper, and decision linked through a global knowledge graph. Nothing exists in isolation.",
        icon: Network,
    },
    {
        title: "Scholar Mode",
        description: "Draft, publish, and share findings in environments purpose-built for code and technical writing.",
        icon: BookOpen,
    },
    {
        title: "Verified Identity",
        description: "Build reputation on contribution merit, not engagement metrics. Your work speaks for itself.",
        icon: Fingerprint,
    },
];

export function Features() {
    return (
        <section className="py-32 relative overflow-hidden bg-background" id="features">
            {/* Cyber grid background */}
            <div className="absolute inset-0 cyber-grid opacity-100" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none"
                style={{ background: "rgba(0,210,255,0.04)" }} />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none"
                style={{ background: "rgba(0,150,255,0.04)" }} />

            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">

                {/* Section header — left aligned, asymmetric */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={staggerContainer}
                    className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-20"
                >
                    <div className="max-w-lg">
                        <motion.div variants={fadeInUp} className="inline-block mb-5">
                            <span className="text-xs font-mono uppercase tracking-[0.3em]"
                                style={{ color: "hsl(186 100% 60%)" }}>
                                What&apos;s Inside
                            </span>
                            <div className="neon-line mt-2 w-full" />
                        </motion.div>
                        <motion.h2 variants={fadeInUp} className="text-4xl sm:text-5xl font-serif tracking-tight text-foreground">
                            Tools that respect<br />your focus.
                        </motion.h2>
                    </div>
                    <motion.p variants={fadeInUp} className="max-w-sm text-base font-light text-muted-foreground lg:text-right">
                        No distractions. No social feed algorithms.<br />
                        Just the features that help you build, learn, and ship.
                    </motion.p>
                </motion.div>

                {/* Feature rows — editorial numbered list */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={staggerContainer}
                    className="divide-y"
                    style={{ borderTop: "1px solid rgba(0,210,255,0.08)", borderColor: "rgba(0,210,255,0.08)" }}
                >
                    {features.map((feature, i) => (
                        <motion.div
                            key={feature.title}
                            variants={fadeInUp}
                            className="group grid grid-cols-[3rem_1fr_1fr_2rem] items-center gap-8 py-8 cursor-default transition-all duration-500 hover:bg-[rgba(0,210,255,0.02)] px-4 -mx-4 rounded-lg"
                        >
                            {/* Number */}
                            <span className="text-[11px] font-mono tracking-widest tabular-nums"
                                style={{ color: "rgba(0,210,255,0.35)" }}>
                                0{i + 1}
                            </span>

                            {/* Icon + Title */}
                            <div className="flex items-center gap-4">
                                <div className="shrink-0 flex size-10 items-center justify-center rounded-lg neon-icon transition-all duration-500">
                                    <feature.icon className="size-4" aria-hidden="true" />
                                </div>
                                <h3 className="text-lg font-serif font-medium text-foreground">{feature.title}</h3>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-muted-foreground leading-relaxed font-light hidden md:block">
                                {feature.description}
                            </p>

                            {/* Arrow */}
                            <ArrowUpRight
                                className="size-4 opacity-0 group-hover:opacity-100 transition-all duration-300 justify-self-end"
                                style={{ color: "rgba(0,210,255,0.5)" }}
                            />

                            {/* Mobile: description below */}
                            <p className="text-sm text-muted-foreground leading-relaxed font-light md:hidden col-start-2 col-end-4 -mt-4">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
