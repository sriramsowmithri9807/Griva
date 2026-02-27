import { NextResponse } from "next/server";
import { getRecommendations } from "@/lib/ai/recommendations";

export async function GET() {
    try {
        const recommendations = await getRecommendations();
        return NextResponse.json(recommendations);
    } catch (error) {
        console.error("Recommendations error:", error);
        return NextResponse.json([], { status: 500 });
    }
}
