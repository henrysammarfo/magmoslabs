import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { PageShell } from "../components/landing/PageShell";
import { Spinner } from "../components/landing/Spinner";
import { ErrorState } from "../components/landing/ErrorState";
import { fetchDocs } from "../lib/mock-data";

const docsQuery = queryOptions({
  queryKey: ["docs"],
  queryFn: fetchDocs,
  staleTime: 60_000,
});

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
  loader: ({ context }) => context.queryClient.ensureQueryData(docsQuery),
  component: DocsPage,
  pendingComponent: () => (
    <PageShell eyebrow="Docs" title="Build with AURUM.">
      <Spinner label="Loading reference" />
    </PageShell>
  ),
  errorComponent: ({ error, reset }) => <DocsError error={error} reset={reset} />,
  notFoundComponent: () => (
    <PageShell eyebrow="Docs" title="Build with AURUM.">
      <ErrorState title="Page not found." message="That doc section doesn't exist." />
    </PageShell>
  ),
});

function DocsError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <PageShell eyebrow="Docs" title="Build with AURUM.">
      <ErrorState
        title="Docs are temporarily unreachable."
        message={error.message || "Our docs index didn't respond. Please retry in a moment."}
        onRetry={() => {
          reset();
          router.invalidate();
        }}
      />
    </PageShell>
  );
}

function DocsPage() {
  const { data: sections } = useSuspenseQuery(docsQuery);
  return (
    <PageShell
      eyebrow="Docs"
      title="Build with AURUM."
      description="Everything you need to integrate the Magmos yield dollar into your Sui application."
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((s) => (
          <Link
            key={s.slug}
            to="/docs"
            className="bg-white rounded-2xl p-6 border border-black/5 hover:border-black/20 transition-colors group"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs uppercase tracking-widest text-[#8B6A22] bg-[#C8A04A]/15 px-2 py-1 rounded-full">
                {s.tag}
              </span>
              <ArrowUpRight className="w-4 h-4 text-black/40 group-hover:text-black transition-colors" />
            </div>
            <h2
              className="text-xl font-medium text-black mb-2"
              style={{ letterSpacing: "-0.03em" }}
            >
              {s.title}
            </h2>
            <p className="text-black/60 leading-relaxed">{s.body}</p>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
