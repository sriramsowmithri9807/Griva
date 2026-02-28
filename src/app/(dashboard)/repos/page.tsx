import { Metadata } from "next";
import { Github, ExternalLink, Calendar, Star, GitFork, ArrowRight } from "lucide-react";
import { getGithubRepos } from "@/lib/actions/github-actions";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export const metadata: Metadata = {
    title: "Latest Github Repos | Griva",
    description: "Discover the latest open-source repositories.",
};

export const revalidate = 3600; // Revalidate every hour

export default async function ReposPage() {
    const items = await getGithubRepos();

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-serif font-medium tracking-tight text-foreground flex items-center gap-3">
                        <Github className="size-8 text-cyan-500" />
                        Latest Github Repos
                    </h2>
                    <p className="text-muted-foreground mt-1 font-light">
                        Curated collection of recently trending open-source projects.
                    </p>
                </div>
            </div>

            {items.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground font-light text-sm">
                    Unable to load repositories at this time. Please try again later.
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    {items.map((item, index) => {
                        const title = item.title || "Untitled Repository";
                        const description = item.contentSnippet || "No description available.";
                        const link = item.link || "#";
                        const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();

                        // Parse repo name from title if it matches "user/repo"
                        const repoParts = title.split("/");
                        const isRepoName = repoParts.length === 2 && !title.includes(" ");

                        return (
                            <a
                                key={index}
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex flex-col p-5 rounded-xl border border-border/50 bg-card/50 hover:bg-muted/50 transition-all duration-300 relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <h3 className="font-medium text-lg leading-tight text-foreground group-hover:text-cyan-400 transition-colors line-clamp-2">
                                            {isRepoName ? (
                                                <span className="flex items-center gap-2">
                                                    <span className="text-muted-foreground font-normal">{repoParts[0]}/</span>
                                                    {repoParts[1]}
                                                </span>
                                            ) : (
                                                title
                                            )}
                                        </h3>
                                        <ExternalLink className="size-4 text-muted-foreground/50 group-hover:text-cyan-400 shrink-0 mt-1 transition-colors" />
                                    </div>

                                    <p className="text-sm text-muted-foreground font-light line-clamp-3 mb-4 flex-1">
                                        {description}
                                    </p>

                                    <div className="mt-auto flex items-center gap-4 text-xs font-medium text-muted-foreground/70">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="size-3.5" />
                                            {formatDistanceToNow(pubDate, { addSuffix: true })}
                                        </div>
                                    </div>
                                </div>
                            </a>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
