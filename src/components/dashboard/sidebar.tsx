"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, Users, Users2, Map as MapIcon, GraduationCap, Newspaper, BookOpen, Cpu, Sparkles, Settings, LogOut, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

const menuItems = [
    { icon: LayoutDashboard, label: "Terminal",    href: "/dashboard" },
    { icon: Sparkles,        label: "Griva AI",    href: "/assistant" },
    { icon: Users,           label: "Community",   href: "/community" },
    { icon: Users2,          label: "Communities", href: "/communities" },
    { icon: Newspaper,       label: "News",        href: "/news" },
    { icon: BookOpen,        label: "Research",    href: "/research" },
    { icon: Cpu,             label: "Models",      href: "/models" },
    { icon: GraduationCap,   label: "Roadmaps",    href: "/roadmaps" },
    { icon: MapIcon,         label: "Trajectory",  href: "/roadmap" },
    { icon: UserCircle,      label: "Identity",    href: "/profile" },
    { icon: Settings,        label: "Preferences", href: "/settings/profile" },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { signOut } = useAuth();

    async function handleSignOut() {
        await signOut();
        router.push("/login");
        router.refresh();
    }

    return (
        <motion.aside
            initial={{ x: -250 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="hidden md:flex w-64 flex-col border-r border-border/50 bg-card/50 backdrop-blur-xl shrink-0"
        >
            <div className="h-16 flex items-center px-6 border-b border-border/50">
                <Link href="/" className="flex items-center gap-3">
                    <div className="size-7 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(0,210,255,0.1)", border: "1px solid rgba(0,210,255,0.35)", boxShadow: "0 0 12px rgba(0,210,255,0.2)" }}>
                        <div className="size-2 rounded-full" style={{ background: "hsl(186 100% 60%)" }} />
                    </div>
                    <span className="font-serif font-bold text-lg tracking-tight text-white">Griva</span>
                </Link>
            </div>

            <nav className="flex-1 px-4 py-8 space-y-2">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-4">
                    Navigation
                </div>
                {menuItems.map((item, index) => {
                    const isActive = pathname === item.href;

                    return (
                        <Link key={item.href} href={item.href}>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * index, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-500 relative group",
                                    isActive
                                        ? "text-white bg-cyan-500/10 border border-cyan-500/20"
                                        : "text-muted-foreground hover:text-white hover:bg-white/[0.04] hover:pl-4"
                                )}
                            >
                                <item.icon className="size-4 relative z-10" />
                                <span className="relative z-10">{item.label}</span>
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-border/50">
                <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-500"
                >
                    <LogOut className="size-4" />
                    <span>Disconnect</span>
                </button>
            </div>
        </motion.aside>
    );
}

