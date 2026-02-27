"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github, SendHorizontal, AlertCircle } from "lucide-react";
import Link from "next/link";
import { fadeInUp, slideInLeft, staggerContainer } from "@/lib/animations";
import { createClient } from "@/lib/supabase/client";

export function AuthForm({ type }: { type: "login" | "signup" }) {
    const [isLoading, setIsLoading] = useState(false);
    const [oauthLoading, setOauthLoading] = useState<"github" | "google" | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    async function signInWithOAuth(provider: "github" | "google") {
        setOauthLoading(provider);
        setError(null);

        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            setError(error.message);
            setOauthLoading(null);
        }
        // On success Supabase redirects the browser — no further action needed
    }

    async function onSubmit(event: React.SyntheticEvent) {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(event.target as HTMLFormElement);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        if (type === "signup") {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/dashboard`,
                },
            });

            if (error) {
                setError(error.message);
                setIsLoading(false);
                return;
            }

            // Supabase may require email confirmation depending on settings
            // For now, redirect to dashboard (works if email confirmation is disabled)
            router.push("/dashboard");
            router.refresh();
        } else {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError(error.message);
                setIsLoading(false);
                return;
            }

            router.push("/dashboard");
            router.refresh();
        }
    }

    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md"
        >
            <Card className="glass-panel border-border/50 shadow-2xl backdrop-blur-xl">
                <CardHeader className="space-y-1 pb-6 text-center">
                    <motion.div variants={fadeInUp}>
                        <CardTitle className="text-3xl font-serif font-medium tracking-tight text-foreground">
                            {type === "login" ? "Welcome back" : "Create an account"}
                        </CardTitle>
                    </motion.div>
                    <motion.div variants={slideInLeft}>
                        <CardDescription className="text-muted-foreground pt-2 text-base font-light">
                            {type === "login"
                                ? "Enter your credentials to access your terminal"
                                : "Enter your email below to establish your identity"}
                        </CardDescription>
                    </motion.div>
                </CardHeader>
                <CardContent className="grid gap-6">
                    <motion.div variants={fadeInUp} className="grid grid-cols-2 gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isLoading || oauthLoading !== null}
                            onClick={() => signInWithOAuth("github")}
                            className="h-11 font-medium text-muted-foreground hover:text-foreground"
                        >
                            {oauthLoading === "github" ? (
                                <SendHorizontal className="mr-2 h-4 w-4 animate-pulse" />
                            ) : (
                                <Github className="mr-2 h-4 w-4" />
                            )}
                            Github
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isLoading || oauthLoading !== null}
                            onClick={() => signInWithOAuth("google")}
                            className="h-11 font-medium text-muted-foreground hover:text-foreground"
                        >
                            {oauthLoading === "google" ? (
                                <SendHorizontal className="mr-2 h-4 w-4 animate-pulse" />
                            ) : (
                                <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4 fill-current">
                                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                                </svg>
                            )}
                            Google
                        </Button>
                    </motion.div>

                    <motion.div variants={fadeInUp} className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border/50" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase tracking-widest font-semibold">
                            <span className="bg-card px-3 text-muted-foreground/70">
                                Or continue with
                            </span>
                        </div>
                    </motion.div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-md px-4 py-3"
                        >
                            <AlertCircle className="size-4 shrink-0" />
                            {error}
                        </motion.div>
                    )}

                    <motion.div variants={fadeInUp}>
                        <form onSubmit={onSubmit}>
                            <div className="grid gap-4">
                                <div className="grid gap-1">
                                    <Input
                                        id="email"
                                        name="email"
                                        placeholder="name@example.com"
                                        type="email"
                                        autoCapitalize="none"
                                        autoComplete="email"
                                        autoCorrect="off"
                                        disabled={isLoading}
                                        required
                                        className="h-11 bg-background/50 backdrop-blur-sm"
                                    />
                                </div>
                                <div className="grid gap-1">
                                    <Input
                                        id="password"
                                        name="password"
                                        placeholder="••••••••"
                                        type="password"
                                        autoComplete={type === "login" ? "current-password" : "new-password"}
                                        disabled={isLoading}
                                        required
                                        minLength={6}
                                        className="h-11 bg-background/50 backdrop-blur-sm"
                                    />
                                </div>
                                <Button disabled={isLoading} variant="default" className="mt-2 h-12 text-md font-medium bg-foreground text-background">
                                    {isLoading && (
                                        <SendHorizontal className="mr-2 h-4 w-4 animate-pulse" />
                                    )}
                                    {type === "login" ? "Authenticate" : "Initialize Account"}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 text-center mt-2 pb-6">
                    <motion.div variants={fadeInUp} className="text-sm text-muted-foreground">
                        {type === "login" ? (
                            <>
                                Don&apos;t have an account?{" "}
                                <Link href="/signup" className="text-foreground hover:text-muted-foreground transition-colors font-medium">
                                    Sign up
                                </Link>
                            </>
                        ) : (
                            <>
                                Already have an account?{" "}
                                <Link href="/login" className="text-foreground hover:text-muted-foreground transition-colors font-medium">
                                    Log in
                                </Link>
                            </>
                        )}
                    </motion.div>
                </CardFooter>
            </Card>
        </motion.div>
    );
}
