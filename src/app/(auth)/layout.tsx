import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ShaderAnimation } from "@/components/ui/shader-lines";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background">
            {/* Shader animation as background */}
            <div className="absolute inset-0 z-0 opacity-55">
                <ShaderAnimation />
            </div>

            {/* Dark overlay layers */}
            <div className="absolute inset-0 z-[1] bg-black/72" />
            <div className="absolute inset-0 z-[2] bg-gradient-to-b from-black/50 via-transparent to-black/60" />
            <div
                className="absolute inset-0 z-[3]"
                style={{
                    background: "radial-gradient(ellipse 65% 55% at 50% 50%, transparent 0%, rgba(0,0,0,0.55) 100%)",
                }}
            />

            {/* Top Navigation */}
            <div className="absolute top-0 left-0 w-full p-6 z-20 flex justify-between items-center max-w-7xl mx-auto">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-sm font-medium transition-colors group"
                    style={{ color: "rgba(0,210,255,0.55)" }}
                >
                    <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                    Return to Anthology
                </Link>
                <div className="flex items-center gap-2">
                    <div
                        className="size-5 rounded-full flex items-center justify-center"
                        style={{
                            background: "rgba(0,210,255,0.1)",
                            border: "1px solid rgba(0,210,255,0.3)",
                            boxShadow: "0 0 10px rgba(0,210,255,0.2)",
                        }}
                    >
                        <div className="size-1.5 rounded-full" style={{ background: "hsl(186 100% 60%)" }} />
                    </div>
                    <div className="font-serif font-bold text-xl tracking-tight text-white">
                        Griva
                    </div>
                </div>
            </div>

            <div className="relative z-10 w-full flex justify-center p-4 mt-12">
                {children}
            </div>
        </div>
    );
}
