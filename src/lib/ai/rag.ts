/**
 * RAG (Retrieval Augmented Generation) Pipeline
 * 1. Takes user query
 * 2. Finds semantically similar content from knowledge base
 * 3. Injects context into LLM prompt
 * 4. Returns AI-generated response
 */

import { chat } from "./ollama";
import { createClient } from "@/lib/supabase/server";

const SYSTEM_PROMPT = `You are Griva AI, a knowledgeable assistant for a developer knowledge platform. 
You help users understand research, learn new technologies, and navigate their career.
When answering, reference the context provided. Be concise, technical, and helpful.
If the context doesn't contain relevant information, say so and provide general guidance.
Format responses with markdown for readability.`;

interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

export async function ragQuery(
    userQuery: string,
    conversationHistory: ChatMessage[] = []
): Promise<string> {
    // Step 1: Retrieve relevant context from database
    const context = await retrieveContext(userQuery);

    // Step 2: Build messages with context injection
    const messages: ChatMessage[] = [
        { role: "system", content: SYSTEM_PROMPT },
    ];

    // Add conversation history (last 6 messages for memory)
    const recentHistory = conversationHistory.slice(-6);
    messages.push(...recentHistory);

    // Inject context into the user's query
    const augmentedQuery = context
        ? `Context from Griva knowledge base:\n---\n${context}\n---\n\nUser question: ${userQuery}`
        : userQuery;

    messages.push({ role: "user", content: augmentedQuery });

    // Step 3: Generate response via Ollama
    return chat(messages);
}

async function retrieveContext(query: string): Promise<string | null> {
    const supabase = await createClient();

    // Text-based search across multiple tables
    const results: string[] = [];

    // Search posts
    const { data: posts } = await supabase
        .from("posts")
        .select("title, content")
        .or(`title.ilike.%${query.slice(0, 50)}%,content.ilike.%${query.slice(0, 50)}%`)
        .limit(3);

    if (posts) {
        for (const p of posts) {
            results.push(`[Community Post] ${p.title}: ${(p.content || "").slice(0, 200)}`);
        }
    }

    // Search research papers
    const { data: papers } = await supabase
        .from("research_papers")
        .select("title, authors, abstract")
        .or(`title.ilike.%${query.slice(0, 50)}%,abstract.ilike.%${query.slice(0, 50)}%`)
        .limit(3);

    if (papers) {
        for (const p of papers) {
            results.push(`[Research Paper] "${p.title}" by ${p.authors || "Unknown"}: ${(p.abstract || "").slice(0, 200)}`);
        }
    }

    // Search news
    const { data: news } = await supabase
        .from("news_articles")
        .select("title, summary, source")
        .or(`title.ilike.%${query.slice(0, 50)}%,summary.ilike.%${query.slice(0, 50)}%`)
        .limit(3);

    if (news) {
        for (const n of news) {
            results.push(`[News - ${n.source}] ${n.title}: ${(n.summary || "").slice(0, 200)}`);
        }
    }

    // Search roadmap topics
    const { data: topics } = await supabase
        .from("roadmap_topics")
        .select("title, roadmap_sections(title, roadmaps(title))")
        .ilike("title", `%${query.slice(0, 50)}%`)
        .limit(3);

    if (topics) {
        for (const t of topics) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const sec = t.roadmap_sections as any;
            results.push(`[Roadmap: ${sec?.roadmaps?.title || "Unknown"}] Section "${sec?.title || ""}": ${t.title}`);
        }
    }

    return results.length > 0 ? results.join("\n\n") : null;
}
