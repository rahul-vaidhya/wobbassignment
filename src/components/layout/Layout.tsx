import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-200">
      {/* Skip navigation link — visually hidden until focused via keyboard */}
      <a href="#main-content" className="skip-nav">
        Skip to main content
      </a>

      <Header />

      <main id="main-content" className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
