/**
 * One-shot manual ingest endpoint.
 *
 * Kept for backward compatibility and external triggers
 * (Vercel Cron, GitHub Actions, curl, etc.)
 *
 * Usage: GET /api/ingest?secret=<CRON_SECRET>
 */

import { NextResponse } from "next/server";
import { runNewsWorker, runPapersWorker, runModelsWorker, runMetricsWorker } from "@/lib/workers";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");

    if (secret !== (process.env.CRON_SECRET ?? "griva-ingest-2026")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const started = new Date().toISOString();

    const [newsResult, papersResult, modelsResult] = await Promise.allSettled([
        runNewsWorker(),
        runPapersWorker(),
        runModelsWorker(),
        runMetricsWorker(),
    ]);

    const news   = newsResult.status   === "fulfilled" ? newsResult.value   : { count: 0, errors: [String((newsResult   as PromiseRejectedResult).reason)] };
    const papers = papersResult.status === "fulfilled" ? papersResult.value : { count: 0, errors: [String((papersResult as PromiseRejectedResult).reason)] };
    const models = modelsResult.status === "fulfilled" ? modelsResult.value : { count: 0, errors: [String((modelsResult as PromiseRejectedResult).reason)] };

    return NextResponse.json({
        success:  true,
        started,
        finished: new Date().toISOString(),
        ingested: {
            news:   news.count,
            papers: papers.count,
            models: models.count,
        },
        errors: [...news.errors, ...papers.errors, ...models.errors],
    });
}
