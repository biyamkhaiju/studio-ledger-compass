import { createFileRoute, Link } from "@tanstack/react-router";
import { SectionTitle } from "@/components/site/SiteChrome";
import { DEMOS } from "@/components/site/demos";
import { siteHead } from "@/components/site/meta";

export const Route = createFileRoute("/site/portfolio")({
  head: () => siteHead("Portfolio", "Preview SainoX digital invitation designs and open live demos for weddings, bratabandha, anniversaries and birthdays."),
  component: Portfolio,
});

function Portfolio() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-5">
        <SectionTitle eyebrow="Portfolio" title="Invitation previews" sub="Open a demo to experience an invitation just as your guests would." />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {DEMOS.map((d) => (
            <article key={d.slug} className="overflow-hidden rounded-2xl border border-brand-line bg-brand-ink-raised">
              <div className="flex aspect-[3/4] flex-col items-center justify-center gap-2 border-b border-brand-line bg-brand-ink p-5 text-center">
                <p className="text-xs uppercase tracking-[0.25em] text-brand-ember">{d.category}</p>
                <p className="font-brand text-2xl">{d.hosts}</p>
                <span className="brand-divider h-px w-20" />
                <p className="text-xs text-brand-cream/60">{d.date}</p>
              </div>
              <div className="p-4">
                <h3 className="font-brand text-lg">{d.title}</h3>
                <Link to="/site/demo/$demo" params={{ demo: d.slug }} className="mt-2 inline-block text-sm font-semibold text-brand-ember hover:underline">View live demo →</Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
