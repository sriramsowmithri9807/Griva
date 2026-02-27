"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { CheckCircle2, Clock, PlayCircle } from "lucide-react";

const roadmapItems = [
    {
        title: "Autonomous Swarm Agents",
        description: "Deploy self-directed research nodes that can query, synthesize, and compile findings without human intervention.",
        status: "Active Research",
        quarter: "Phase III - 2026",
        icon: PlayCircle,
        color: "text-foreground"
    },
    {
        title: "Cross-Disciplinary Synthesizer",
        description: "An AI model designed to find non-obvious connections between disparate fields of study (e.g., biology and economics).",
        status: "Planned",
        quarter: "Phase IV - 2026",
        icon: Clock,
        color: "text-muted-foreground"
    },
    {
        title: "Decentralized Peer Review",
        description: "Implement a cryptographic verification layer for research claims and academic citations.",
        status: "Planned",
        quarter: "Phase IV - 2026",
        icon: Clock,
        color: "text-muted-foreground"
    },
    {
        title: "Core Knowledge Graph",
        description: "The foundational infrastructure for ingesting and semantically linking global research papers.",
        status: "Deployed",
        quarter: "Phase II - 2026",
        icon: CheckCircle2,
        color: "text-foreground/70"
    },
];

export default function RoadmapPage() {
    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto space-y-12"
        >
            <div className="flex flex-col gap-3">
                <motion.h2 variants={fadeInUp} className="text-4xl font-serif font-medium tracking-tight text-foreground">
                    Research Trajectory
                </motion.h2>
                <motion.p variants={fadeInUp} className="text-muted-foreground text-lg font-light">
                    The strategic evolution of the Griva intelligence network.
                </motion.p>
            </div>

            <div className="relative border-l border-border/30 ml-4 md:ml-6 pl-6 md:pl-10 py-6 space-y-16">
                {roadmapItems.map((item, index) => (
                    <motion.div key={index} variants={fadeInUp} className="relative group">
                        {/* Timeline node */}
                        <div className="absolute -left-[35px] md:-left-[51px] top-6 size-8 md:size-10 rounded-full bg-background border border-border/50 flex items-center justify-center p-1 relative z-10 shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:bg-muted/50">
                            <item.icon className={`size-1/2 ${item.color} transition-colors duration-500`} />
                        </div>

                        <motion.div whileHover={{ x: 5, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}>
                            <Card className="glass-panel border-border/50 shadow-md relative pb-4 overflow-hidden hover:shadow-xl transition-all duration-500 group-hover:border-foreground/20">
                                <div className={`absolute left-0 top-0 bottom-0 w-1 transition-colors duration-500 ${item.status === 'Deployed' ? 'bg-foreground/40' :
                                    item.status === 'Active Research' ? 'bg-foreground/80' :
                                        'bg-muted-foreground/30'
                                    }`} />
                                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                                    <div className="space-y-1.5">
                                        <CardTitle className="text-2xl font-serif font-medium group-hover:text-foreground transition-colors overflow-hidden">
                                            {item.title}
                                        </CardTitle>
                                        <CardDescription className="font-mono text-xs uppercase tracking-widest">{item.quarter}</CardDescription>
                                    </div>
                                    <Badge variant={item.status === 'Planned' ? 'outline' : 'default'} className="ml-auto glass transition-colors font-medium">
                                        {item.status}
                                    </Badge>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground text-base leading-relaxed font-light">
                                        {item.description}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
