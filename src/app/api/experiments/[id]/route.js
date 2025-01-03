import {NextResponse} from "next/server";
import {fetchExperimentById, updateExperiment} from "@/services/experimentService";

export async function GET(req, {params}) {
    const {id} = params;

    try {
        const experiment = await fetchExperimentById(id);

        if (!experiment) {
            return NextResponse.json({error: 'Experiment not found'}, {status: 404});
        }

        const formattedExperiment = {
            id: experiment.id,
            name: experiment.name,
            systemPrompt: experiment.systemPrompt,
            llms: experiment.modelLinks.map((link) => link.llm.name),
        };

        return NextResponse.json(formattedExperiment, {status: 200});
    } catch (error) {
        console.error('Error fetching experiment:', error.message || error);
        return NextResponse.json({error: 'Failed to fetch experiment'}, {status: 500});
    }
}

export async function PUT(req, {params}) {
    try {
        const {id} = await params;
        const body = await req.json();
        const response = await updateExperiment(id, body);

        return NextResponse.json(response, {status: 200});
    } catch (error) {
        console.error('Error updating experiment:', error.message || error);
        return NextResponse.json({error: 'Failed to update experiment'}, {status: 500});
    }
}