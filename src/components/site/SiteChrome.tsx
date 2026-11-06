import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, MessageCircle, Send, Phone, Mail, MapPin } from "lucide-react";
import logo from "@/assets/sainox-logo.png.asset.json";
import { CONTACT, FAQ, NAV, waLink } from "./content";
import { cn } from "@/lib/utils";

export function Divider({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-3", className)} aria-hidden>
      <span className="h-px w-16 bg-brand-ember/70" />
      <span className="h-2 w-2 rotate-45 border border-brand-ember" />
      <span className="h-px w-16 bg-brand-ember/70" />
    </div>
  );
}

export function SectionTitle({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-brand-ember">{eyebrow}</p>
      <h2 className="mt-3 font-brand text-3xl text-brand-cream md:text-5xl">{title}</h2>
      <Divider className="mt-5" />
      {sub && <p className="mt-5 text-brand-cream/70">{sub}</p>}
    </div>
  );
}

export function CtaButtons({ center }: { center?: boolean }) {
  return (
    <div className={cn("flex flex-wrap gap-3", center && "justify-center")}>
      <Link to="/site/contact" className="rounded-full bg-brand-ember px-6 py-3 text-sm font-semibold text-brand-cream shadow-brand transition hover:bg-brand-flame">Get your invitation</Link>
      <a href={waLink()} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-brand-cream/30 px-6 py-3 text-sm font-semibold text-brand-cream transition hover:border-brand-ember hover:text-brand-ember">
        <MessageCircle className="h-4 w-4" /> WhatsApp us
      </a>
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-brand-line bg-brand-ink/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link to="/site" className="flex items-center gap-2" aria-label="SainoX home">
          <img src={logo.url} alt="SainoX" className="h-10 w-auto" />
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: true }} className="text-sm text-brand-cream/70 transition hover:text-brand-cream" activeProps={{ className: "!text-brand-ember" }}>{n.label}</Link>
          ))}
        </nav>
        <button className="text-brand-cream md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X /> : <Menu />}</button>
      </div>
      {open && (
        <nav className="flex flex-col border-t border-brand-line px-5 py-3 md:hidden">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="py-2 text-brand-cream/80">{n.label}</Link>
          ))}
        </nav>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-brand-line bg-brand-ink">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-3">
        <div>
          <img src={logo.url} alt="SainoX" className="h-14 w-auto" />
          <p className="mt-3 text-brand-cream/70">साथ, सम्भावना, सफलता ।</p>
          <p className="mt-2 text-sm text-brand-cream/50">Premium Digital Invitation Studio, Nepal.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {NAV.map((n) => <Link key={n.to} to={n.to} className="text-brand-cream/70 hover:text-brand-ember">{n.label}</Link>)}
        </div>
        <div className="space-y-2 text-sm text-brand-cream/70">
          <a href={`tel:+977${CONTACT.phone}`} className="flex items-center gap-2 hover:text-brand-ember"><Phone className="h-4 w-4" />{CONTACT.phoneIntl}</a>
          <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-2 hover:text-brand-ember"><Mail className="h-4 w-4" />{CONTACT.email}</a>
          <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{CONTACT.location}</p>
        </div>
      </div>
      <p className="border-t border-brand-line py-4 text-center text-xs text-brand-cream/40">© {new Date().getFullYear()} SainoX. All rights reserved.</p>
    </footer>
  );
}

type Msg = { from: "bot" | "you"; text: string };
const QUICK = ["Services", "Pricing", "Delivery time", "Personal guest links", "Contact"];

function answer(input: string) {
  const t = input.toLowerCase();
  const hit = FAQ.find((f) => f.q.some((k) => t.includes(k)));
  return hit?.a ?? "Good question! For anything specific, message us on WhatsApp and we'll reply personally.";
}

function ChatBot() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([{ from: "bot", text: "Namaste! 🙏 I'm the SainoX helper. Ask about services, pricing or FAQs." }]);
  const ask = (q: string) => { if (!q.trim()) return; setMsgs((m) => [...m, { from: "you", text: q }, { from: "bot", text: answer(q) }]); setText(""); };
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-[26rem] w-[min(22rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-brand-line bg-brand-ink-raised shadow-brand">
          <div className="flex items-center justify-between border-b border-brand-line px-4 py-3">
            <p className="font-brand text-brand-cream">SainoX Helper</p>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="text-brand-cream/60"><X className="h-4 w-4" /></button>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-4 text-sm">
            {msgs.map((m, i) => (
              <p key={i} className={cn("max-w-[85%] rounded-xl px-3 py-2", m.from === "bot" ? "bg-brand-line text-brand-cream" : "ml-auto bg-brand-ember text-brand-cream")}>{m.text}</p>
            ))}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {QUICK.map((q) => <button key={q} onClick={() => ask(q)} className="rounded-full border border-brand-line px-2.5 py-1 text-xs text-brand-cream/70 hover:border-brand-ember">{q}</button>)}
            </div>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); ask(text); }} className="flex gap-2 border-t border-brand-line p-3">
            <input value={text} onChange={(e) => setText(e.target.value)} maxLength={200} placeholder="Type a question…" className="flex-1 rounded-full bg-brand-ink px-3 py-2 text-sm text-brand-cream outline-none placeholder:text-brand-cream/40" />
            <button aria-label="Send" className="rounded-full bg-brand-ember p-2 text-brand-cream"><Send className="h-4 w-4" /></button>
          </form>
        </div>
      )}
      <div className="flex gap-3">
        <a href={waLink()} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp" className="flex h-12 w-12 items-center justify-center rounded-full bg-success text-brand-ink shadow-brand"><Phone className="h-5 w-5" /></a>
        <button onClick={() => setOpen(!open)} aria-label="Open chat helper" className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-ember text-brand-cream shadow-brand"><MessageCircle className="h-5 w-5" /></button>
      </div>
    </div>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-ink font-sans text-brand-cream">
      <Header />
      <main>{children}</main>
      <Footer />
      <ChatBot />
    </div>
  );
}
