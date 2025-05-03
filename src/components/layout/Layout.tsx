
import React from "react";
import Navbar from "./Navbar";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 px-4 py-8 md:px-6 md:py-8 lg:px-8">
        {children}
      </main>
    </div>
  );
}
