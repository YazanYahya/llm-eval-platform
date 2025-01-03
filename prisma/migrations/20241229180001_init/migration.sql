-- CreateTable
CREATE TABLE "LLM" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LLM_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Experiment" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "systemPrompt" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Experiment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestCase" (
    "id" SERIAL NOT NULL,
    "userMessage" TEXT NOT NULL,
    "expectedOutput" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExperimentRun" (
    "id" SERIAL NOT NULL,
    "experimentId" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExperimentRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExperimentTestCase" (
    "id" SERIAL NOT NULL,
    "experimentId" INTEGER NOT NULL,
    "testCaseId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExperimentTestCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExperimentModel" (
    "id" SERIAL NOT NULL,
    "experimentId" INTEGER NOT NULL,
    "llmId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExperimentModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestCaseResult" (
    "id" SERIAL NOT NULL,
    "experimentRunId" INTEGER NOT NULL,
    "testCaseId" INTEGER NOT NULL,
    "llmId" INTEGER NOT NULL,
    "response" TEXT NOT NULL,
    "duration" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestCaseResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GraderResult" (
    "id" SERIAL NOT NULL,
    "testCaseResultId" INTEGER NOT NULL,
    "graderLLMId" INTEGER NOT NULL,
    "criterion" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GraderResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LLM_name_key" ON "LLM"("name");

-- AddForeignKey
ALTER TABLE "ExperimentRun" ADD CONSTRAINT "ExperimentRun_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "Experiment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperimentTestCase" ADD CONSTRAINT "ExperimentTestCase_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "Experiment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperimentTestCase" ADD CONSTRAINT "ExperimentTestCase_testCaseId_fkey" FOREIGN KEY ("testCaseId") REFERENCES "TestCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperimentModel" ADD CONSTRAINT "ExperimentModel_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "Experiment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperimentModel" ADD CONSTRAINT "ExperimentModel_llmId_fkey" FOREIGN KEY ("llmId") REFERENCES "LLM"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestCaseResult" ADD CONSTRAINT "TestCaseResult_experimentRunId_fkey" FOREIGN KEY ("experimentRunId") REFERENCES "ExperimentRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestCaseResult" ADD CONSTRAINT "TestCaseResult_testCaseId_fkey" FOREIGN KEY ("testCaseId") REFERENCES "TestCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestCaseResult" ADD CONSTRAINT "TestCaseResult_llmId_fkey" FOREIGN KEY ("llmId") REFERENCES "LLM"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GraderResult" ADD CONSTRAINT "GraderResult_testCaseResultId_fkey" FOREIGN KEY ("testCaseResultId") REFERENCES "TestCaseResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GraderResult" ADD CONSTRAINT "GraderResult_graderLLMId_fkey" FOREIGN KEY ("graderLLMId") REFERENCES "LLM"("id") ON DELETE CASCADE ON UPDATE CASCADE;
