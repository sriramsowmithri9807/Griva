/**
 * Griva AI — powered by Ollama + Llama 3.2
 * Local AI inference, no paid APIs.
 * Install: curl -fsSL https://ollama.com/install.sh | sh
 * Pull model: ollama pull llama3.2
 */

const OLLAMA_BASE_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || "llama3.2";

interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

interface OllamaResponse {
    model: string;
    message: { role: string; content: string };
    done: boolean;
}

interface EmbeddingResponse {
    embedding: number[];
}

export async function isOllamaAvailable(): Promise<boolean> {
    try {
        const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, { signal: AbortSignal.timeout(2000) });
        return res.ok;
    } catch {
        return false;
    }
}

export async function chat(
    messages: ChatMessage[],
    model: string = DEFAULT_MODEL
): Promise<string> {
    const available = await isOllamaAvailable();
    if (!available) {
        return getFallbackResponse(messages[messages.length - 1]?.content || "");
    }

    try {
        const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model,
                messages,
                stream: false,
                options: { temperature: 0.7, num_predict: 1024 },
            }),
        });

        if (!res.ok) return getFallbackResponse(messages[messages.length - 1]?.content || "");
        const data = (await res.json()) as OllamaResponse;
        return data.message?.content || "No response generated.";
    } catch {
        return getFallbackResponse(messages[messages.length - 1]?.content || "");
    }
}

export async function generateEmbedding(
    text: string,
    model: string = "nomic-embed-text"
): Promise<number[] | null> {
    const available = await isOllamaAvailable();
    if (!available) return null;

    try {
        const res = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ model, prompt: text.slice(0, 2000) }),
        });

        if (!res.ok) return null;
        const data = (await res.json()) as EmbeddingResponse;
        return data.embedding || null;
    } catch {
        return null;
    }
}

export async function summarize(text: string): Promise<string> {
    return chat([
        {
            role: "system",
            content: "You are a research assistant. Provide a concise summary in 3-5 bullet points. Be precise and technical.",
        },
        { role: "user", content: `Summarize this:\n\n${text.slice(0, 3000)}` },
    ]);
}

function getFallbackResponse(query: string): string {
    const q = query.toLowerCase();

    if (q.includes("recommend") || q.includes("suggest")) {
        return "**Recommendations:**\n\nBased on your activity, I'd suggest:\n\n1. **Explore trending communities** — Join active discussions in your areas of interest\n2. **Continue your roadmap** — Pick up where you left off in your learning journey\n3. **Read recent papers** — Check the Research hub for the latest publications\n\n*For AI-powered recommendations, install Ollama locally: `curl -fsSL https://ollama.com/install.sh | sh && ollama pull llama3.2`*";
    }

    if (q.includes("paper") || q.includes("research") || q.includes("summarize")) {
        return "**Research Assistant**\n\nI can help you understand research papers, find relevant publications, and explain complex concepts.\n\n*For full AI capabilities, install Ollama: `curl -fsSL https://ollama.com/install.sh | sh && ollama pull llama3.2`*";
    }

    return `**Griva AI Assistant**\n\nI'm your knowledge companion. I can help with:\n\n• **Research** — Explain papers and concepts\n• **Learning** — Suggest next steps in your roadmap\n• **Community** — Recommend discussions to join\n• **Discovery** — Find relevant news and models\n\n*Currently running in offline mode. For full AI capabilities, install Ollama: \`curl -fsSL https://ollama.com/install.sh | sh && ollama pull llama3.2\`*`;
}
