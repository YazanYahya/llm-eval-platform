import {prisma} from "/prisma/client";
import {findLLMByName, findLLMsByNames} from "@/services/llmService";

const fetchExperiments = async () => {
    return await prisma.experiment.findMany({
        include: {
            modelLinks: {include: {llm: true}},
        },
        orderBy: {updatedAt: 'desc'},
    });
};

const fetchExperimentById = async (id) => {
    return await prisma.experiment.findUnique({
        where: {id: parseInt(id, 10)},
        include: {
            modelLinks: {include: {llm: true}},
        },
    });
};

const createExperiment = async (data) => {
    const {systemPrompt, selectedModels, testCases, experimentName, runStartTime, runEndTime} = data;

    const llms = await findLLMsByNames(selectedModels);

    if (llms.length !== selectedModels.length) {
        throw new Error('Some selected models were not found');
    }

    const experiment = await prisma.Experiment.create({
        data: {
            name: experimentName,
            systemPrompt,
            modelLinks: {
                create: llms.map((llm) => ({
                    llm: {connect: {id: llm.id}},
                })),
            },
        },
    });

    const experimentRun = await prisma.ExperimentRun.create({
        data: {
            experimentId: experiment.id,
            startedAt: new Date(runStartTime),
            endedAt: new Date(runEndTime),
        },
    });

    for (const testCase of testCases) {
        if (!testCase.userMessage || !testCase.expectedOutput) continue;

        const savedTestCase = await prisma.TestCase.create({
            data: {
                userMessage: testCase.userMessage,
                expectedOutput: testCase.expectedOutput,
                experimentLinks: {
                    create: {experiment: {connect: {id: experiment.id}}},
                },
            },
        });

        for (const llm of llms) {
            const response = testCase.responses?.[llm.name];
            if (response) {
                const savedTestCaseResult = await prisma.TestCaseResult.create({
                    data: {
                        experimentRunId: experimentRun.id,
                        testCaseId: savedTestCase.id,
                        llmId: llm.id,
                        duration: parseFloat(response.duration) || 0,
                        response: response.text,
                    },
                });

                const graderLLM = await findLLMByName('llama-3.1-8b-instant');

                await prisma.GraderResult.create({
                    data: {
                        testCaseResultId: savedTestCaseResult.id,
                        graderLLMId: graderLLM.id,
                        criterion: response.evaluation.criterion,
                        score: response.evaluation.score,
                    },
                });
            }
        }
    }

    return experiment;
};

const updateExperiment = async (id, data) => {
    const {systemPrompt, selectedModels, testCases, experimentName, runStartTime, runEndTime} = data;

    const llms = await findLLMsByNames(selectedModels);

    if (llms.length !== selectedModels.length) {
        throw new Error('Some selected models were not found');
    }

    const experiment = await prisma.Experiment.findUnique({
        where: {id: parseInt(id, 10)},
    });

    if (!experiment) {
        throw new Error('Experiment not found');
    }

    await prisma.Experiment.update({
        where: {id: parseInt(id, 10)},
        data: {
            name: experimentName,
            systemPrompt,
            modelLinks: {
                deleteMany: {},
                create: llms.map((llm) => ({
                    llm: {connect: {id: llm.id}},
                })),
            },
        },
    });

    const experimentRun = await prisma.ExperimentRun.create({
        data: {
            experimentId: experiment.id,
            startedAt: new Date(runStartTime),
            endedAt: new Date(runEndTime),
        },
    });

    for (const testCase of testCases) {
        if (!testCase.userMessage || !testCase.expectedOutput) continue;

        const savedTestCase = await prisma.TestCase.create({
            data: {
                userMessage: testCase.userMessage,
                expectedOutput: testCase.expectedOutput,
                experimentLinks: {
                    create: {experiment: {connect: {id: parseInt(id, 10)}}},
                },
            },
        });

        for (const llm of llms) {
            const response = testCase.responses?.[llm.name];
            if (response) {
                const savedTestCaseResult = await prisma.TestCaseResult.create({
                    data: {
                        experimentRunId: experimentRun.id,
                        testCaseId: savedTestCase.id,
                        llmId: llm.id,
                        duration: parseFloat(response.duration) || 0,
                        response: response.text,
                    },
                });

                const graderLLM = await findLLMByName('llama-3.1-8b-instant');

                await prisma.GraderResult.create({
                    data: {
                        testCaseResultId: savedTestCaseResult.id,
                        graderLLMId: graderLLM.id,
                        criterion: response.evaluation.criterion,
                        score: response.evaluation.score,
                    },
                });
            }
        }
    }

    return {message: 'Experiment updated successfully'};
};

module.exports = {fetchExperiments, fetchExperimentById, createExperiment, updateExperiment};