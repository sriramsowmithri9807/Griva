import { NextResponse } from "next/server";
import { ragQuery } from "@/lib/ai/rag";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { message, conversationId } = await request.json();

        if (!message || typeof message !== "string") {
            return NextResponse.json({ error: "Message required" }, { status: 400 });
        }

        // Get conversation history
        let history: { role: "user" | "assistant"; content: string }[] = [];
        if (conversationId) {
            const { data: messages } = await supabase
                .from("chat_messages")
                .select("role, content")
                .eq("conversation_id", conversationId)
                .eq("user_id", user.id)
                .order("created_at", { ascending: true })
                .limit(10);

            if (messages) {
                history = messages as { role: "user" | "assistant"; content: string }[];
            }
        }

        // Generate conversation ID if new
        const convId = conversationId || crypto.randomUUID();

        // Save user message
        await supabase.from("chat_messages").insert({
            conversation_id: convId,
            user_id: user.id,
            role: "user",
            content: message,
        });

        // Run RAG pipeline
        const response = await ragQuery(message, history);

        // Save assistant response
        await supabase.from("chat_messages").insert({
            conversation_id: convId,
            user_id: user.id,
            role: "assistant",
            content: response,
        });

        return NextResponse.json({
            response,
            conversationId: convId,
        });
    } catch (error) {
        console.error("AI chat error:", error);
        return NextResponse.json(
            { error: "Failed to generate response" },
            { status: 500 }
        );
    }
}
