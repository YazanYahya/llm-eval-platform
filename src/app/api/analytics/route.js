import {getLLMAnalytics} from "@/services/analyticsService";
import {NextResponse} from "next/server";

export async function GET() {
    try {
        const rawResult = await getLLMAnalytics();
        const result = rawResult.map((row) => ({
            llmName: row.llmname,
            factualityScore: parseFloat(Number(row.factualityscore || 0).toFixed(2)),
            avgDuration: parseFloat(Number(row.avgduration || 0).toFixed(2)),
            totalExperiments: Number(row.totalexperiments) || 0,
        }));

        return NextResponse.json(result, {status: 200});
    } catch (error) {
        console.error('Error fetching LLM analytics:', error);
        return NextResponse.json({error: 'Failed to fetch analytics'}, {status: 500});
    }
}