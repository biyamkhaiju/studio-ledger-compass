import { createFileRoute, Link } from "@tanstack/react-router";
import logo from "@/assets/sainox-logo.png.asset.json";
import { CtaButtons, Divider, SectionTitle } from "@/components/site/SiteChrome";
import { SERVICES, WHY } from "@/components/site/content";
import { siteHead } from "@/components/site/meta";

export const Route = createFileRoute("/site/")({
  head: () => siteHead("Premium Digital Invitations in Nepal", "SainoX designs personalised, animated digital invitations for weddings, bratabandha, anniversaries, birthdays and every special occasion in Nepal."),
  component: Home,
});

function Home() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-y-0 left-6 hidden w-px bg-brand-ember/60 md:block" aria-hidden />
        <div className="mx-auto flex max-w-5xl flex-col items-center px-5 py-20 text-center md:py-28">
          <img src={logo.url} alt="SainoX logo" className="w-64 animate-brand-rise md:w-96" />
          <p className="mt-4 text-lg text-brand-cream/80 md:text-xl">साथ, सम्भावना, सफलता ।</p>
          <h1 className="mt-8 max-w-3xl font-brand text-4xl leading-tight md:text-6xl">
            Invitations as <span className="text-brand-gradient">memorable</span> as the moment itself
          </h1>
          <p className="mt-5 max-w-2xl text-brand-cream/70">
            SainoX is a premium digital invitation studio from Bhaktapur. We craft personalised, animated invitations that greet every guest by name — ready to share in a single tap.
          </p>
          <div className="mt-8"><CtaButtons center /></div>
        </div>
      </section>

      <section className="border-y border-brand-line bg-brand-ink-raised py-20">
        <div className="mx-auto max-w-6xl px-5">
          <SectionTitle eyebrow="What we create" title="For every celebration" />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s) => (
              <Link key={s.slug} to="/site/services" className="group rounded-2xl border border-brand-line bg-brand-ink p-6 transition hover:border-brand-ember">
                <p className="text-sm text-brand-ember">{s.nepali}</p>
                <h3 className="mt-1 font-brand text-2xl">{s.title}</h3>
                <p className="mt-2 text-sm text-brand-cream/65">{s.blurb}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-5">
          <SectionTitle eyebrow="Why SainoX" title="Made with care, shared with ease" />
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {WHY.slice(0, 3).map((w) => (
              <div key={w.title} className="text-center">
                <h3 className="font-brand text-xl text-brand-cream">{w.title}</h3>
                <p className="mt-2 text-sm text-brand-cream/65">{w.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center"><Link to="/site/why-sainox" className="text-sm text-brand-ember hover:underline">See all reasons →</Link></div>
        </div>
      </section>

      <section className="border-t border-brand-line bg-brand-ink-raised py-20 text-center">
        <div className="mx-auto max-w-2xl px-5">
          <h2 className="font-brand text-3xl md:text-4xl">Planning a celebration?</h2>
          <Divider className="my-5" />
          <p className="mb-8 text-brand-cream/70">Tell us your occasion and date — we'll design an invitation your guests will remember.</p>
          <CtaButtons center />
        </div>
      </section>
    </>
  );
}
