import { NextResponse } from "next/server";
import { computeMetrics, getMetrics } from "@/lib/metrics";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const refresh = searchParams.get("refresh");

    if (refresh === "true") {
        const metrics = await computeMetrics();
        return NextResponse.json(metrics);
    }

    const cached = await getMetrics();
    if (cached) return NextResponse.json(cached);

    const fresh = await computeMetrics();
    return NextResponse.json(fresh);
}
