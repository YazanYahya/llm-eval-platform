import {NextResponse} from "next/server";
import {getGroqResponse} from "@/utils/groqClient";

export async function POST(req) {
    try {
        const body = await req.json();
        const {modelName, systemPrompt, userMessage} = body;

        if (!modelName || !systemPrompt || !userMessage) {
            return NextResponse.json({error: 'Model name, system prompt, and user message are required'}, {status: 400});
        }

        const startTime = Date.now();
        const response = await getGroqResponse(modelName, systemPrompt, userMessage);
        const endTime = Date.now();

        const durationInSeconds = ((endTime - startTime) / 1000).toFixed(2);

        return NextResponse.json({response, duration: durationInSeconds}, {status: 200});
    } catch (error) {
        console.error('Error generating response:', error.message || error);
        return NextResponse.json({error: 'Failed to generate response'}, {status: 500});
    }
}