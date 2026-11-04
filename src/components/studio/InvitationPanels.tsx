import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Download, ExternalLink, MessageCircle, Pencil, Plus, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CATEGORY_INFO, INVITATION_CATEGORIES, inviteUrl, parseGuestList, type InvitationCategory } from "@/lib/invitations";
import { useGuestActions, useGuests, type Guest, type GuestInput } from "@/lib/guests";
import type { Project } from "@/lib/store";

const area = "w-full rounded-md border border-input bg-background p-2 text-sm";
const sel = "h-9 w-full rounded-md border border-input bg-background px-2 text-sm";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-1"><span className="text-xs text-muted-foreground">{label}</span>{children}</label>;
}

/** Event details printed on every guest's invitation. */
export function InvitationDetails({ project, update }: { project: Project; update: (patch: Partial<Project>) => void }) {
  const category = project.invitationCategory ?? "wedding";
  return (
    <section className="panel space-y-3 p-5">
      <div>
        <h2 className="font-semibold">Invitation details</h2>
        <p className="text-xs text-muted-foreground">Shown on every guest's personal invitation.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Row label="Invitation type">
          <select className={sel} value={category} onChange={(e) => update({ invitationCategory: e.target.value as InvitationCategory })}>
            {INVITATION_CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_INFO[c].label}</option>)}
          </select>
        </Row>
        <Row label="Hosted by"><Input key={project.id + "-hosts"} defaultValue={project.hosts} maxLength={500} placeholder="e.g. Mr. & Mrs. Rai and family" onBlur={(e) => e.target.value.trim() !== project.hosts && update({ hosts: e.target.value.trim() })} /></Row>
        <Row label="Event date"><Input type="date" value={project.eventDate} onChange={(e) => update({ eventDate: e.target.value })} /></Row>
        <Row label="Time"><Input key={project.id + "-time"} defaultValue={project.eventTime} maxLength={100} placeholder="e.g. 11:00 AM onwards" onBlur={(e) => e.target.value.trim() !== project.eventTime && update({ eventTime: e.target.value.trim() })} /></Row>
      </div>
      <Row label="Venue"><Input key={project.id + "-venue"} defaultValue={project.eventVenue} maxLength={500} placeholder="e.g. Hotel Annapurna, Kathmandu" onBlur={(e) => e.target.value.trim() !== project.eventVenue && update({ eventVenue: e.target.value.trim() })} /></Row>
      <Row label="Message to guests"><textarea key={project.id + "-msg"} defaultValue={project.invitationMessage} maxLength={5000} rows={3} placeholder="Your presence and blessings will make the day complete." className={area} onBlur={(e) => e.target.value.trim() !== project.invitationMessage && update({ invitationMessage: e.target.value.trim() })} /></Row>
    </section>
  );
}

