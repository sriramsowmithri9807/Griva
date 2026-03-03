/**
 * Seed all 52 roadmaps + practice problems.
 *
 * Usage: GET /api/seed-roadmaps?secret=<CRON_SECRET>
 *
 * Run the roadmaps-v2-migration.sql in Supabase SQL Editor first
 * to create the roadmap_problems and problem_submissions tables.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ROADMAPS } from "@/lib/roadmap-data";

// ── Problem generator ─────────────────────────────────────────────────────
// Generates 2 problems per topic algorithmically.
function generateProblems(topicTitle: string, topicId: string) {
    const problems = [];

    // Problem 1: MCQ comprehension check
    problems.push({
        topic_id: topicId,
        title: `What is the primary purpose of ${topicTitle}?`,
        description: `Choose the answer that best describes the core purpose and main use case of "${topicTitle}" in software development.`,
        type: "mcq",
        difficulty: "beginner",
        options: JSON.stringify([
            `To understand and apply ${topicTitle} concepts in real projects`,
            `To memorize theoretical definitions only`,
            `To replace all other related technologies`,
            `To avoid learning other programming fundamentals`,
        ]),
        correct_option: 0,
        hints: [`Think about what problem "${topicTitle}" solves in everyday development.`],
        order_index: 0,
    });

    // Problem 2: Short answer or coding based on topic
    const isCoding = /\b(code|function|class|hook|component|api|query|algorithm|loop|recursion|async|promise|goroutine|closure|generics|struct|trait|pattern|expression|statement|route|endpoint|schema|model|migration|deploy|docker|kubernetes|terraform|git|ssh|jwt|oauth)\b/i.test(topicTitle);

    if (isCoding) {
        problems.push({
            topic_id: topicId,
            title: `Write a code example demonstrating ${topicTitle}`,
            description: `Write a minimal but working code example that demonstrates the key concept of "${topicTitle}". Focus on clarity and correctness over completeness.`,
            type: "coding",
            difficulty: "intermediate",
            starter_code: `// Demonstrate: ${topicTitle}\n// Write your code below:\n\n`,
            hints: [`Start with the simplest possible working example, then add details.`, `Check the documentation for the correct syntax.`],
            order_index: 1,
        });
    } else {
        problems.push({
            topic_id: topicId,
            title: `Explain ${topicTitle} in your own words`,
            description: `In 2-3 sentences, explain what "${topicTitle}" is, why it matters, and when you would use it in a real project.`,
            type: "short_answer",
            difficulty: "beginner",
            hints: [`Think about a concrete real-world example where ${topicTitle} would be applied.`],
            order_index: 1,
        });
    }

    return problems;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");

    if (secret !== (process.env.CRON_SECRET ?? "griva-ingest-2026")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    let totalRoadmaps = 0;
    let totalSections = 0;
    let totalTopics = 0;
    let totalProblems = 0;
    const errors: string[] = [];

    for (const roadmap of ROADMAPS) {
        // Upsert roadmap
        const { data: existing } = await supabase
            .from("roadmaps")
            .select("id")
            .eq("title", roadmap.title)
            .maybeSingle();

        let rmId: string;

        if (existing) {
            rmId = existing.id;
        } else {
            const { data: rm, error: rmErr } = await supabase
                .from("roadmaps")
                .insert({ title: roadmap.title, description: roadmap.description, category: roadmap.category })
                .select("id")
                .single();

            if (rmErr || !rm) {
                errors.push(`Roadmap "${roadmap.title}": ${rmErr?.message}`);
                continue;
            }
            rmId = rm.id;
        }
        totalRoadmaps++;

        for (let si = 0; si < roadmap.sections.length; si++) {
            const section = roadmap.sections[si];

            const { data: existingSec } = await supabase
                .from("roadmap_sections")
                .select("id")
                .eq("roadmap_id", rmId)
                .eq("title", section.title)
                .maybeSingle();

            let secId: string;

            if (existingSec) {
                secId = existingSec.id;
            } else {
                const { data: sec, error: secErr } = await supabase
                    .from("roadmap_sections")
                    .insert({ roadmap_id: rmId, title: section.title, order_index: si })
                    .select("id")
                    .single();

                if (secErr || !sec) {
                    errors.push(`Section "${section.title}": ${secErr?.message}`);
                    continue;
                }
                secId = sec.id;
            }
            totalSections++;

            // Get existing topics for this section
            const { data: existingTopics } = await supabase
                .from("roadmap_topics")
                .select("id, title")
                .eq("section_id", secId);

            const existingTitleMap = new Map(
                (existingTopics ?? []).map((t: { id: string; title: string }) => [t.title, t.id])
            );

            for (let ti = 0; ti < section.topics.length; ti++) {
                const topicTitle = section.topics[ti];
                let topicId: string;

                if (existingTitleMap.has(topicTitle)) {
                    topicId = existingTitleMap.get(topicTitle)!;
                    totalTopics++;
                } else {
                    const { data: newTopic, error: topErr } = await supabase
                        .from("roadmap_topics")
                        .insert({
                            section_id: secId,
                            title: topicTitle,
                            resource_link: "https://roadmap.sh",
                            order_index: ti,
                        })
                        .select("id")
                        .single();

                    if (topErr || !newTopic) {
                        errors.push(`Topic "${topicTitle}": ${topErr?.message}`);
                        continue;
                    }
                    topicId = newTopic.id;
                    totalTopics++;
                }

                // Seed problems if none exist for this topic
                const { count: existingProblems } = await supabase
                    .from("roadmap_problems")
                    .select("id", { count: "exact", head: true })
                    .eq("topic_id", topicId);

                if (!existingProblems || existingProblems === 0) {
                    const probs = generateProblems(topicTitle, topicId);
                    const { error: probErr } = await supabase
                        .from("roadmap_problems")
                        .insert(probs);

                    if (probErr) {
                        // Problems table might not exist yet — skip silently
                        if (!probErr.message.includes("does not exist")) {
                            errors.push(`Problems for "${topicTitle}": ${probErr.message}`);
                        }
                    } else {
                        totalProblems += probs.length;
                    }
                }
            }
        }
    }

    return NextResponse.json({
        success: true,
        seeded: {
            roadmaps: totalRoadmaps,
            sections: totalSections,
            topics: totalTopics,
            problems: totalProblems,
        },
        errors,
    });
}
