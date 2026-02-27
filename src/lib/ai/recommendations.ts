/**
 * Smart Recommendations Engine
 * Recommends communities, roadmaps, papers, and posts based on user activity.
 */

import { createClient } from "@/lib/supabase/server";

interface Recommendation {
    type: "community" | "roadmap" | "paper" | "post";
    id: string;
    title: string;
    description: string;
    reason: string;
}

export async function getRecommendations(): Promise<Recommendation[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const recommendations: Recommendation[] = [];

    // --- Recommend communities user hasn't joined ---
    const { data: memberships } = await supabase
        .from("community_members")
        .select("community_id")
        .eq("user_id", user.id);

    const joinedIds = memberships?.map((m: { community_id: string }) => m.community_id) || [];

    const { data: communities } = await supabase
        .from("communities")
        .select("id, name, slug, description, community_members(count)")
        .order("created_at", { ascending: false })
        .limit(10);

    if (communities) {
        for (const c of communities) {
            if (!joinedIds.includes(c.id)) {
                const count = (c.community_members as { count: number }[])?.[0]?.count ?? 0;
                recommendations.push({
                    type: "community",
                    id: c.slug,
                    title: `g/${c.name}`,
                    description: (c.description || "Active community").slice(0, 100),
                    reason: `${count} members · Trending`,
                });
            }
        }
    }

    // --- Recommend roadmaps user hasn't enrolled in ---
    const { data: enrollments } = await supabase
        .from("user_roadmaps")
        .select("roadmap_id")
        .eq("user_id", user.id);

    const enrolledIds = enrollments?.map((e: { roadmap_id: string }) => e.roadmap_id) || [];

    const { data: roadmaps } = await supabase
        .from("roadmaps")
        .select("id, title, description, category")
        .limit(10);

    if (roadmaps) {
        for (const r of roadmaps) {
            if (!enrolledIds.includes(r.id)) {
                recommendations.push({
                    type: "roadmap",
                    id: r.id,
                    title: r.title,
                    description: (r.description || "Learning path").slice(0, 100),
                    reason: r.category || "Career growth",
                });
            }
        }
    }

    // --- Recommend recent papers ---
    const { data: papers } = await supabase
        .from("research_papers")
        .select("id, title, category, authors")
        .order("published_date", { ascending: false })
        .limit(5);

    if (papers) {
        for (const p of papers) {
            recommendations.push({
                type: "paper",
                id: p.id,
                title: p.title.slice(0, 80),
                description: `By ${(p.authors || "Unknown").slice(0, 50)}`,
                reason: `${p.category} · Recent`,
            });
        }
    }

    // Shuffle and return top 8
    return recommendations.sort(() => Math.random() - 0.5).slice(0, 8);
}
