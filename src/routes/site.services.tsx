import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { CtaButtons, SectionTitle } from "@/components/site/SiteChrome";
import { SERVICES, waLink } from "@/components/site/content";
import { siteHead } from "@/components/site/meta";

export const Route = createFileRoute("/site/services")({
  head: () => siteHead("Services", "Digital invitations for weddings, engagements, anniversaries, bratabandha, birthdays and special occasions by SainoX."),
  component: Services,
});

function Services() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-5">
        <SectionTitle eyebrow="Services" title="Invitation categories" sub="Every design is made to order around your family, your traditions and your guests." />
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {SERVICES.map((s) => (
            <article key={s.slug} className="rounded-2xl border border-brand-line bg-brand-ink-raised p-7">
              <p className="text-sm text-brand-ember">{s.nepali}</p>
              <h3 className="mt-1 font-brand text-3xl">{s.title}</h3>
              <p className="mt-3 text-brand-cream/70">{s.blurb}</p>
              <ul className="mt-4 space-y-1.5 text-sm text-brand-cream/80">
                {s.features.map((f) => <li key={f} className="flex items-center gap-2"><Check className="h-4 w-4 text-brand-ember" />{f}</li>)}
              </ul>
              <a href={waLink(`Namaste SainoX! I'm interested in a ${s.title} invitation.`)} target="_blank" rel="noreferrer" className="mt-5 inline-block text-sm font-semibold text-brand-ember hover:underline">Ask about {s.title} →</a>
            </article>
          ))}
        </div>
        <div className="mt-14"><CtaButtons center /></div>
      </div>
    </section>
  );
}
