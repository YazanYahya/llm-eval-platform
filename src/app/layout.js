import {Navbar} from "@/components/ui/navbar";
import "./globals.css";

export default function RootLayout({children}) {
    return (
        <html lang="en">
        <body>
        <div className="min-h-screen flex flex-col">
            <Navbar/>

            <main className="flex-1 bg-gray-50">
                <div className="container mx-auto px-6 py-8">{children}</div>
            </main>

            <footer className="bg-gray-800 text-white text-center py-4">
                <p className="text-sm">
                    © {new Date().getFullYear()} LLM Dashboard. All rights reserved.
                </p>
            </footer>
        </div>
        </body>
        </html>
    );
}
