"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ShaderAnimation } from "@/components/ui/shader-lines";

export function CTA() {
    return (
        <section className="relative overflow-hidden py-40">
            {/* Shader panel */}
            <div className="absolute inset-0 z-0 opacity-30">
                <ShaderAnimation />
            </div>
            <div className="absolute inset-0 z-[1] bg-gradient-to-b from-background via-transparent to-background" />
            <div className="absolute inset-0 z-[2] bg-gradient-to-r from-background via-transparent to-background" />

            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
                className="relative mx-auto max-w-4xl px-6 lg:px-8 z-10"
            >
                {/* Top label */}
                <motion.div variants={fadeInUp} className="flex items-center gap-4 mb-12">
                    <div className="h-px flex-1" style={{ background: "rgba(0,210,255,0.1)" }} />
                    <span
                        className="text-xs font-mono uppercase tracking-[0.3em] px-4 py-1.5 rounded-full"
                        style={{
                            color: "hsl(186 100% 60%)",
                            background: "rgba(0,210,255,0.07)",
                            border: "1px solid rgba(0,210,255,0.2)",
                        }}
                    >
                        Free forever · No card required
                    </span>
                    <div className="h-px flex-1" style={{ background: "rgba(0,210,255,0.1)" }} />
                </motion.div>

                {/* Headline */}
                <motion.div variants={fadeInUp} className="mb-6">
                    <h2 className="text-5xl md:text-7xl font-serif font-medium tracking-tight text-foreground leading-[1.02]">
                        The command center<br />
                        <span className="text-neon">for serious builders.</span>
                    </h2>
                </motion.div>

                {/* Sub */}
                <motion.p
                    variants={fadeInUp}
                    className="max-w-lg text-lg font-light leading-relaxed text-muted-foreground mb-12"
                >
                    Thousands of developers already use Griva to stay sharp, collaborate on research,
                    and ship faster — all from one focused workspace.
                </motion.p>

                {/* CTA + inline metrics */}
                <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center gap-8">
                    <Link href="/signup">
                        <Button
                            size="lg"
                            className="h-14 px-10 font-semibold rounded-full text-black transition-all duration-300 text-base"
                            style={{
                                background: "hsl(186 100% 50%)",
                                boxShadow: "0 0 28px rgba(0,210,255,0.35)",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 0 48px rgba(0,210,255,0.6)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 0 28px rgba(0,210,255,0.35)"; }}
                        >
                            Join Griva
                            <ArrowRight className="ml-2 size-5" />
                        </Button>
                    </Link>

                    <div className="flex items-center gap-6">
                        {[
                            { v: "1,200+", l: "papers" },
                            { v: "2,400+", l: "models" },
                            { v: "50K+", l: "builders" },
                        ].map(({ v, l }) => (
                            <div key={l} className="flex flex-col">
                                <span className="text-base font-serif font-semibold" style={{ color: "hsl(186 100% 65%)" }}>{v}</span>
                                <span className="text-[10px] font-mono uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.3)" }}>{l}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.p variants={fadeInUp} className="mt-10 text-xs font-mono tracking-wider"
                    style={{ color: "rgba(0,210,255,0.25)" }}>
                    No credit card · No lock-in · Cancel anytime
                </motion.p>
            </motion.div>
        </section>
    );
}
