import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/inquiries")({
  head: () => ({
    meta: [
      { title: "Website Inquiries — SainoX Dashboard" },
      { name: "description", content: "Manage potential customers who contacted SainoX through the website." },
      { property: "og:title", content: "Website Inquiries — SainoX Dashboard" },
      { property: "og:description", content: "Manage potential customers who contacted SainoX through the website." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Inquiries,
});

type Inquiry = Tables<"inquiries">;
const STATUSES = ["new", "contacted", "converted", "closed"] as const;

function Inquiries() {
  const [rows, setRows] = useState<Inquiry[] | null>(null);
  const [error, setError] = useState("");
  const load = async () => {
    const { data, error } = await supabase.from("inquiries").select("*").order("created_at", { ascending: false });
    if (error) setError(error.message); else setRows(data);
  };
  useEffect(() => { void load(); }, []);

  const update = async (id: string, patch: Partial<Inquiry>) => {
    const { error } = await supabase.from("inquiries").update(patch).eq("id", id);
    if (error) setError(error.message); else void load();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this inquiry?")) return;
    const { error } = await supabase.from("inquiries").delete().eq("id", id);
    if (error) setError(error.message); else void load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-brand text-3xl">Website Inquiries</h1>
        <p className="text-sm text-muted-foreground">Messages sent from the contact form on your website. Only admins can see these.</p>
      </div>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      {!rows ? <p className="text-muted-foreground">Loading…</p> : rows.length === 0 ? (
        <p className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">No inquiries yet.</p>
      ) : (
        <div className="grid gap-4">
          {rows.map((r) => (
            <article key={r.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{r.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {[r.occasion, r.event_date && `Event ${r.event_date}`, new Date(r.created_at).toLocaleString()].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select aria-label="Status" value={r.status} onChange={(e) => void update(r.id, { status: e.target.value })} className="rounded-md border border-input bg-background px-2 py-1 text-sm capitalize">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <Button variant="ghost" size="icon" aria-label="Delete inquiry" onClick={() => void remove(r.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-sm">
                {r.phone && <a className="text-primary hover:underline" href={`https://wa.me/977${r.phone.replace(/\D/g, "").replace(/^977/, "")}`} target="_blank" rel="noreferrer">WhatsApp {r.phone}</a>}
                {r.email && <a className="text-primary hover:underline" href={`mailto:${r.email}`}>{r.email}</a>}
              </div>
              {r.message && <p className="mt-3 whitespace-pre-wrap text-sm">{r.message}</p>}
              <textarea aria-label="Notes" defaultValue={r.notes} maxLength={2000} placeholder="Private notes…" onBlur={(e) => e.target.value !== r.notes && void update(r.id, { notes: e.target.value })} className="mt-3 w-full rounded-md border border-input bg-background p-2 text-sm" />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
