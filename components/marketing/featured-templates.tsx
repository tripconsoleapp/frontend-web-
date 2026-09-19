import Link from "next/link";
import { TemplateBrowseCard } from "@/components/templates/template-browse-card";
import { getTemplateById } from "@/lib/mock-templates";

const FEATURED_IDS = ["sabarimala-heritage", "munnar-nature", "alleppey-backwaters"];

export function FeaturedTemplates() {
  const templates = FEATURED_IDS.map(getTemplateById).filter(
    (t): t is NonNullable<typeof t> => Boolean(t)
  );

  return (
    <section className="mx-auto max-w-6xl px-6 py-20 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-3xl font-bold text-navy sm:text-4xl">
            Explore trip templates
          </h2>
          <p className="mt-2 max-w-md font-body text-text-grey">
            Ready-made itineraries for schools, families, and pilgrim groups.
          </p>
        </div>
        <Link
          href="/templates"
          className="font-body text-sm font-semibold text-navy underline"
        >
          Browse all &rarr;
        </Link>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <TemplateBrowseCard key={template.id} template={template} />
        ))}
      </div>
    </section>
  );
}
