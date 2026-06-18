import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { PageShell } from "../components/landing/PageShell";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Docs — Magmos Developer Reference" },
      {
        name: "description",
        content:
          "Integrate AURUM and sAURUM in your Sui dApp. Move SDK, contract addresses, and step-by-step guides.",
      },
      { property: "og:title", content: "Docs — Magmos Developer Reference" },
      { property: "og:description", content: "Build with AURUM in minutes." },
    ],
    links: [{ rel: "canonical", href: "/docs" }],
  }),
  component: DocsPage,
});

const sections = [
  { title: "Quickstart", body: "Mint AURUM and stake to sAURUM from a script in under 20 lines." },
  { title: "Move SDK", body: "Typed bindings for every public entry function in the Magmos package." },
  { title: "Indexer", body: "GraphQL endpoint for positions, yields, and reserve history." },
  { title: "Audits", body: "Reports from OtterSec and MoveBit, plus an on-chain bug bounty." },
  { title: "Brand kit", body: "Logos, wordmarks, and color guidelines for integrators." },
  { title: "Changelog", body: "Versioned releases of the Magmos Move package." },
];

function DocsPage() {
  return (
    <PageShell
      eyebrow="Docs"
      title="Build with AURUM."
      description="Everything you need to integrate the Magmos yield dollar into your Sui application."
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((s) => (
          <Link
            key={s.title}
            to="/docs"
            className="bg-white rounded-2xl p-6 border border-black/5 hover:border-black/20 transition-colors group"
          >
            <div className="flex items-start justify-between mb-3">
              <h2 className="text-xl font-medium text-black" style={{ letterSpacing: "-0.03em" }}>
                {s.title}
              </h2>
              <ArrowUpRight className="w-4 h-4 text-black/40 group-hover:text-black transition-colors" />
            </div>
            <p className="text-black/60 leading-relaxed">{s.body}</p>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
