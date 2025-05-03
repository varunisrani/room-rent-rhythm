
import React from "react";
import Navbar from "./Navbar";
import { motion } from "framer-motion";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-premium-50 to-premium-100">
      <Navbar />
      <motion.main 
        className="flex-1 px-4 py-6 md:px-6 md:py-8 lg:px-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </motion.main>
      <footer className="py-4 px-6 bg-white border-t border-premium-100 text-center text-sm text-premium-400">
        <p>© 2023 PG Manager • Premium Hostel Management System</p>
      </footer>
    </div>
  );
}
