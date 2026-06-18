import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

interface PageShellProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
}

export function PageShell({ eyebrow, title, description, children }: PageShellProps) {
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F5]">
      <div className="relative pb-16">
        <Navbar />
        <header className="px-6 pt-36 pb-12">
          <div className="max-w-[88rem] mx-auto">
            {eyebrow && (
              <p className="text-sm text-black/50 uppercase tracking-widest mb-4">{eyebrow}</p>
            )}
            <h1
              className="text-black text-5xl md:text-6xl font-medium leading-tight max-w-3xl"
              style={{ letterSpacing: "-0.04em" }}
            >
              {title}
            </h1>
            {description && (
              <p className="text-black/60 text-lg max-w-2xl mt-6 leading-relaxed">{description}</p>
            )}
          </div>
        </header>
      </div>
      <main className="px-6 flex-1">
        <div className="max-w-[88rem] mx-auto">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
