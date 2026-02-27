/**
 * Manual trigger endpoint for background workers.
 *
 * Actual scheduling is handled by src/instrumentation.ts via node-cron —
 * workers run automatically every 5 minutes on server boot.
 * This endpoint exists for on-demand triggers (admin, external cron services,
 * debugging).
 *
 * Usage:
 *   GET /api/cron?secret=<CRON_SECRET>                  — status check
 *   GET /api/cron?secret=<CRON_SECRET>&action=run       — run all workers
 *   GET /api/cron?secret=<CRON_SECRET>&action=news      — run news only
 *   GET /api/cron?secret=<CRON_SECRET>&action=papers    — run papers only
 *   GET /api/cron?secret=<CRON_SECRET>&action=models    — run models only
 *   GET /api/cron?secret=<CRON_SECRET>&action=metrics   — run metrics only
 */

import { NextResponse } from "next/server";
import {
    runNewsWorker,
    runPapersWorker,
    runModelsWorker,
    runMetricsWorker,
    runAllWorkers,
} from "@/lib/workers";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");
    const action = searchParams.get("action") ?? "status";

    if (secret !== (process.env.CRON_SECRET ?? "griva-ingest-2026")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const started = new Date().toISOString();

    if (action === "run") {
        const results = await runAllWorkers();
        return NextResponse.json({
            status:  "completed",
            started,
            workers: results.map((r) => r.status),
        });
    }

    if (action === "news") {
        const result = await runNewsWorker();
        return NextResponse.json({ status: "completed", started, ...result });
    }

    if (action === "papers") {
        const result = await runPapersWorker();
        return NextResponse.json({ status: "completed", started, ...result });
    }

    if (action === "models") {
        const result = await runModelsWorker();
        return NextResponse.json({ status: "completed", started, ...result });
    }

    if (action === "metrics") {
        await runMetricsWorker();
        return NextResponse.json({ status: "completed", started });
    }

    // Default: status check
    return NextResponse.json({
        status:   "scheduled",
        schedule: "*/5 * * * * (every 5 min via src/instrumentation.ts)",
        workers:  ["news", "papers", "models", "metrics"],
    });
}
