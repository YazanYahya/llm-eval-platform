import { prisma } from "/prisma/client";

const getLLMAnalytics = async () => {
    return await prisma.$queryRaw`
        SELECT
            l.name AS llmName,
            AVG(gr.score) AS factualityScore,
            AVG(tcr.duration) AS avgDuration,
            COUNT(tcr.id) AS totalExperiments
        FROM
            "LLM" l
        LEFT JOIN "TestCaseResult" tcr ON l.id = tcr."llmId"
        LEFT JOIN "GraderResult" gr ON gr."testCaseResultId" = tcr.id
        GROUP BY
            l.name;
    `;
};

module.exports = { getLLMAnalytics };
