import { getNews } from "@/lib/actions/news-actions";
import { getResearchPapers } from "@/lib/actions/research-actions";
import { getModels } from "@/lib/actions/models-actions";
import { getGithubRepos } from "@/lib/actions/github-actions";

import { Newspaper, BookOpen, Cpu, Github, ExternalLink, ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export async function LiveFeeds() {
    // Fetch data concurrently for performance
    const [newsData, papersData, modelsData, githubData] = await Promise.all([
        getNews(undefined, undefined, 1, 4),
        getResearchPapers(undefined, undefined, 1, 4),
        getModels(undefined, undefined, 1, 4),
        getGithubRepos(4)
    ]);

    const news = newsData.data as any[];
    const papers = papersData.data as any[];
    const models = modelsData.data as any[];
    const githubRepos = githubData;

    return (
        <section className="relative py-24 z-10 border-t border-border/50" style={{ background: "rgba(3, 7, 11, 0.4)" }}>
            <div className="max-w-7xl mx-auto px-6">

                <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-4">
                    <div>
                        <h2 className="text-3xl font-serif font-medium tracking-tight text-foreground flex items-center gap-3">
                            <span className="size-2 rounded-full animate-pulse" style={{ background: "hsl(186 100% 60%)", boxShadow: "0 0 12px rgba(0,210,255,0.6)" }} />
                            Live Pulse
                        </h2>
                        <p className="text-muted-foreground mt-2 font-light max-w-xl">
                            Real-time intelligence gathered globally across the AI ecosystem.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                    {/* Models Feed */}
                    <FeedColumn
                        title="New Models"
                        icon={Cpu}
                        iconColor="text-pink-400"
                        viewAllLink="/models"
                        items={models.map(m => ({
                            title: m.name,
                            desc: m.provider,
                            link: `/models?search=${encodeURIComponent(m.name)}`,
                            date: m.created_at ? new Date(m.created_at) : new Date()
                        }))}
                    />

                    {/* Papers Feed */}
                    <FeedColumn
                        title="Research"
                        icon={BookOpen}
                        iconColor="text-violet-400"
                        viewAllLink="/research"
                        items={papers.map(p => ({
                            title: p.title,
                            desc: p.authors,
                            link: p.pdf_url || `/research?search=${encodeURIComponent(p.title)}`,
                            date: p.published_date ? new Date(p.published_date) : new Date()
                        }))}
                    />

                    {/* News Feed */}
                    <FeedColumn
                        title="AI News"
                        icon={Newspaper}
                        iconColor="text-orange-400"
                        viewAllLink="/news"
                        items={news.map(n => ({
                            title: n.title,
                            desc: n.source,
                            link: n.url || `/news?search=${encodeURIComponent(n.title)}`,
                            date: n.published_at ? new Date(n.published_at) : new Date()
                        }))}
                    />

                    {/* Github Feed */}
                    <FeedColumn
                        title="Github Repos"
                        icon={Github}
                        iconColor="text-cyan-400"
                        viewAllLink="/repos"
                        items={githubRepos.map((r: any) => ({
                            title: r.title,
                            desc: r.contentSnippet?.substring(0, 60) + "...",
                            link: r.link,
                            date: r.pubDate ? new Date(r.pubDate) : new Date()
                        }))}
                    />

                </div>
            </div>
        </section>
    );
}

function FeedColumn({ title, icon: Icon, iconColor, items, viewAllLink }: { title: string, icon: any, iconColor: string, items: any[], viewAllLink: string }) {
    return (
        <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/40">
                <Icon className={`size-4 ${iconColor}`} />
                <h3 className="text-sm font-semibold tracking-wide text-foreground uppercase">{title}</h3>
            </div>

            {/* List */}
            <div className="space-y-3 flex-1">
                {items.length === 0 ? (
                    <div className="text-xs text-muted-foreground/70 italic px-2">No items found.</div>
                ) : (
                    items.map((item, i) => (
                        <a key={i} href={item.link} target={item.link.startsWith("http") ? "_blank" : undefined} className="group block p-3 rounded-lg bg-card/30 border border-border/30 hover:bg-card/80 hover:border-border/80 transition-all duration-300">
                            <h4 className="text-sm font-medium leading-tight text-foreground/90 group-hover:text-white line-clamp-2 mb-1">
                                {item.title}
                            </h4>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-muted-foreground line-clamp-1 flex-1 pr-2">
                                    {item.desc}
                                </span>
                                <span className="text-[10px] text-muted-foreground/60 whitespace-nowrap">
                                    {formatDistanceToNow(item.date, { addSuffix: true }).replace("about ", "")}
                                </span>
                            </div>
                        </a>
                    ))
                )}
            </div>

            {/* Footer link */}
            <Link href={viewAllLink} className="group flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mt-2 py-2 rounded-md hover:bg-white/5">
                View All
                <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
            </Link>
        </div>
    );
}
