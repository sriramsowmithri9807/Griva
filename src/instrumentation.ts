/**
 * src/instrumentation.ts
 *
 * Next.js Instrumentation Hook — runs ONCE when the server process starts.
 * This is the only correct place for persistent background jobs in Next.js.
 *
 * node-cron schedules background workers to run every 5 minutes.
 * On server boot, all workers also run immediately so data is fresh right away.
 *
 * Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
    // CRITICAL: Only run in the Node.js runtime.
    // Next.js calls register() for BOTH Node.js and Edge runtimes.
    // node-cron, rss-parser, and fs are not available in the Edge runtime.
    if (process.env.NEXT_RUNTIME !== "nodejs") return;

    // Dynamic imports so these Node-only modules are never bundled for Edge.
    const cron = await import("node-cron");
    const {
        runNewsWorker,
        runPapersWorker,
        runModelsWorker,
        runMetricsWorker,
    } = await import("@/lib/workers");

    console.log("[GRIVA] Instrumentation: scheduling background workers (every 5 min)...");

    // -------------------------------------------------------------------------
    // Run all workers immediately on startup so data is available right away.
    // Fire-and-forget: don't block server startup.
    // -------------------------------------------------------------------------
    Promise.allSettled([
        runNewsWorker(),
        runPapersWorker(),
        runModelsWorker(),
        runMetricsWorker(),
    ]).then((results) => {
        const failed = results.filter((r) => r.status === "rejected").length;
        console.log(`[GRIVA] Startup ingestion complete${failed > 0 ? ` (${failed} workers had errors)` : ""}`);
    });

    // -------------------------------------------------------------------------
    // Cron: every 5 minutes  →  */5 * * * *
    // Each worker has its own schedule so an error in one never affects others.
    // -------------------------------------------------------------------------
    cron.schedule("*/5 * * * *", async () => {
        console.log("[GRIVA:Cron] News tick");
        await runNewsWorker();
    });

    cron.schedule("*/5 * * * *", async () => {
        console.log("[GRIVA:Cron] Papers tick");
        await runPapersWorker();
    });

    cron.schedule("*/5 * * * *", async () => {
        console.log("[GRIVA:Cron] Models tick");
        await runModelsWorker();
    });

    cron.schedule("*/5 * * * *", async () => {
        console.log("[GRIVA:Cron] Metrics tick");
        await runMetricsWorker();
    });

    console.log("[GRIVA] Workers scheduled: news, papers, models, metrics — every 5 min");
}
