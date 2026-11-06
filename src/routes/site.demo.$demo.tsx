import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Divider } from "@/components/site/SiteChrome";
import { DEMOS } from "@/components/site/demos";

export const Route = createFileRoute("/site/demo/$demo")({
  loader: ({ params }) => {
    const demo = DEMOS.find((d) => d.slug === params.demo);
    if (!demo) throw notFound();
    return demo;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.title} demo — SainoX` : "Demo unavailable — SainoX" },
      { name: "description", content: loaderData ? `Live demo of a SainoX ${loaderData.category} digital invitation.` : "This demo is not available." },
      { property: "og:title", content: loaderData ? `${loaderData.title} demo — SainoX` : "Demo unavailable — SainoX" },
      { property: "og:description", content: "A live SainoX digital invitation demo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  notFoundComponent: () => <p className="py-24 text-center">Demo not found. <Link to="/site/portfolio" className="text-brand-ember">Back to portfolio</Link></p>,
  component: DemoPage,
});

function DemoPage() {
  const d = Route.useLoaderData();
  return (
    <section className="flex min-h-[80vh] items-center justify-center px-5 py-16">
      <div className="w-full max-w-md animate-brand-rise rounded-3xl border border-brand-ember/40 bg-brand-ink-raised p-10 text-center shadow-brand">
        <p className="text-sm text-brand-cream/60">Dear Guest Name,</p>
        <p className="mt-6 text-2xl text-brand-ember">{d.nepali}</p>
        <h1 className="mt-3 font-brand text-4xl">{d.hosts}</h1>
        <Divider className="my-6" />
        <p className="text-brand-cream/80">{d.message}</p>
        <div className="mt-8 space-y-1 text-sm">
          <p className="font-semibold">{d.date}</p>
          <p className="text-brand-cream/60">{d.venue}</p>
        </div>
        <p className="mt-10 text-xs uppercase tracking-[0.25em] text-brand-cream/40">Demo by SainoX</p>
        <div className="mt-6 flex justify-center gap-4 text-sm">
          <Link to="/site/portfolio" className="text-brand-cream/70 hover:text-brand-cream">← Portfolio</Link>
          <Link to="/site/contact" className="font-semibold text-brand-ember">Order one like this</Link>
        </div>
      </div>
    </section>
  );
}
