"use server";

import { createClient } from "@/lib/supabase/server";

export interface ProfileData {
    username?: string;
    full_name?: string;
    bio?: string;
    avatar_url?: string;
    cover_image_url?: string;
    github_url?: string;
    linkedin_url?: string;
    twitter_url?: string;
    website_url?: string;
    location?: string;
}

export async function updateProfile(data: ProfileData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
        .from("profiles")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", user.id);

    if (error) throw new Error(error.message);
    return { success: true };
}

export async function getFullProfile() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    return data;
}

export async function uploadProfileImage(formData: FormData): Promise<string> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const file = formData.get("file") as File;
    const bucket = formData.get("bucket") as string || "avatars";

    if (!file || file.size === 0) throw new Error("No file provided");
    if (file.size > 5 * 1024 * 1024) throw new Error("File too large (max 5MB)");

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) throw new Error("Invalid file type");

    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${user.id}/${Date.now()}.${ext}`;

    // Delete old files in user folder
    const { data: existing } = await supabase.storage
        .from(bucket)
        .list(user.id);

    if (existing && existing.length > 0) {
        const toDelete = existing.map((f) => `${user.id}/${f.name}`);
        await supabase.storage.from(bucket).remove(toDelete);
    }

    const { error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { upsert: true });

    if (error) throw new Error(error.message);

    const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

    return urlData.publicUrl;
}

export async function deleteProfileImage(bucket: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data: existing } = await supabase.storage
        .from(bucket)
        .list(user.id);

    if (existing && existing.length > 0) {
        const toDelete = existing.map((f) => `${user.id}/${f.name}`);
        await supabase.storage.from(bucket).remove(toDelete);
    }

    // Clear URL in profile
    const field = bucket === "avatars" ? "avatar_url" : "cover_image_url";
    await supabase.from("profiles").update({ [field]: null }).eq("id", user.id);
}
