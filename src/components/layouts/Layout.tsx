import React, { useState } from "react";
// Adjust path to your Redux store
import { useIsMobile } from "../../hooks/use-mobile";
import { Coffee, Menu } from "lucide-react";
import { cn } from "../../lib/utils";
import Sidebar from "./Sidebar";

import UserMenu from "./UserMenu";
import MobileNavigation from "./MobileNavigation";

type LayoutProps = {
    children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const isMobile = useIsMobile();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Access themeData from Redux store

    const themeName = "Pashmina";
    const themeLogo = null;

    return (
        <div className="flex min-h-screen bg-background w-full">
            {/* Mobile Overlay */}
            {isMobile && sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 transition-opacity duration-300"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            {/* Main Content - Offset by sidebar width on desktop */}
            <div
                className={cn(
                    "flex-1 flex flex-col",
                    !isMobile && "ml-64",
                    isMobile && "pb-16",
                )}
            >
                <div className="bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-10">
                    {/* Mobile menu button and logo */}
                    <div className="flex items-center space-x-3">
                        {isMobile && (
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
                                aria-label="Toggle menu"
                            >
                                <Menu className="h-5 w-5" />
                            </button>
                        )}

                        <div className="flex items-center">
                            {themeLogo ? (
                                <img
                                    src={themeLogo}
                                    alt={`${themeName} Logo`}
                                    className="h-8 w-8 object-contain"
                                    onError={(e) => {
                                        // Fallback to Coffee icon if image fails to load
                                        e.currentTarget.style.display = "none";
                                        const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                                        if (nextElement) {
                                            nextElement.style.display = "block";
                                        }
                                    }}
                                />
                            ) : null}
                            <Coffee
                                className={cn("h-8 w-8 text-coffee", themeLogo && "hidden")} // Hide if themeLogo is present
                            />
                            <div className="ml-2">
                                <h1 className="text-sm font-semibold text-coffee-dark">
                                    {themeName}
                                </h1>
                                <p className="text-[10px] text-muted-foreground leading-none">
                                    Training Institute
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4 ml-auto">

                        <UserMenu />
                    </div>
                </div>

                <main className="w-[90%] mx-auto flex-1 overflow-y-auto animate-fade-in">
                    {children}
                </main>

                

                {isMobile && <MobileNavigation />}
            </div>
        </div>
    );
};

export default Layout;
