import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, MessageCircle, Phone, User } from "lucide-react";
import { SectionTitle } from "@/components/site/SiteChrome";
import { CONTACT, waLink } from "@/components/site/content";
import { siteHead } from "@/components/site/meta";

export const Route = createFileRoute("/site/our-team")({
  head: () => siteHead("Our Team", "Meet Biyam Khaiju, co-founder of SainoX digital invitation studio in Bhaktapur, Nepal."),
  component: Team,
});

function Team() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-4xl px-5">
        <SectionTitle eyebrow="Our team" title="The people behind SainoX" />
        <article className="mt-12 grid items-center gap-8 rounded-3xl border border-brand-line bg-brand-ink-raised p-8 md:grid-cols-[220px_1fr]">
          <div className="mx-auto flex aspect-square w-52 items-center justify-center rounded-full border-2 border-brand-ember/60 bg-brand-ink" aria-label="Photo placeholder">
            <User className="h-20 w-20 text-brand-cream/30" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-brand-ember">Co-founder</p>
            <h3 className="mt-2 font-brand text-4xl">{CONTACT.name}</h3>
            <p className="mt-3 text-brand-cream/70">Leads design and client experience at SainoX, making sure every invitation feels personal and every family feels looked after.</p>
            <div className="mt-5 space-y-2 text-sm text-brand-cream/80">
              <a href={`tel:+977${CONTACT.phone}`} className="flex items-center gap-2 hover:text-brand-ember"><Phone className="h-4 w-4" />{CONTACT.phoneIntl}</a>
              <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-2 hover:text-brand-ember"><Mail className="h-4 w-4" />{CONTACT.email}</a>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{CONTACT.location}</p>
            </div>
            <a href={waLink()} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-ember px-5 py-2.5 text-sm font-semibold text-brand-cream hover:bg-brand-flame"><MessageCircle className="h-4 w-4" />WhatsApp Biyam</a>
          </div>
        </article>
      </div>
    </section>
  );
}
