"use client";

import {useEffect, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Checkbox} from "@/components/ui/checkbox";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Clock, Loader2, Trash2} from "lucide-react";
import {Input} from "@/components/ui/input";
import {useToast} from "@/hooks/use-toast";

const models = [
    {id: "mixtral-8x7b-32768", label: "Mistral - mixtral-8x7b-32768"},
    {id: "llama-3.1-8b-instant", label: "Meta - llama-3.1-8b-instant"},
    {id: "gemma2-9b-it", label: "Google - gemma2-9b-it"},
];

export default function ExperimentPage() {
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const router = useRouter();
    const {toast} = useToast();
    const [experimentName, setExperimentName] = useState("");
    const [systemPrompt, setSystemPrompt] = useState("");
    const [selectedModels, setSelectedModels] = useState([]);
    const [testCases, setTestCases] = useState([]);
    const [loadingStates, setLoadingStates] = useState({});
    const [runStartTime, setRunStartTime] = useState("");
    const [runEndTime, setRunEndTime] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!id) return;

        async function fetchExperiment() {
            try {
                setLoading(true);
                const res = await fetch(`/api/experiments/${id}`);
                if (!res.ok) throw new Error("Failed to fetch experiment data");
                const data = await res.json();

                setExperimentName(data.name);
                setSystemPrompt(data.systemPrompt);
                setSelectedModels(data.llms || []);
            } catch (error) {
                console.error("Error fetching experiment:", error);
                toast({title: "Error", description: "Failed to load experiment.", variant: "destructive"});
            } finally {
                setLoading(false);
            }
        }

        fetchExperiment();
    }, [id]);

    const toggleModel = (modelId) => {
        setSelectedModels((prev) =>
            prev.includes(modelId) ? prev.filter((id) => id !== modelId) : [...prev, modelId]
        );
    };

    const addTestCase = () => {
        setTestCases([
            ...testCases,
            {
                userMessage: "",
                expectedOutput: "",
                responses: selectedModels.reduce((acc, model) => {
                    acc[model] = "";
                    return acc;
                }, {}),
            },
        ]);
    };

    const removeTestCase = (index) => {
        setTestCases(testCases.filter((_, i) => i !== index));
    };

    const updateTestCase = (index, field, value) => {
        const updatedTestCases = [...testCases];
        updatedTestCases[index][field] = value;
        setTestCases(updatedTestCases);
    };

    const handleRunExperiment = async () => {
        setRunStartTime(new Date().toISOString());

        try {
            const updatedTestCases = [...testCases];

            const promises = testCases.map((testCase, testCaseIndex) =>
                selectedModels.map(async (modelId) => {
                    const loadingKey = `${testCaseIndex}-${modelId}`;
                    setLoadingStates((prev) => ({
                        ...prev,
                        [loadingKey]: {generating: true, evaluating: false},
                    }));

                    try {
                        const res = await fetch("/api/models/generate", {
                            method: "POST",
                            headers: {"Content-Type": "application/json"},
                            body: JSON.stringify({
                                modelName: modelId,
                                systemPrompt,
                                userMessage: testCase.userMessage,
                            }),
                        });

                        if (!res.ok) {
                            throw new Error(`Failed to fetch response for ${modelId}`);
                        }

                        const {response, duration} = await res.json();
                        updatedTestCases[testCaseIndex].responses[modelId] = {
                            text: response,
                            duration,
                            evaluation: "",
                        };

                        setTestCases([...updatedTestCases]);

                        setLoadingStates((prev) => ({
                            ...prev,
                            [loadingKey]: {generating: false, evaluating: true},
                        }));

                        const evalRes = await fetch("/api/models/evaluate", {
                            method: "POST",
                            headers: {"Content-Type": "application/json"},
                            body: JSON.stringify({
                                systemPrompt,
                                userMessage: testCase.userMessage,
                                expectedOutput: testCase.expectedOutput,
                                response
                            }),
                        });

                        if (!evalRes.ok) {
                            throw new Error(`Failed to evaluate response for ${modelId}`);
                        }

                        const {criterion, score} = await evalRes.json();
                        updatedTestCases[testCaseIndex].responses[modelId] = {
                            ...updatedTestCases[testCaseIndex].responses[modelId],
                            evaluation: {
                                criterion,
                                score
                            }
                        };
                    } catch (error) {
                        console.error(`Error processing ${modelId} for test case ${testCaseIndex}:`, error);
                        updatedTestCases[testCaseIndex].responses[modelId] = {
                            text: "Error fetching response",
                            duration: "-",
                            evaluation: "Error",
                        };
                    } finally {
                        setLoadingStates((prev) => ({
                            ...prev,
                            [loadingKey]: {generating: false, evaluating: false},
                        }));
                    }
                })
            );

            await Promise.all(promises.flat());
            setTestCases(updatedTestCases);
        } finally {
            setRunEndTime(new Date().toISOString());
        }
    };

    const handleSaveExperiment = async () => {
        try {
            const payload = {
                experimentName,
                systemPrompt,
                runStartTime,
                runEndTime,
                selectedModels,
                testCases: testCases.map((testCase) => ({
                    userMessage: testCase.userMessage,
                    expectedOutput: testCase.expectedOutput,
                    responses: testCase.responses,
                })),
            };

            const method = id ? "PUT" : "POST";
            const url = id ? `/api/experiments/${id}` : `/api/experiments`;

            const res = await fetch(url, {
                method: method,
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                throw new Error("Failed to save experiment.");
            }

            const data = await res.json();
            toast({
                title: "Success",
                description: `Experiment saved successfully!`
            });

            router.push("/experiments-list");
        } catch (error) {
            console.error("Error saving experiment:", error);
            toast({
                title: "Error",
                description: "Failed to save experiment. Please try again.",
                variant: "destructive",
            });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="animate-spin w-10 h-10 text-blue-600"/>
            </div>
        );
    }


    return (
        <div className="container mx-auto p-6 max-w-8xl space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Create New Experiment</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="experimentName">Experiment Name</Label>
                            <Input
                                id="experimentName"
                                placeholder="Enter the experiment name"
                                value={experimentName}
                                onChange={(e) => setExperimentName(e.target.value)}
                                className="mt-2 w-96"
                            />
                        </div>

                        <div>
                            <Label htmlFor="systemPrompt">System Prompt</Label>
                            <Textarea
                                id="systemPrompt"
                                placeholder="Enter the system prompt"
                                value={systemPrompt}
                                onChange={(e) => setSystemPrompt(e.target.value)}
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <Label>Select Models</Label>
                            <div className="flex flex-wrap gap-4 mt-2">
                                {models.map((model) => (
                                    <div key={model.id} className="flex items-center">
                                        <Checkbox
                                            id={model.id}
                                            checked={selectedModels.includes(model.id)}
                                            onCheckedChange={() => toggleModel(model.id)}
                                        />
                                        <Label htmlFor={model.id} className="ml-2">
                                            {model.label}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                            <Button variant="outline" onClick={addTestCase}>
                                Add Test Case
                            </Button>
                            <div className="flex space-x-4">
                                <Button
                                    onClick={handleRunExperiment}
                                    disabled={testCases.length === 0 || selectedModels.length === 0}
                                >
                                    Run
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleSaveExperiment}
                                    disabled={testCases.length === 0 || selectedModels.length === 0}
                                >
                                    Save
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {testCases.length > 0 && (
                <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-md mt-6">
                    <Table className="w-full table-fixed">
                        <TableHeader>
                            <TableRow className="bg-gray-100">
                                <TableHead className="font-bold text-center border">Test Case</TableHead>
                                <TableHead className="font-bold text-center border">Expected Output</TableHead>
                                {selectedModels.map((model) => (
                                    <TableHead key={model} className="font-bold text-center border">
                                        {models.find((m) => m.id === model)?.label}
                                    </TableHead>
                                ))}
                                <TableHead className="font-bold text-center border" style={{width: "80px"}}>
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {testCases.map((testCase, index) => (
                                <TableRow key={index}>
                                    <TableCell className="px-4 py-3 text-center border">
                                        <Textarea
                                            value={testCase.userMessage}
                                            placeholder="Enter user message"
                                            onChange={(e) => updateTestCase(index, "userMessage", e.target.value)}
                                            className="h-48"
                                        />
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-center border">
                                        <Textarea
                                            value={testCase.expectedOutput}
                                            placeholder="Enter expected output"
                                            onChange={(e) => updateTestCase(index, "expectedOutput", e.target.value)}
                                            className="h-48"
                                        />
                                    </TableCell>
                                    {selectedModels.map((model) => {
                                        const loadingKey = `${index}-${model}`;
                                        const {generating, evaluating} = loadingStates[loadingKey] || {};
                                        const response = testCase.responses[model] || {};
                                        const {evaluation, duration, text} = response;

                                        return (
                                            <TableCell key={model} className="px-4 py-3 border h-40">
                                                {generating ? (
                                                    <Loader2 className="animate-spin h-5 w-5 mx-auto"/>
                                                ) : (
                                                    <div className="flex flex-col h-48 overflow-y-auto">
                                                        {duration && (
                                                            <div
                                                                className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                                                <div className="flex items-center">
                                                                    <Clock className="w-4 h-4 mr-1 text-gray-400"/>
                                                                    <span>{duration}s</span>
                                                                </div>
                                                                {evaluating ? (
                                                                    <Loader2
                                                                        className="animate-spin text-green-500 h-5 w-5"/>
                                                                ) : evaluation && (
                                                                    <span
                                                                        className={`inline-block px-2 py-1 rounded-full text-xs ${
                                                                            evaluation.score >= 75
                                                                                ? 'bg-green-100 text-green-600'
                                                                                : evaluation.score >= 50
                                                                                    ? 'bg-yellow-100 text-yellow-600'
                                                                                    : 'bg-red-100 text-red-600'
                                                                        }`}
                                                                    >
                                                                        {evaluation.criterion} {evaluation.score}%
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                        <div className="flex flex-col justify-center">
                                                            <div>{text || "-"}</div>
                                                        </div>
                                                    </div>
                                                )}
                                            </TableCell>
                                        );
                                    })}

                                    <TableCell className="px-4 py-3 text-center border">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeTestCase(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 className="h-5 w-5"/>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}