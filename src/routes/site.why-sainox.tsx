import { createFileRoute } from "@tanstack/react-router";
import { CtaButtons, SectionTitle } from "@/components/site/SiteChrome";
import { WHY } from "@/components/site/content";
import { siteHead } from "@/components/site/meta";

export const Route = createFileRoute("/site/why-sainox")({
  head: () => siteHead("Why SainoX", "Personalised guest links, graceful animations, easy sharing and memorable experiences — why families choose SainoX."),
  component: Why,
});

function Why() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-5">
        <SectionTitle eyebrow="Why SainoX" title="More than an invitation" sub="We blend Nepali tradition with modern design so every guest feels personally welcomed." />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {WHY.map((w, i) => (
            <div key={w.title} className="rounded-2xl border border-brand-line bg-brand-ink-raised p-7">
              <p className="font-brand text-3xl text-brand-ember">0{i + 1}</p>
              <h3 className="mt-3 font-brand text-xl">{w.title}</h3>
              <p className="mt-2 text-sm text-brand-cream/70">{w.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-14"><CtaButtons center /></div>
      </div>
    </section>
  );
}
