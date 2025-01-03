import {getGroqResponse} from "@/utils/groqClient";

async function evaluateFactuality(systemPrompt, userInput, expectedOutput, llmResponse) {
    try {
        const evaluationPrompt = `
          System Prompt:
          ${systemPrompt}

          User Input:
          ${userInput}

          Expected Output:
          ${expectedOutput}

          LLM Response:
          ${llmResponse}

          Task: Evaluate the factual accuracy of the LLM response compared to the expected output.
          - Provide a factuality score as a percentage (0% to 100%).
          - Only JSON format should be returned
          - Return the result in the following JSON format:

          {
            "factuality_score": percentage
          }
          
        `;
        const llmGrader = 'llama-3.1-8b-instant';
        const response = await getGroqResponse(llmGrader,
            "You are an evaluator for factuality of LLM responses.",
            evaluationPrompt, 'json_object');

        return JSON.parse(response).factuality_score;
    } catch (error) {
        console.error("Error evaluating factuality with Groq:", error.message || error);
        throw new Error("Failed to evaluate factuality.");
    }
}

module.exports = {evaluateFactuality};