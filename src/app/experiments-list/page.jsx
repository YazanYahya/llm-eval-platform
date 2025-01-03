"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function ExperimentsPage() {
    const [experiments, setExperiments] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function fetchExperiments() {
            try {
                const res = await fetch("/api/experiments");
                if (!res.ok) throw new Error("Failed to fetch experiments");
                const data = await res.json();
                setExperiments(data);
            } catch (error) {
                console.error("Error fetching experiments:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchExperiments();
    }, []);

    const handleCreateExperiment = () => {
        router.push("/experiments");
    };

    const handleEditExperiment = (id) => {
        router.push(`/experiments?id=${id}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Experiments</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center mb-6">
                        <p className="text-gray-600">View, edit, or create experiments.</p>
                        <Button onClick={handleCreateExperiment}>Create New Experiment</Button>
                    </div>

                    {experiments.length > 0 ? (
                        <div className="overflow-hidden border rounded-lg shadow">
                            <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-300">
                                        Experiment Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-300 w-3/5">
                                        System Prompt
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-300">
                                        LLMs Used
                                    </th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-1/12">
                                        Actions
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {experiments.map((experiment) => (
                                    <tr key={experiment.id} className="hover:bg-gray-100">
                                        <td className="px-6 py-4 text-sm text-gray-800 border-r border-gray-300">
                                            {experiment.name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 border-r border-gray-300 truncate max-w-xs">
                                            {experiment.systemPrompt}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-800 border-r border-gray-300">
                                            {experiment.llms && experiment.llms.length > 0 ? (
                                                <ul className="list-disc pl-4">
                                                    {experiment.llms.map((llm) => (
                                                        <li key={llm}>{llm}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <span className="text-gray-500">No LLMs Used</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEditExperiment(experiment.id)}
                                                className="text-blue-600 border border-blue-600"
                                            >
                                                Edit
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-center text-gray-500">No experiments found. Create a new experiment to get started.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}