"use client";

import Link from "next/link";

export function Navbar() {
    return (
        <nav className="bg-gray-800 shadow-lg">
            <div className="container mx-auto flex items-center justify-between px-8 py-4">
                <div className="text-2xl font-extrabold text-white">
                    <Link href="/" className="hover:text-gray-400 transition">
                        LLM Eval Dashboard
                    </Link>
                </div>

                <div className="flex items-center space-x-4">
                    <Link
                        href="/experiments-list"
                        className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 font-medium hover:bg-gray-200 hover:text-gray-900 transition shadow-sm"
                    >
                        View Experiments
                    </Link>
                    <Link
                        href="/experiments"
                        className="px-4 py-2 rounded-lg text-white font-medium bg-blue-600 hover:bg-blue-500 transition shadow-sm"
                    >
                        New Experiment
                    </Link>
                </div>
            </div>
        </nav>
    );
}