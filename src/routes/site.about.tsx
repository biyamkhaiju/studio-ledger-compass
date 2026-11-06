import { createFileRoute } from "@tanstack/react-router";
import logo from "@/assets/sainox-logo.png.asset.json";
import { CtaButtons, SectionTitle } from "@/components/site/SiteChrome";
import { siteHead } from "@/components/site/meta";

export const Route = createFileRoute("/site/about")({
  head: () => siteHead("About Us", "SainoX is a digital invitation studio from Katunje, Bhaktapur, blending Nepali heritage with modern design."),
  component: About,
});

function About() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-5">
        <SectionTitle eyebrow="About us" title="Our story" />
        <div className="mt-12 grid items-center gap-10 md:grid-cols-2">
          <img src={logo.url} alt="SainoX logo" className="mx-auto w-72" />
          <div className="space-y-4 text-brand-cream/75">
            <p>SainoX was born in Katunje, Bhaktapur — surrounded by temples, mountains and centuries of celebration. We believe the way you invite someone says as much as the event itself.</p>
            <p>Our studio turns invitations into experiences: personal, animated and easy to share, while staying true to the culture and traditions of every family we work with.</p>
            <p className="font-brand text-xl text-brand-cream">Our vision</p>
            <p>To be Nepal's most trusted name in digital invitations — <span className="text-brand-ember">साथ, सम्भावना, सफलता</span>: together, possibility, success.</p>
          </div>
        </div>
        <div className="mt-14"><CtaButtons center /></div>
      </div>
    </section>
  );
}