function whatsappLink(guest: Guest, url: string, event: string) {
  const text = `Dear ${guest.name}, you are warmly invited to our ${event}. Your personal invitation: ${url}`;
  let digits = guest.phone.replace(/\D/g, "");
  if (digits.length === 10 && digits.startsWith("9")) digits = "977" + digits; // Nepali mobile numbers
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

/** Guest list with a personal invitation link for every guest. */
export function GuestManager({ project }: { project: Project }) {
  const guests = useGuests(project.id);
  const { add, update, remove } = useGuestActions(project.id);
  const [origin, setOrigin] = useState("");
  const [form, setForm] = useState<GuestInput>({ name: "", relation: "", phone: "" });
  const [bulk, setBulk] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Guest | null>(null);
  const [copied, setCopied] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  const event = CATEGORY_INFO[project.invitationCategory ?? "wedding"].event;
  const list = useMemo(() => (guests.data ?? []).filter((g) => `${g.name} ${g.relation} ${g.phone}`.toLowerCase().includes(query.trim().toLowerCase())), [guests.data, query]);
  const busy = add.isPending || update.isPending || remove.isPending;

  async function run(action: () => Promise<unknown>, done: string) {
    setError(""); setMessage("");
    try { await action(); setMessage(done); return true; }
    catch (e) { setError(e instanceof Error ? e.message : "Could not save guests. Please retry."); return false; }
  }
  async function copy(guest: Guest) {
    try { await navigator.clipboard.writeText(inviteUrl(origin, guest.slug)); setCopied(guest.id); setTimeout(() => setCopied(""), 1500); }
    catch { setError("Couldn't copy automatically — open the link and copy it from the address bar."); }
  }
  function downloadCsv() {
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const rows = [["Name", "Relation", "Phone", "Invitation link"], ...(guests.data ?? []).map((g) => [g.name, g.relation, g.phone, inviteUrl(origin, g.slug)])];
    const url = URL.createObjectURL(new Blob(["\ufeff" + rows.map((r) => r.map(esc).join(",")).join("\n")], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = `${project.name.replace(/[^\p{L}\p{N}]+/gu, "-")}-guests.csv`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const pasted = bulk === null ? [] : parseGuestList(bulk);

  return (
    <section className="panel p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-semibold"><Users className="h-4 w-4" />Guests & invitation links</h2>
          <p className="text-xs text-muted-foreground">Every guest gets their own link with their name on the invitation.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => setBulk(bulk === null ? "" : null)}>{bulk === null ? "Paste a list" : "Add one by one"}</Button>
          <Button size="sm" variant="ghost" disabled={!guests.data?.length} onClick={downloadCsv}><Download className="h-4 w-4" />Download list</Button>
        </div>
      </div>

      {bulk === null ? (
        <form className="grid gap-2 sm:grid-cols-[2fr_1.3fr_1.3fr_auto]" onSubmit={async (e) => {
          e.preventDefault();
          if (!form.name.trim()) return setError("Enter the guest's name.");
          if (await run(() => add.mutateAsync([form]), `${form.name.trim()} added.`)) setForm({ name: "", relation: "", phone: "" });
        }}>
          <Input aria-label="Guest name" placeholder="Guest name" maxLength={200} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input aria-label="Relation" placeholder="Relation (optional)" maxLength={200} value={form.relation} onChange={(e) => setForm({ ...form, relation: e.target.value })} />
          <Input aria-label="Phone" placeholder="Phone (optional)" maxLength={50} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Button type="submit" disabled={busy}><Plus className="h-4 w-4" />Add guest</Button>
        </form>
      ) : (
        <div className="space-y-2">
          <textarea aria-label="Guest list" rows={6} className={area} placeholder={"One guest per line, optionally with relation:\nSita Rai, Aunt\nRam Bahadur Thapa, Friend"} value={bulk} onChange={(e) => setBulk(e.target.value)} />
          <Button disabled={busy || !pasted.length} onClick={async () => { if (await run(() => add.mutateAsync(pasted.map((g) => ({ ...g, phone: "" }))), `${pasted.length} guests added.`)) setBulk(""); }}>
            <Plus className="h-4 w-4" />Add {pasted.length || ""} guest{pasted.length === 1 ? "" : "s"}
          </Button>
        </div>
      )}
      {error && <p role="alert" className="mt-3 text-sm text-danger">{error}</p>}
      {message && <p role="status" className="mt-3 text-sm text-success">{message}</p>}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm text-muted-foreground">{guests.data?.length ?? 0} guest{guests.data?.length === 1 ? "" : "s"}</span>
        {(guests.data?.length ?? 0) > 5 && <Input aria-label="Search guests" placeholder="Search guests…" value={query} onChange={(e) => setQuery(e.target.value)} className="max-w-xs" />}
      </div>
      {guests.isLoading ? <p className="py-6 text-sm text-muted-foreground">Loading guests…</p> :
       guests.error ? <div role="alert" className="mt-3 flex items-center gap-3 text-sm text-danger">{guests.error.message}<Button size="sm" variant="secondary" onClick={() => void guests.refetch()}>Retry</Button></div> :
       !guests.data?.length ? <p className="py-6 text-center text-sm text-muted-foreground">No guests yet. Add relatives and friends to create their invitation links.</p> : (
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="text-left text-xs text-muted-foreground"><tr className="[&>th]:py-2 [&>th]:font-normal"><th>Guest</th><th>Phone</th><th>Invitation link</th><th /></tr></thead>
            <tbody>
              {list.map((g) => {
                const url = inviteUrl(origin, g.slug);
                return (
                  <tr key={g.id} className="border-t border-border/60 [&>td]:py-2.5">
                    <td><div className="font-medium">{g.name}</div>{g.relation && <div className="text-xs text-muted-foreground">{g.relation}</div>}</td>
                    <td className="text-muted-foreground">{g.phone || "—"}</td>
                    <td className="max-w-[260px]"><a href={url} target="_blank" rel="noreferrer" className="block truncate text-xs text-primary hover:underline">{url.replace(/^https?:\/\//, "")}</a></td>
                    <td className="whitespace-nowrap text-right">
                      <Button size="icon" variant="ghost" aria-label={`Copy link for ${g.name}`} title="Copy link" onClick={() => void copy(g)}>{copied === g.id ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}</Button>
                      <Button size="icon" variant="ghost" asChild><a href={whatsappLink(g, url, event)} target="_blank" rel="noreferrer" aria-label={`Share with ${g.name} on WhatsApp`} title="Share on WhatsApp"><MessageCircle className="h-4 w-4" /></a></Button>
                      <Button size="icon" variant="ghost" asChild><a href={url} target="_blank" rel="noreferrer" aria-label={`Open invitation for ${g.name}`} title="Open invitation"><ExternalLink className="h-4 w-4" /></a></Button>
                      <Button size="icon" variant="ghost" aria-label={`Edit ${g.name}`} title="Edit" onClick={() => setEditing(g)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" aria-label={`Delete ${g.name}`} title="Delete" disabled={busy} onClick={() => { if (confirm(`Remove ${g.name}? Their invitation link will stop working.`)) void run(() => remove.mutateAsync([g.id]), `${g.name} removed.`); }}><Trash2 className="h-4 w-4 text-danger" /></Button>
                    </td>
                  </tr>
                );
              })}
              {!list.length && <tr><td colSpan={4} className="py-6 text-center text-muted-foreground">No guests match your search.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {editing && <GuestEditor guest={editing} busy={update.isPending} close={() => setEditing(null)} save={async (input) => { if (await run(() => update.mutateAsync({ guest: editing, input }), "Guest updated.")) setEditing(null); }} />}
    </section>
  );
}

function GuestEditor({ guest, busy, close, save }: { guest: Guest; busy: boolean; close: () => void; save: (input: GuestInput) => Promise<void> }) {
  const [form, setForm] = useState<GuestInput>({ name: guest.name, relation: guest.relation, phone: guest.phone });
  const renamed = form.name.trim() !== guest.name;
  return (
    <Dialog open onOpenChange={(o) => !o && !busy && close()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit guest</DialogTitle></DialogHeader>
        <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); void save(form); }}>
          <Row label="Name"><Input value={form.name} maxLength={200} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Row>
          <Row label="Relation"><Input value={form.relation} maxLength={200} onChange={(e) => setForm({ ...form, relation: e.target.value })} /></Row>
          <Row label="Phone"><Input value={form.phone} maxLength={50} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Row>
          {renamed && <p className="text-xs text-warning">Changing the name creates a new link to match it. The old link will stop working.</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" disabled={busy} onClick={close}>Cancel</Button>
            <Button type="submit" disabled={busy || !form.name.trim()}>{busy ? "Saving…" : "Save guest"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
