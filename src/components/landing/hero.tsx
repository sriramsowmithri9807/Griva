"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Cpu, BookOpen, Users } from "lucide-react";
import Link from "next/link";
import { fadeInUp, staggerContainer, staggerFast } from "@/lib/animations";
import { ShaderAnimation } from "@/components/ui/shader-lines";

const headingWords = ["Where", "builders", "think", "out", "loud."];

const stats = [
    { value: "50K+", label: "Developers", icon: Users },
    { value: "200+", label: "AI Models", icon: Cpu },
    { value: "10K+", label: "Papers", icon: BookOpen },
];

export function Hero() {
    return (
        <section className="relative overflow-hidden min-h-screen flex flex-col items-center justify-center">
            {/* Shader animation — full background */}
            <div className="absolute inset-0 z-0">
                <ShaderAnimation />
            </div>

            {/* Layered overlays for readability */}
            <div className="absolute inset-0 z-[1] bg-black/65" />
            <div className="absolute inset-0 z-[2] bg-gradient-to-b from-black/40 via-transparent to-black/80" />
            {/* Subtle vignette edges */}
            <div className="absolute inset-0 z-[3] bg-radial-[ellipse_70%_60%_at_50%_50%] from-transparent to-black/40" />

            {/* Main content */}
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="max-w-7xl mx-auto px-6 relative z-10 text-center w-full pt-28 pb-16"
            >
                {/* Status badge */}
                <motion.div variants={fadeInUp} className="flex justify-center mb-10">
                    <div className="inline-flex items-center gap-3 text-xs font-mono uppercase tracking-[0.3em] border rounded-full px-6 py-2.5 backdrop-blur-sm"
                        style={{
                            color: "hsl(186 100% 65%)",
                            borderColor: "rgba(0,210,255,0.25)",
                            background: "rgba(0,210,255,0.05)",
                        }}
                    >
                        <span className="neon-dot" />
                        Griva v4.0 — Now Live
                    </div>
                </motion.div>

                {/* Animated heading */}
                <motion.h1
                    variants={staggerFast}
                    initial="hidden"
                    animate="visible"
                    className="text-6xl md:text-8xl lg:text-[6.5rem] font-serif font-medium tracking-tight mb-8 max-w-5xl mx-auto leading-[1.05]"
                >
                    {headingWords.map((word, i) => (
                        <motion.span
                            key={i}
                            variants={fadeInUp}
                            className={`inline-block mr-[0.28em] ${i === 1 || i === 4 ? "text-neon" : "text-white"}`}
                        >
                            {word}
                        </motion.span>
                    ))}
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    variants={fadeInUp}
                    className="text-lg md:text-xl max-w-xl mx-auto mb-12 leading-relaxed font-light"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                >
                    Griva is the developer knowledge platform that merges community,
                    learning roadmaps, and deep research into one space.
                </motion.p>

                {/* CTA buttons */}
                <motion.div
                    variants={fadeInUp}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
                >
                    <Link href="/signup">
                        <Button
                            size="lg"
                            className="w-full sm:w-auto text-base h-14 px-10 font-semibold rounded-full text-black transition-all duration-300"
                            style={{
                                background: "hsl(186 100% 50%)",
                                boxShadow: "0 0 24px rgba(0,210,255,0.35)",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = "0 0 40px rgba(0,210,255,0.55)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = "0 0 24px rgba(0,210,255,0.35)";
                            }}
                        >
                            Get Started Free
                            <ArrowRight className="ml-2 size-4" />
                        </Button>
                    </Link>
                    <Link href="#features">
                        <Button
                            variant="outline"
                            size="lg"
                            className="w-full sm:w-auto text-base h-14 px-10 font-medium rounded-full text-white transition-all duration-300 backdrop-blur-sm"
                            style={{
                                borderColor: "rgba(0,210,255,0.25)",
                                background: "rgba(0,210,255,0.04)",
                            }}
                        >
                            See Features
                        </Button>
                    </Link>
                </motion.div>

                {/* Stats row */}
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="flex items-center justify-center gap-10 md:gap-20"
                >
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            variants={fadeInUp}
                            custom={i}
                            className="flex flex-col items-center gap-1"
                        >
                            <span
                                className="text-3xl font-serif font-semibold"
                                style={{ color: "hsl(186 100% 65%)", filter: "drop-shadow(0 0 8px hsl(186 100% 50% / 0.5))" }}
                            >
                                {stat.value}
                            </span>
                            <span className="text-[10px] font-mono uppercase tracking-[0.25em]" style={{ color: "rgba(255,255,255,0.35)" }}>
                                {stat.label}
                            </span>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Animated dashboard preview */}
                <motion.div
                    variants={fadeInUp}
                    className="mt-24 lg:mt-28 relative mx-auto max-w-5xl"
                >
                    <div className="glow-border rounded-2xl">
                        <div className="rounded-2xl overflow-hidden shadow-2xl"
                            style={{
                                background: "rgba(5, 12, 18, 0.85)",
                                border: "1px solid rgba(0,210,255,0.12)",
                                backdropFilter: "blur(16px)",
                            }}
                        >
                            {/* Terminal bar */}
                            <div className="h-10 flex items-center px-4 gap-2"
                                style={{ background: "rgba(0,0,0,0.6)", borderBottom: "1px solid rgba(0,210,255,0.08)" }}
                            >
                                <div className="size-3 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
                                <div className="size-3 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
                                <div className="size-3 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
                                <div className="mx-auto text-[10px] font-mono tracking-[0.25em]" style={{ color: "rgba(0,210,255,0.5)" }}>
                                    griva://dashboard
                                </div>
                            </div>

                            {/* Content body */}
                            <div className="h-[400px] flex">
                                {/* Sidebar mock */}
                                <div className="w-52 p-5 space-y-6"
                                    style={{
                                        borderRight: "1px solid rgba(0,210,255,0.06)",
                                        background: "rgba(0,0,0,0.3)",
                                    }}
                                >
                                    <div className="space-y-2.5">
                                        <div className="text-[9px] font-mono uppercase tracking-[0.2em]" style={{ color: "rgba(0,210,255,0.4)" }}>Navigation</div>
                                        {["Terminal", "Community", "Roadmap", "Research", "Models"].map((label, i) => (
                                            <motion.div
                                                key={label}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 1.2 + i * 0.08, duration: 0.5 }}
                                                className="h-7 rounded-md flex items-center px-3 text-[11px] transition-all duration-300"
                                                style={i === 0
                                                    ? { background: "rgba(0,210,255,0.08)", color: "hsl(186 100% 65%)", border: "1px solid rgba(0,210,255,0.15)" }
                                                    : { color: "rgba(255,255,255,0.35)" }
                                                }
                                            >
                                                {label}
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Main content mock */}
                                <div className="flex-1 p-8 space-y-5 overflow-hidden">
                                    <motion.div
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        transition={{ delay: 1.5 }}
                                        className="h-5 w-36 rounded-sm"
                                        style={{ background: "rgba(0,210,255,0.1)" }}
                                    />
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { label: "Active Users", value: "2.4K" },
                                            { label: "New Papers", value: "138" },
                                            { label: "AI Models", value: "217" },
                                        ].map((card, i) => (
                                            <motion.div
                                                key={card.label}
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 1.7 + i * 0.12, duration: 0.5 }}
                                                className="h-20 rounded-lg p-3.5"
                                                style={{
                                                    background: "rgba(0,210,255,0.03)",
                                                    border: "1px solid rgba(0,210,255,0.08)",
                                                }}
                                            >
                                                <div className="text-[9px] font-mono uppercase tracking-widest mb-2" style={{ color: "rgba(0,210,255,0.4)" }}>
                                                    {card.label}
                                                </div>
                                                <div className="text-lg font-serif font-semibold" style={{ color: "hsl(186 100% 70%)" }}>
                                                    {card.value}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                    {/* Animated chart bars */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 2.1, duration: 0.6 }}
                                        className="h-40 rounded-lg relative overflow-hidden"
                                        style={{
                                            background: "rgba(0,210,255,0.02)",
                                            border: "1px solid rgba(0,210,255,0.06)",
                                        }}
                                    >
                                        <div className="absolute bottom-0 left-0 right-0 flex items-end gap-1 px-5 h-32">
                                            {[30, 50, 25, 70, 45, 85, 55, 40, 65, 35, 75, 50].map((h, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${h}%` }}
                                                    transition={{ delay: 2.3 + i * 0.05, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                                    className="flex-1 rounded-t-sm"
                                                    style={{ background: `rgba(0,210,255,${0.08 + h / 400})` }}
                                                />
                                            ))}
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Bottom fade into next section */}
            <div className="absolute bottom-0 left-0 right-0 h-32 z-[4] pointer-events-none shader-fade-bottom" />
        </section>
    );
}
