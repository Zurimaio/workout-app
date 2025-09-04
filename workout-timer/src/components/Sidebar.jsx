// components/Sidebar.jsx
import React, { useState } from "react";
import ProfileMenu from "./ProfileMenu"; // rimane invariato

export default function Sidebar({ menuItems = [], sidebarOpen, setView, setSidebarOpen  }) {
    return (

        <>
            {/* Overlay mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}


            <aside
                className={`
        fixed md:relative z-20 w-64 
        md:m-4 md:rounded-2xl md:shadow-xl md:transition-all md:duration-300
        bg-brand-dark text-offwhite
        transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0 md:shadow-2xl" : "-translate-x-full"} md:translate-x-0
      `}
            >
                {/* Logo / Header Sidebar */}
                <div className="h-16 flex items-center justify-center font-bold text-xl border-b border-brand-light">
                    🏋️ Elev8
                </div>

                {/* Menu Items */}
                <nav className="flex-1 px-4 py-6 space-y-3">
                    {menuItems.map(item => (
                        <button
                            key={item.key}
                            onClick={() => setView(item.key)}
                            className={`
              flex items-center gap-3 w-full px-3 py-2 rounded-lg 
              transition-colors duration-200 relative overflow-hidden
              ${item.active ? "bg-brand-light font-semibold text-black" : "hover:bg-brand-light hover:text-black"}
            `}
                        >
                            {item.icon} <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Profile Menu */}
                <div className="justify-center p-4 border-t border-brand-light">
                    <ProfileMenu />
                </div>
            </aside>
        </>
    );
}
