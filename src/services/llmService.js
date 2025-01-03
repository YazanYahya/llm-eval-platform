import {prisma} from "/prisma/client";

const findLLMsByNames = async (names) => {
    return await prisma.LLM.findMany({
        where: {name: {in: names}},
    });
};

const findLLMByName = async (name) => {
    return await prisma.LLM.findUnique({
        where: {name},
    });
};

module.exports = {findLLMsByNames, findLLMByName};