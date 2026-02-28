"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Cpu, BookOpen, Users, Zap } from "lucide-react";
import Link from "next/link";
import { fadeInUp, staggerContainer, staggerFast } from "@/lib/animations";
import { ShaderAnimation } from "@/components/ui/shader-lines";

const stats = [
    { value: "2,400+", label: "AI Models", icon: Cpu },
    { value: "1,200+", label: "Papers", icon: BookOpen },
    { value: "50K+", label: "Builders", icon: Users },
    { value: "5 min", label: "Feed refresh", icon: Zap },
];

const pillars = ["Community", "Research", "Models", "Roadmaps", "AI Assistant"];

export function Hero() {
    return (
        <section className="relative overflow-hidden min-h-screen flex flex-col">
            {/* Shader animation — full background */}
            <div className="absolute inset-0 z-0">
                <ShaderAnimation />
            </div>
            <div className="absolute inset-0 z-[1] bg-black/70" />
            <div className="absolute inset-0 z-[2] bg-gradient-to-b from-black/30 via-transparent to-black/90" />
            <div className="absolute inset-0 z-[3] bg-radial-[ellipse_70%_60%_at_50%_50%] from-transparent to-black/40" />

            {/* Main content */}
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="relative z-10 flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full px-6 pt-32 pb-12"
            >


                {/* Two-column: heading + CTA | dashboard preview */}
                <div className="flex flex-col lg:flex-row lg:items-center gap-12 lg:gap-16">

                    {/* Left column */}
                    <div className="flex-1 min-w-0">
                        {/* Heading */}
                        <motion.h1
                            variants={staggerFast}
                            initial="hidden"
                            animate="visible"
                            className="font-serif font-medium tracking-tight leading-[1.02] mb-6"
                        >
                            <motion.span variants={fadeInUp} className="block text-5xl md:text-7xl lg:text-[5.5rem] text-white">
                                The developer
                            </motion.span>
                            <motion.span variants={fadeInUp} className="block text-5xl md:text-7xl lg:text-[5.5rem] text-neon">
                                knowledge OS.
                            </motion.span>
                        </motion.h1>

                        {/* Sub */}
                        <motion.p
                            variants={fadeInUp}
                            className="text-base md:text-lg max-w-md mb-8 leading-relaxed font-light"
                            style={{ color: "rgba(255,255,255,0.45)" }}
                        >
                            Community, learning roadmaps, live research feeds, and an AI assistant —
                            all in one focused space built for builders.
                        </motion.p>

                        {/* CTA */}
                        <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-4 mb-10">
                            <Link href="/signup">
                                <Button
                                    size="lg"
                                    className="h-12 px-8 font-semibold rounded-full text-black transition-all duration-300"
                                    style={{
                                        background: "hsl(186 100% 50%)",
                                        boxShadow: "0 0 24px rgba(0,210,255,0.35)",
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 0 44px rgba(0,210,255,0.6)"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 0 24px rgba(0,210,255,0.35)"; }}
                                >
                                    Start building free
                                    <ArrowRight className="ml-2 size-4" />
                                </Button>
                            </Link>
                            <Link href="/login" className="text-sm font-medium transition-colors duration-300"
                                style={{ color: "rgba(255,255,255,0.4)" }}
                            >
                                Sign in →
                            </Link>
                        </motion.div>

                        {/* Stats row */}
                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
                        >
                            {stats.map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    variants={fadeInUp}
                                    custom={i}
                                    className="flex flex-col gap-0.5 py-3 border-l pl-4"
                                    style={{ borderColor: "rgba(0,210,255,0.15)" }}
                                >
                                    <span
                                        className="text-xl font-serif font-semibold"
                                        style={{ color: "hsl(186 100% 65%)", filter: "drop-shadow(0 0 8px hsl(186 100% 50% / 0.4))" }}
                                    >
                                        {stat.value}
                                    </span>
                                    <span className="text-[10px] font-mono uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.3)" }}>
                                        {stat.label}
                                    </span>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Right column — dashboard preview */}
                    <motion.div
                        variants={fadeInUp}
                        className="flex-1 min-w-0 lg:max-w-[52%]"
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
                                <div className="h-[360px] flex">
                                    {/* Sidebar mock */}
                                    <div className="w-44 p-4 space-y-5"
                                        style={{
                                            borderRight: "1px solid rgba(0,210,255,0.06)",
                                            background: "rgba(0,0,0,0.3)",
                                        }}
                                    >
                                        <div className="space-y-2">
                                            <div className="text-[9px] font-mono uppercase tracking-[0.2em] mb-3" style={{ color: "rgba(0,210,255,0.4)" }}>Navigation</div>
                                            {["Terminal", "Community", "Research", "Models", "Roadmaps"].map((label, i) => (
                                                <motion.div
                                                    key={label}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 1.1 + i * 0.08, duration: 0.5 }}
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
                                    <div className="flex-1 p-6 space-y-4 overflow-hidden">
                                        <motion.div
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                            transition={{ delay: 1.4 }}
                                            className="h-4 w-28 rounded-sm"
                                            style={{ background: "rgba(0,210,255,0.1)" }}
                                        />
                                        <div className="grid grid-cols-3 gap-2.5">
                                            {[
                                                { label: "Papers", value: "1.2K" },
                                                { label: "Models", value: "2.4K" },
                                                { label: "Posts", value: "847" },
                                            ].map((card, i) => (
                                                <motion.div
                                                    key={card.label}
                                                    initial={{ opacity: 0, y: 15 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 1.6 + i * 0.12, duration: 0.5 }}
                                                    className="h-16 rounded-lg p-3"
                                                    style={{
                                                        background: "rgba(0,210,255,0.03)",
                                                        border: "1px solid rgba(0,210,255,0.08)",
                                                    }}
                                                >
                                                    <div className="text-[8px] font-mono uppercase tracking-widest mb-1.5" style={{ color: "rgba(0,210,255,0.4)" }}>
                                                        {card.label}
                                                    </div>
                                                    <div className="text-base font-serif font-semibold" style={{ color: "hsl(186 100% 70%)" }}>
                                                        {card.value}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                        {/* Animated chart bars */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 2.0, duration: 0.6 }}
                                            className="h-36 rounded-lg relative overflow-hidden"
                                            style={{
                                                background: "rgba(0,210,255,0.02)",
                                                border: "1px solid rgba(0,210,255,0.06)",
                                            }}
                                        >
                                            <div className="absolute bottom-0 left-0 right-0 flex items-end gap-1 px-4 h-28">
                                                {[30, 50, 25, 70, 45, 85, 55, 40, 65, 35, 75, 50].map((h, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ height: 0 }}
                                                        animate={{ height: `${h}%` }}
                                                        transition={{ delay: 2.2 + i * 0.05, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                                        className="flex-1 rounded-t-sm"
                                                        style={{ background: `rgba(0,210,255,${0.08 + h / 400})` }}
                                                    />
                                                ))}
                                            </div>
                                        </motion.div>
                                        {/* Feed lines */}
                                        <div className="space-y-2">
                                            {[80, 60, 90].map((w, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, x: 10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 2.6 + i * 0.1, duration: 0.4 }}
                                                    className="h-2 rounded-full"
                                                    style={{ width: `${w}%`, background: "rgba(0,210,255,0.06)" }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Pillars ticker */}
                <motion.div variants={fadeInUp} className="mt-16 flex items-center gap-4 overflow-hidden">
                    <span className="text-[10px] font-mono uppercase tracking-[0.25em] shrink-0" style={{ color: "rgba(0,210,255,0.4)" }}>Includes</span>
                    <div className="h-px flex-1" style={{ background: "rgba(0,210,255,0.1)" }} />
                    <div className="flex items-center gap-6 flex-wrap">
                        {pillars.map((p) => (
                            <span key={p} className="text-xs font-mono shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>
                                {p}
                            </span>
                        ))}
                    </div>
                </motion.div>
            </motion.div>

            {/* Bottom fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 z-[4] pointer-events-none shader-fade-bottom" />
        </section>
    );
}
