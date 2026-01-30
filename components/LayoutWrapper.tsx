"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MobileHeader } from "@/components/MobileHeader";
import { Footer } from "@/components/Footer";
import { cn } from "@/lib/utils";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Close sidebar on window resize if it's large screen
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsSidebarOpen(false);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="flex flex-col bg-white text-foreground">
            <MobileHeader
                isOpen={isSidebarOpen}
                onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            />

            <div className="flex flex-1 relative">
                {/* Sidebar - Desktop (Static) and Mobile (Drawer) */}
                <aside
                    className={cn(
                        "fixed inset-y-0 left-0 z-50 w-64 transform bg-white border-r border-border transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:flex-shrink-0",
                        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    )}
                >
                    <Sidebar onClose={() => setIsSidebarOpen(false)} />
                </aside>

                {/* Overlay for Mobile */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                <main className="flex-1 min-h-screen overflow-x-hidden">
                    <div className="container mx-auto p-4 md:p-8 max-w-6xl">
                        {children}
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
}
