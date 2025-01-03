import {NextResponse} from "next/server";
import {evaluateFactuality} from "@/services/evaluationService";

export async function POST(req) {
    try {
        const body = await req.json();
        const {systemPrompt, userMessage, expectedOutput, response} = body;

        if (!systemPrompt || !userMessage || !response) {
            return NextResponse.json(
                {error: 'System prompt, user message, and response are required'},
                {status: 400}
            );
        }

        const factualityScore = await evaluateFactuality(systemPrompt, userMessage, expectedOutput, response);

        return NextResponse.json({criterion: 'Factuality', score: factualityScore}, {status: 200});
    } catch (error) {
        console.error('Error evaluating output:', error.message || error);
        return NextResponse.json({error: 'Failed to evaluate output'}, {status: 500});
    }
}