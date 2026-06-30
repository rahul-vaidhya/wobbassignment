import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export function Layout({ children, title, description }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {title && (
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
