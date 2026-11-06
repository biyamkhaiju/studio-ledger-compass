import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SectionTitle } from "@/components/site/SiteChrome";
import { CONTACT, SERVICES, waLink } from "@/components/site/content";
import { siteHead } from "@/components/site/meta";

export const Route = createFileRoute("/site/contact")({
  head: () => siteHead("Contact", "Contact SainoX in Katunje, Bhaktapur — call or WhatsApp 9860105891 or send an inquiry for your digital invitation."),
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  phone: z.string().trim().max(30).regex(/^[0-9+\-\s]*$/, "Use digits only"),
  email: z.union([z.literal(""), z.string().trim().email("Enter a valid email").max(255)]),
  occasion: z.string().max(50),
  event_date: z.string().max(10),
  message: z.string().trim().max(2000),
}).refine((v) => v.phone || v.email, { message: "Add a phone number or email so we can reply", path: ["phone"] });

const field = "w-full rounded-xl border border-brand-line bg-brand-ink px-4 py-3 text-sm text-brand-cream outline-none placeholder:text-brand-cream/40 focus:border-brand-ember";

function Contact() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", occasion: "", event_date: "", message: "" });
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [err, setErr] = useState("");
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) { setErr(parsed.error.issues[0]?.message ?? "Please check the form"); return; }
    setErr(""); setState("sending");
    const v = parsed.data;
    const { error } = await supabase.from("inquiries").insert({ ...v, event_date: v.event_date || null });
    if (error) { setErr("Sorry, we couldn't send that. Please try again or WhatsApp us."); setState("idle"); return; }
    setState("sent");
  }

  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-5">
        <SectionTitle eyebrow="Contact" title="Let's create your invitation" sub="Send us your details and we'll get back to you soon." />
        <div className="mt-12 grid gap-8 md:grid-cols-[1fr_1.4fr]">
          <div className="space-y-4 rounded-2xl border border-brand-line bg-brand-ink-raised p-7">
            <h3 className="font-brand text-2xl">{CONTACT.name}</h3>
            <p className="text-sm text-brand-cream/60">Co-founder, SainoX</p>
            <a href={`tel:+977${CONTACT.phone}`} className="flex items-center gap-3 hover:text-brand-ember"><Phone className="h-4 w-4 text-brand-ember" />{CONTACT.phoneIntl}</a>
            <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-3 hover:text-brand-ember"><Mail className="h-4 w-4 text-brand-ember" />{CONTACT.email}</a>
            <p className="flex items-center gap-3"><MapPin className="h-4 w-4 text-brand-ember" />{CONTACT.location}</p>
            <a href={waLink()} target="_blank" rel="noreferrer" className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-success px-5 py-3 text-sm font-semibold text-brand-ink"><MessageCircle className="h-4 w-4" />Chat on WhatsApp</a>
          </div>
          {state === "sent" ? (
            <div role="status" className="flex flex-col items-center justify-center rounded-2xl border border-brand-ember/50 bg-brand-ink-raised p-10 text-center">
              <h3 className="font-brand text-3xl">Thank you! 🙏</h3>
              <p className="mt-3 text-brand-cream/70">Your inquiry has reached SainoX. We'll contact you soon.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-brand-line bg-brand-ink-raised p-7 sm:grid-cols-2">
              <label className="sm:col-span-2"><span className="sr-only">Name</span><input aria-label="Your name" className={field} placeholder="Your name *" value={form.name} onChange={set("name")} maxLength={100} /></label>
              <input aria-label="Phone" className={field} placeholder="Phone / WhatsApp" value={form.phone} onChange={set("phone")} maxLength={30} />
              <input aria-label="Email" type="email" className={field} placeholder="Email" value={form.email} onChange={set("email")} maxLength={255} />
              <select aria-label="Occasion" className={field} value={form.occasion} onChange={set("occasion")}>
                <option value="">Occasion</option>
                {SERVICES.map((s) => <option key={s.slug} value={s.title}>{s.title}</option>)}
              </select>
              <input aria-label="Event date" type="date" className={field} value={form.event_date} onChange={set("event_date")} />
              <textarea aria-label="Message" className={`${field} min-h-32 sm:col-span-2`} placeholder="Tell us about your event" value={form.message} onChange={set("message")} maxLength={2000} />
              {err && <p role="alert" className="text-sm text-danger sm:col-span-2">{err}</p>}
              <button disabled={state === "sending"} className="rounded-full bg-brand-ember px-6 py-3 text-sm font-semibold text-brand-cream hover:bg-brand-flame disabled:opacity-60 sm:col-span-2">{state === "sending" ? "Sending…" : "Send inquiry"}</button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
