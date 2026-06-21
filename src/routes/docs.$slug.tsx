import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "../components/landing/PageShell";
import { ErrorState } from "../components/landing/ErrorState";
import { docsQuery } from "./docs";

export const Route = createFileRoute("/docs/$slug")({
  loader: ({ context }) => context.queryClient.ensureQueryData(docsQuery),
  component: DocDetailPage,
});

function DocDetailPage() {
  const { slug } = Route.useParams();
  const { data: sections } = useSuspenseQuery(docsQuery);
  const section = sections.find((s) => s.slug === slug);

  if (!section) {
    return (
      <PageShell eyebrow="Docs" title="Document not found">
        <ErrorState
          title="That doc section doesn't exist."
          message="Choose a section from the docs index."
          homeHref="/docs"
        />
      </PageShell>
    );
  }

  return (
    <PageShell eyebrow={section.tag} title={section.title}>
      <div className="max-w-3xl space-y-6">
        <Link
          to="/docs"
          className="inline-flex items-center gap-2 text-sm text-black/60 hover:text-black"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to docs
        </Link>
        <p className="text-lg text-black/70 leading-relaxed">{section.body}</p>
      </div>
    </PageShell>
  );
}
