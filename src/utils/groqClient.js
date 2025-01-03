import {Groq} from "groq-sdk";

const groqClient = new Groq({apiKey: process.env.GROQ_API_KEY});

export async function getGroqResponse(modelId, systemPrompt, userMessage, format = "text") {
    try {
        const messages = [
            {role: "system", content: systemPrompt},
            {role: "user", content: userMessage},
        ];

        const response = await groqClient.chat.completions.create({
            model: modelId,
            messages,
            response_format: {
                type: format
            }
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error("Error calling Groq model:", error.message || error);
        throw new Error("Failed to call Groq model.");
    }
}

export default groqClient;
