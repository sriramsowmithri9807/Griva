"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ShaderAnimation } from "@/components/ui/shader-lines";

export function CTA() {
    return (
        <section className="relative overflow-hidden py-32">
            {/* Contained shader panel */}
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
                className="relative mx-auto max-w-3xl px-6 lg:px-8 text-center z-10"
            >
                {/* Badge */}
                <motion.div variants={fadeInUp} className="flex justify-center mb-8">
                    <span
                        className="text-xs font-mono uppercase tracking-[0.3em] px-4 py-1.5 rounded-full"
                        style={{
                            color: "hsl(186 100% 60%)",
                            background: "rgba(0,210,255,0.07)",
                            border: "1px solid rgba(0,210,255,0.2)",
                        }}
                    >
                        Free forever for individuals
                    </span>
                </motion.div>

                <motion.div variants={fadeInUp}>
                    <span className="text-6xl md:text-7xl font-serif font-medium tracking-tight text-foreground block mb-6">
                        Ready to build?
                    </span>
                </motion.div>

                <motion.p
                    variants={fadeInUp}
                    className="mx-auto max-w-md text-lg font-light leading-relaxed text-muted-foreground mb-12"
                >
                    Join thousands of developers and builders already using Griva to learn, discuss, and ship faster.
                </motion.p>

                <motion.div
                    variants={fadeInUp}
                    className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto"
                >
                    <form className="flex w-full gap-3">
                        <Input
                            type="email"
                            placeholder="you@company.com"
                            className="h-12 rounded-full backdrop-blur-sm placeholder:text-muted-foreground/50"
                            style={{
                                background: "rgba(0,210,255,0.04)",
                                borderColor: "rgba(0,210,255,0.15)",
                            }}
                        />
                        <Link href="/signup">
                            <Button
                                className="h-12 px-8 rounded-full font-semibold shrink-0 text-black transition-all duration-300"
                                style={{
                                    background: "hsl(186 100% 50%)",
                                    boxShadow: "0 0 20px rgba(0,210,255,0.3)",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.boxShadow = "0 0 36px rgba(0,210,255,0.5)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.boxShadow = "0 0 20px rgba(0,210,255,0.3)";
                                }}
                            >
                                Join <ArrowRight className="ml-2 size-4" />
                            </Button>
                        </Link>
                    </form>
                </motion.div>

                <motion.p variants={fadeInUp} className="mt-8 text-xs font-mono tracking-wider"
                    style={{ color: "rgba(0,210,255,0.3)" }}>
                    No credit card required · Cancel anytime
                </motion.p>
            </motion.div>
        </section>
    );
}
