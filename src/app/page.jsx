"use client";

import {Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import {useEffect, useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

export default function AnalyticsDashboard() {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch("/api/analytics");
                if (!res.ok) throw new Error("Failed to fetch data");
                const data = await res.json();
                setChartData(data);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            }
        }

        fetchData();
    }, []);

    return (
        <div className="container mx-auto p-4 space-y-12">
            <div className="text-center space-y-1">
                <h1 className="text-3xl font-extrabold text-gray-800">LLM Performance Dashboard</h1>
                <p className="text-gray-600">
                    Insights into factuality, response time, and experiment participation for LLMs.
                </p>
            </div>

            <div className="flex flex-wrap justify-between gap-4">
                <Card className="flex-1 min-w-[700px]">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-700">Factuality Score
                            Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={chartData} margin={{top: 5, right: 15, left: 0, bottom: 20}}>
                                <XAxis dataKey="llmName"/>
                                <YAxis/>
                                <Tooltip/>
                                <Legend/>
                                <Bar dataKey="factualityScore" radius={4} name="Factuality Score (%)"/>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="flex-1 min-w-[700px]">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-700">Response Time (Seconds)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart
                                data={chartData}
                                layout="vertical"
                                margin={{top: 5, right: 30, left: 20, bottom: 10}}
                            >
                                <XAxis type="number"/>
                                <YAxis dataKey="llmName" type="category" width={150}/>
                                <Tooltip/>
                                <Legend/>
                                <Bar dataKey="avgDuration" radius={[0, 10, 10, 0]}
                                     name="Avg Duration (s)"/>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="flex-1 min-w-[700px]">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-700">Experiment Participation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    dataKey="totalExperiments"
                                    nameKey="llmName"
                                    outerRadius={120}
                                    label={({name, totalExperiments}) => `${name}: ${totalExperiments}`}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`}/>
                                    ))}
                                </Pie>
                                <Tooltip/>
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}