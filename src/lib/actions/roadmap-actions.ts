"use server";

import { createClient } from "@/lib/supabase/server";

// ---- ROADMAPS ----

export async function getRoadmaps() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("roadmaps")
        .select("*, roadmap_sections(count)")
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data;
}

export async function getRoadmap(id: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("roadmaps")
        .select(`
      *,
      roadmap_sections(
        id, title, order_index,
        roadmap_topics(id, title, resource_link, order_index)
      )
    `)
        .eq("id", id)
        .single();

    if (error) return null;

    // Sort sections and topics by order_index
    if (data?.roadmap_sections) {
        data.roadmap_sections.sort((a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index);
        for (const section of data.roadmap_sections) {
            if (section.roadmap_topics) {
                section.roadmap_topics.sort((a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index);
            }
        }
    }

    return data;
}

// ---- ENROLLMENT ----

export async function enrollInRoadmap(roadmapId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
        .from("user_roadmaps")
        .insert({ user_id: user.id, roadmap_id: roadmapId });

    if (error) throw new Error(error.message);
}

export async function unenrollFromRoadmap(roadmapId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Get section IDs for this roadmap
    const { data: sections } = await supabase
        .from("roadmap_sections")
        .select("id")
        .eq("roadmap_id", roadmapId);

    if (sections && sections.length > 0) {
        const sectionIds = sections.map((s: { id: string }) => s.id);
        const { data: topics } = await supabase
            .from("roadmap_topics")
            .select("id")
            .in("section_id", sectionIds);

        if (topics && topics.length > 0) {
            const topicIds = topics.map((t: { id: string }) => t.id);
            await supabase
                .from("user_progress")
                .delete()
                .eq("user_id", user.id)
                .in("topic_id", topicIds);
        }
    }

    const { error } = await supabase
        .from("user_roadmaps")
        .delete()
        .eq("user_id", user.id)
        .eq("roadmap_id", roadmapId);

    if (error) throw new Error(error.message);
}

export async function isEnrolled(roadmapId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
        .from("user_roadmaps")
        .select("id")
        .eq("user_id", user.id)
        .eq("roadmap_id", roadmapId)
        .single();

    return !!data;
}

export async function getUserRoadmaps() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from("user_roadmaps")
        .select("roadmap_id, enrolled_at, roadmaps(*)")
        .eq("user_id", user.id)
        .order("enrolled_at", { ascending: false });

    if (error) return [];
    return data;
}

// ---- PROGRESS ----

export async function toggleTopicComplete(topicId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data: existing } = await supabase
        .from("user_progress")
        .select("id, completed")
        .eq("user_id", user.id)
        .eq("topic_id", topicId)
        .single();

    if (existing) {
        const newStatus = !existing.completed;
        await supabase
            .from("user_progress")
            .update({
                completed: newStatus,
                completed_at: newStatus ? new Date().toISOString() : null
            })
            .eq("id", existing.id);
        return { completed: newStatus };
    } else {
        await supabase
            .from("user_progress")
            .insert({ user_id: user.id, topic_id: topicId, completed: true, completed_at: new Date().toISOString() });
        return { completed: true };
    }
}

export async function getUserProgress(roadmapId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {};

    // Get all topic IDs for this roadmap
    const { data: sections } = await supabase
        .from("roadmap_sections")
        .select("id")
        .eq("roadmap_id", roadmapId);

    if (!sections || sections.length === 0) return {};

    const sectionIds = sections.map((s: { id: string }) => s.id);

    const { data: topics } = await supabase
        .from("roadmap_topics")
        .select("id")
        .in("section_id", sectionIds);

    if (!topics || topics.length === 0) return {};

    const topicIds = topics.map((t: { id: string }) => t.id);

    const { data: progress } = await supabase
        .from("user_progress")
        .select("topic_id, completed")
        .eq("user_id", user.id)
        .in("topic_id", topicIds);

    const map: Record<string, boolean> = {};
    if (progress) {
        for (const p of progress) {
            map[p.topic_id] = p.completed;
        }
    }
    return map;
}

export async function getRoadmapProgress(roadmapId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { completed: 0, total: 0 };

    const { data: sections } = await supabase
        .from("roadmap_sections")
        .select("id")
        .eq("roadmap_id", roadmapId);

    if (!sections || sections.length === 0) return { completed: 0, total: 0 };

    const sectionIds = sections.map((s: { id: string }) => s.id);

    const { data: topics } = await supabase
        .from("roadmap_topics")
        .select("id")
        .in("section_id", sectionIds);

    if (!topics) return { completed: 0, total: 0 };

    const topicIds = topics.map((t: { id: string }) => t.id);

    const { data: progress } = await supabase
        .from("user_progress")
        .select("topic_id")
        .eq("user_id", user.id)
        .eq("completed", true)
        .in("topic_id", topicIds);

    return { completed: progress?.length ?? 0, total: topics.length };
}
