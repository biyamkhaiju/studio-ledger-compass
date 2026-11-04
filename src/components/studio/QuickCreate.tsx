import { useEffect, useId, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DIVISIONS, uid, useStore, type Division, type Client } from "@/lib/store";
import { CATEGORY_INFO, INVITATION_CATEGORIES, type InvitationCategory } from "@/lib/invitations";
import type { QuickCreateOptions } from "@/lib/contexts";

export type CreateKind = Division | "client" | "payment" | "expense";

const TEMPLATES: Record<Exclude<Division, "wedding">, string[]> = {
  website: ["Discovery", "Wireframes", "UI design", "Development", "Testing", "Launch"],
  ml: ["Problem definition", "Data collection", "Preprocessing", "Model training", "Evaluation", "Deployment"],
};

const sel = "h-9 w-full rounded-md border border-input bg-background px-3 text-sm";

export function QuickCreateDialog({ kind, preset, onClose }: { kind: CreateKind | null; preset?: QuickCreateOptions; onClose: () => void }) {
  const { data, set, log } = useStore();
  const navigate = useNavigate();
  const [f, setF] = useState<Record<string, string>>({});
  const [err, setErr] = useState("");
  const [busy,setBusy]=useState(false);
  const [newClient, setNewClient] = useState(false);
  // Apply presets each time the dialog opens.
  useEffect(() => { if (kind) setF({ ...(preset?.category ? { category: preset.category } : {}), ...(preset?.projectId ? { projectId: preset.projectId } : {}) }); }, [kind, preset?.category, preset?.projectId]);
  const v = (k: string) => f[k] ?? "";
  const up = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const close = () => { setF({}); setNewClient(false); setErr(""); onClose(); };
  const today = new Date().toISOString().slice(0, 10);
  const isProject = kind === "wedding" || kind === "website" || kind === "ml";
  const category = (v("category") || "wedding") as InvitationCategory;

  const submit = async () => {
    if (!kind) return;
    if (isProject) {
      if (!v("name").trim() || (!newClient && !v("clientId")) || (newClient && !v("clientName").trim()) || !v("deadline")) return setErr("Name, client and deadline are required.");
      const budget = Number(v("budget") || 0);
      if (!Number.isFinite(budget) || budget < 0) return setErr("Enter a valid, non-negative budget.");
      const id = uid();
      const clientId = newClient ? uid() : v("clientId");
      const invitation = kind === "wedding";
      const label = invitation ? `${CATEGORY_INFO[category].label} invitation` : DIVISIONS[kind].short;
      const milestones = invitation ? CATEGORY_INFO[category].milestones : TEMPLATES[kind];
      const saved = await set((d) => ({
        ...d,
        clients: newClient ? [...d.clients, {id:clientId,name:v("clientName").trim(),kind:invitation?"wedding":"business",email:"",phone:"",location:"",createdAt:today}] : d.clients,
        activity: [{id:uid(),text:`New ${label} project created: ${v("name").trim()}`,date:new Date().toISOString()},...d.activity],
        projects: [...d.projects, {
          id, name: v("name").trim(), division: kind, clientId, status: "planning", budget,
          startDate: today, deadline: v("deadline"), description: v("description"),
          milestones: milestones.map((t) => ({ id: uid(), title: t, done: false })), manualProgress: 0,
          invitationCategory: invitation ? category : null,
          eventDate: invitation ? v("eventDate") : "", eventTime: "", eventVenue: invitation ? v("eventVenue").trim() : "",
          hosts: invitation ? v("hosts").trim() : "", invitationMessage: "",
        }],
      }));
      if(!saved)return setErr("Could not save project. Please retry.");
      close();
      navigate({ to: "/projects/$projectId", params: { projectId: id } });
      return;
    }
    if (kind === "client") {
      if (!v("name").trim()) return setErr("Name is required.");
      const saved=await set((d) => ({ ...d, clients: [...d.clients, { id: uid(), name: v("name").trim(), kind: (v("ckind") || "business") as Client["kind"], email: v("email").trim(), phone: v("phone").trim(), location: v("location").trim(), createdAt: today }] }));
      if(!saved)return setErr("Could not save client. Please retry.");
      log(`New client registered: ${v("name").trim()}`);
      return close();
    }
    const amount = Number(v("amount"));
    if (!(amount > 0)) return setErr("Enter an amount greater than 0.");
    if (kind === "payment") {
      if (!v("projectId")) return setErr("Choose a project.");
      if(!await set((d) => ({ ...d, payments: [...d.payments, { id: uid(), projectId: v("projectId"), amount, date: v("date") || today, note: v("note") }] })))return setErr("Could not save entry. Please retry.");
      log(`Payment received — NPR ${amount.toLocaleString("en-IN")}`);
    } else {
      if (!v("category").trim()) return setErr("Category is required.");
      if(!await set((d) => ({ ...d, expenses: [...d.expenses, { id: uid(), projectId: v("projectId") || null, category: v("category").trim(), amount, date: v("date") || today, note: v("note") }] })))return setErr("Could not save entry. Please retry.");
      log(`Expense recorded — NPR ${amount.toLocaleString("en-IN")} (${v("category").trim()})`);
    }
    close();
  };

  const title = !kind ? "" : kind === "wedding" ? "New invitation project" : isProject ? `New ${DIVISIONS[kind as Division].short} project` : kind === "client" ? "New client" : kind === "payment" ? "Record payment" : "Record expense";

  return (
    <Dialog open={!!kind} onOpenChange={(o) => !o && !busy && close()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <form onSubmit={e => {e.preventDefault(); if(busy)return;setBusy(true);void submit().finally(()=>setBusy(false));}} className="grid gap-3">
          {kind === "wedding" && (
            <Field label="Invitation type">
              <select className={sel} value={category} onChange={up("category")}>
                {INVITATION_CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_INFO[c].label}</option>)}
              </select>
            </Field>
          )}
          {isProject && (<>
            <Field label="Project name"><Input value={v("name")} onChange={up("name")} placeholder={kind === "wedding" ? "e.g. Rai family wedding cards" : undefined} /></Field>
            <Field label="Client">
              {newClient ? <Input value={v("clientName")} onChange={up("clientName")} placeholder="Client name" /> :
              <select className={sel} value={v("clientId")} onChange={up("clientId")}>
                <option value="">Select client…</option>
                {data.clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>}
              <Button type="button" size="sm" variant="link" className="justify-start px-0" onClick={()=>setNewClient(!newClient)}>{newClient ? "Choose existing client" : "Add new client"}</Button>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Contract value (NPR)"><Input type="number" min={0} value={v("budget")} onChange={up("budget")} /></Field>
              <Field label="Delivery deadline"><Input type="date" value={v("deadline")} onChange={up("deadline")} /></Field>
            </div>
            {kind === "wedding" && (<>
              <Field label="Hosted by (shown on invitations)"><Input value={v("hosts")} onChange={up("hosts")} placeholder="e.g. Mr. & Mrs. Rai and family" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Event date"><Input type="date" value={v("eventDate")} onChange={up("eventDate")} /></Field>
                <Field label="Venue"><Input value={v("eventVenue")} onChange={up("eventVenue")} /></Field>
              </div>
            </>)}
            <Field label="Description"><Input value={v("description")} onChange={up("description")} /></Field>
          </>)}
          {kind === "client" && (<>
            <Field label="Name"><Input value={v("name")} onChange={up("name")} /></Field>
            <Field label="Type">
              <select className={sel} value={v("ckind") || "business"} onChange={up("ckind")}>
                <option value="business">Business</option><option value="wedding">Family / Invitation</option><option value="internal">Internal</option>
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Email"><Input type="email" value={v("email")} onChange={up("email")} /></Field>
              <Field label="Phone"><Input value={v("phone")} onChange={up("phone")} /></Field>
            </div>
            <Field label="Location"><Input value={v("location")} onChange={up("location")} /></Field>
          </>)}
          {(kind === "payment" || kind === "expense") && (<>
            {kind === "expense" && <Field label="Category"><Input placeholder="Hosting, Software, Printing…" value={v("category")} onChange={up("category")} /></Field>}
            <Field label={kind === "payment" ? "Project" : "Project (optional)"}>
              <select className={sel} value={v("projectId")} onChange={up("projectId")}>
                <option value="">{kind === "payment" ? "Select project…" : "General / studio-wide"}</option>
                {data.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Amount (NPR)"><Input type="number" min={0} value={v("amount")} onChange={up("amount")} /></Field>
              <Field label="Date"><Input type="date" value={v("date") || today} onChange={up("date")} /></Field>
            </div>
            <Field label="Note"><Input value={v("note")} onChange={up("note")} /></Field>
          </>)}
          {err && <p role="alert" className="text-sm text-danger">{err}</p>}
        <DialogFooter>
          <Button type="button" variant="ghost" disabled={busy} onClick={close}>Cancel</Button>
          <Button type="submit" disabled={busy}>{busy?"Saving…":"Save"}</Button>
        </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const id = useId();
  return <div className="grid gap-1.5" role="group" aria-labelledby={id}><Label id={id} className="text-xs text-muted-foreground">{label}</Label>{children}</div>;
}
