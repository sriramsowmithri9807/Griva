"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { profile, user, signOut, loading } = useAuth();
    const router = useRouter();

    const initials = profile?.full_name
        ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : user?.email?.[0]?.toUpperCase() ?? "?";

    const displayName = profile?.username || profile?.full_name || user?.email?.split("@")[0] || "User";

    async function handleSignOut() {
        await signOut();
        router.push("/login");
        router.refresh();
    }

    return (
        <div className="flex h-screen overflow-hidden bg-background selection:bg-muted">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-hidden relative isolate">
                <div className="absolute inset-0 z-[-1]">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-3xl opacity-50 pointer-events-none" />
                </div>
                <header className="h-16 flex items-center justify-between px-8 border-b border-border/50 bg-background/80 backdrop-blur-md shrink-0 z-10">
                    <div className="text-sm text-muted-foreground font-medium font-serif italic">
                        {loading ? "Loading..." : `Welcome, ${displayName}`}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSignOut}
                            className="h-8 px-3 rounded-md border border-border/50 bg-card/50 flex items-center justify-center cursor-pointer hover:bg-muted transition-colors duration-300 text-xs text-muted-foreground hover:text-foreground gap-2"
                        >
                            <LogOut className="size-3" />
                            <span className="hidden sm:inline">Sign out</span>
                        </button>
                        <div className="h-8 w-8 rounded-md border border-border bg-card flex items-center justify-center cursor-pointer hover:bg-muted transition-colors duration-500">
                            <span className="text-xs font-serif font-bold text-foreground">{initials}</span>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 scroll-smooth z-10">
                    <div className="max-w-6xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
