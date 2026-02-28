import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { CTA } from "@/components/landing/cta";
import { LiveFeeds } from "@/components/landing/live-feeds";
import { Suspense } from "react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <header className="fixed top-0 w-full z-50 h-16 flex items-center px-6 transition-all"
        style={{
          background: "rgba(3, 7, 11, 0.7)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(0,210,255,0.07)",
        }}
      >
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(0,210,255,0.1)",
                border: "1px solid rgba(0,210,255,0.3)",
                boxShadow: "0 0 12px rgba(0,210,255,0.2)",
              }}
            >
              <div className="size-2 rounded-full"
                style={{ background: "hsl(186 100% 60%)" }} />
            </div>
            <span className="font-serif font-bold text-lg tracking-tight text-white">Griva</span>
          </div>

          {/* Auth only */}
          <div className="flex items-center gap-4">
            <a href="/login" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors duration-300">
              Sign in
            </a>
            <a
              href="/signup"
              className="nav-cta-btn hidden sm:inline-flex h-9 items-center justify-center rounded-full px-5 py-2 text-sm font-semibold text-black"
            >
              Get Started
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Hero />
        <Suspense fallback={<div className="h-64 flex items-center justify-center text-muted-foreground/50 text-sm">Loading live feeds...</div>}>
          <LiveFeeds />
        </Suspense>
        <Features />
        <CTA />
      </main>

      <footer className="py-10 bg-background"
        style={{ borderTop: "1px solid rgba(0,210,255,0.07)" }}
      >
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="size-5 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(0,210,255,0.08)",
                border: "1px solid rgba(0,210,255,0.2)",
              }}
            >
              <div className="size-1.5 rounded-full" style={{ background: "hsl(186 100% 55%)" }} />
            </div>
            <span className="font-serif font-bold tracking-tight text-lg text-white">Griva</span>
            <span className="text-xs text-muted-foreground/40 font-mono">© 2026</span>
          </div>
          <div className="flex gap-8 text-sm text-muted-foreground">
            <a href="#" className="hover:text-white transition-colors duration-300">Privacy</a>
            <a href="#" className="hover:text-white transition-colors duration-300">Terms</a>
            <a href="#" className="hover:text-white transition-colors duration-300" style={{ color: "rgba(0,210,255,0.5)" }}>GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
