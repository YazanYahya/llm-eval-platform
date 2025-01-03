import {createExperiment, fetchExperiments} from "@/services/experimentService";
import {NextResponse} from "next/server";


export async function GET() {
    try {
        const experiments = await fetchExperiments();
        const formattedExperiments = experiments.map((experiment) => ({
            id: experiment.id,
            name: experiment.name,
            systemPrompt: experiment.systemPrompt,
            llms: experiment.modelLinks.map((link) => link.llm.name),
        }));

        return NextResponse.json(formattedExperiments, {status: 200});
    } catch (error) {
        console.error('Error fetching experiments:', error);
        return NextResponse.json({error: 'Failed to fetch experiments'}, {status: 500});
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        const experiment = await createExperiment(body);
        return NextResponse.json({experiment}, {status: 201});
    } catch (error) {
        console.error('Error creating experiment:', error.message || error);
        return NextResponse.json({error: 'Failed to create experiment'}, {status: 500});
    }
}