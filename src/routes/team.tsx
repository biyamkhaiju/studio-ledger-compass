import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { Camera, LogIn, LogOut, Pencil, Plus, Search, ShieldCheck, Trash2, UserRound, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { PageHeader } from "@/components/studio/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Our Team — SainoX Dashboard" },
      { name: "description", content: "Meet the SainoX Dashboard team and see who is available, working or on leave." },
      { property: "og:title", content: "Our Team — SainoX Dashboard" },
      { property: "og:description", content: "Meet the SainoX Dashboard team and see who is available, working or on leave." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TeamPage,
});

type Worker = Tables<"workers">;
type Status = "available" | "working" | "on_leave";
const BUCKET = "worker-photos";

const STATUS: Record<Status, { label: string; badge: string; dot: string }> = {
  available: { label: "Available", badge: "bg-success/15 text-success", dot: "bg-success" },
  working: { label: "Working", badge: "bg-website/15 text-website", dot: "bg-website" },
  on_leave: { label: "On Leave", badge: "bg-warning/15 text-warning", dot: "bg-warning" },
};
const asStatus = (s: string): Status => (s in STATUS ? (s as Status) : "available");

function StatusPill({ status }: { status: Status }) {
  const s = STATUS[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", s.badge)}>
      <span className="relative flex h-2 w-2">
        {status !== "on_leave" && <span className={cn("absolute inline-flex h-full w-full rounded-full animate-status-ping", s.dot)} />}
        <span className={cn("relative inline-flex h-2 w-2 rounded-full", s.dot)} />
      </span>
      {s.label}
    </span>
  );
}

function TeamPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [workers, setWorkers] = useState<Worker[] | null>(null);
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Status | "all">("all");
  const [editing, setEditing] = useState<Worker | "new" | null>(null);
  const [deleting, setDeleting] = useState<Worker | null>(null);
  const [signInOpen, setSignInOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "INITIAL_SESSION") setSession(s);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const uid = session?.user.id;
    if (!uid) { setIsAdmin(false); return; }
    supabase.from("user_roles").select("role").eq("user_id", uid).eq("role", "admin").maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [session?.user.id]);

  async function load() {
    const { data, error: e } = await supabase.from("workers").select("*").order("created_at");
    if (e) { setError(e.message); setWorkers([]); return; }
    setWorkers(data);
    const paths = data.map((w) => w.photo_path).filter((p): p is string => !!p);
    if (paths.length) {
      const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrls(paths, 60 * 60);
      const map: Record<string, string> = {};
      signed?.forEach((s) => { if (s.path && s.signedUrl) map[s.path] = s.signedUrl; });
      setPhotos(map);
    } else setPhotos({});
  }
  useEffect(() => { void load(); }, [session?.user.id]);

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return (workers ?? []).filter((w) =>
      (filter === "all" || w.status === filter) &&
      (!t || w.name.toLowerCase().includes(t) || w.role.toLowerCase().includes(t)));
  }, [workers, q, filter]);

  const counts = useMemo(() => {
    const c = { all: workers?.length ?? 0, available: 0, working: 0, on_leave: 0 };
    workers?.forEach((w) => { c[asStatus(w.status)]++; });
    return c;
  }, [workers]);

  async function remove(w: Worker) {
    if (w.photo_path) await supabase.storage.from(BUCKET).remove([w.photo_path]);
    const { error: e } = await supabase.from("workers").delete().eq("id", w.id);
    if (e) setError(e.message);
    setDeleting(null);
    await load();
  }

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader title="Our Team" subtitle="The people behind SainoX Dashboard">
        <div className="flex items-center gap-2">
          {session ? (
            <>
              {isAdmin && <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex"><ShieldCheck className="h-3.5 w-3.5 text-success" />Admin</span>}
              {isAdmin && <Button size="sm" onClick={() => setEditing("new")}><Plus className="h-4 w-4" />Add worker</Button>}
              <Button size="sm" variant="ghost" onClick={() => supabase.auth.signOut()}><LogOut className="h-4 w-4" />Sign out</Button>
            </>
          ) : (
            <Button size="sm" variant="secondary" onClick={() => setSignInOpen(true)}><LogIn className="h-4 w-4" />Admin sign in</Button>
          )}
        </div>
      </PageHeader>

      {session && !isAdmin && (
        <p className="mb-4 rounded-lg border border-border bg-panel px-3 py-2 text-xs text-muted-foreground">
          You're signed in as {session.user.email}. Only admins can add, edit or remove workers.
        </p>
      )}
      {error && <p className="mb-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or role…" className="pl-9" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["all", "available", "working", "on_leave"] as const).map((k) => (
            <button key={k} onClick={() => setFilter(k)}
              className={cn("rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                filter === k ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground")}>
              {k === "all" ? "All" : STATUS[k].label} <span className="opacity-60">{counts[k]}</span>
            </button>
          ))}
        </div>
      </div>

      {workers === null ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-72 animate-pulse rounded-2xl bg-muted/50" />)}
        </div>
      ) : shown.length === 0 ? (
        <div className="panel flex flex-col items-center gap-2 px-6 py-16 text-center">
          <UserRound className="h-10 w-10 text-muted-foreground" />
          <p className="font-medium">{workers.length === 0 ? "No team members yet" : "No one matches your search"}</p>
          <p className="text-sm text-muted-foreground">
            {workers.length === 0 ? (isAdmin ? "Add your first worker to start showcasing the team." : "An admin can add workers here.") : "Try another name or status."}
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shown.map((w, i) => (
            <WorkerCard key={w.id} worker={w} index={i} photo={w.photo_path ? photos[w.photo_path] : undefined}
              admin={isAdmin} onEdit={() => setEditing(w)} onDelete={() => setDeleting(w)} />
          ))}
        </div>
      )}

      <SignInDialog open={signInOpen} onClose={() => setSignInOpen(false)} />
      {editing && (
        <WorkerDialog worker={editing === "new" ? null : editing}
          photoUrl={editing !== "new" && editing.photo_path ? photos[editing.photo_path] : undefined}
          onClose={() => setEditing(null)} onSaved={async () => { setEditing(null); await load(); }} />
      )}
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>This deletes the worker and their profile photo. It can't be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleting && remove(deleting)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function WorkerCard({ worker, index, photo, admin, onEdit, onDelete }: {
  worker: Worker; index: number; photo?: string | undefined; admin: boolean; onEdit: () => void; onDelete: () => void;
}) {
  const status = asStatus(worker.status);
  return (
    <article style={{ animationDelay: `${Math.min(index, 12) * 60}ms` }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 text-center transition-all duration-300 animate-team-rise hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/15 to-transparent opacity-60 transition-opacity group-hover:opacity-100" />
      {admin && (
        <div className="absolute right-3 top-3 z-10 flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
          <button onClick={onEdit} aria-label={`Edit ${worker.name}`} className="rounded-md bg-background/80 p-1.5 hover:bg-accent"><Pencil className="h-3.5 w-3.5" /></button>
          <button onClick={onDelete} aria-label={`Delete ${worker.name}`} className="rounded-md bg-background/80 p-1.5 text-danger hover:bg-accent"><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
      )}
      <div className="relative mx-auto mb-4 h-24 w-24">
        <div className="h-full w-full overflow-hidden rounded-full border-2 border-border ring-4 ring-background transition-transform duration-300 group-hover:scale-105">
          {photo ? <img src={photo} alt={worker.name} className="h-full w-full object-cover" loading="lazy" />
            : <div className="flex h-full w-full items-center justify-center bg-primary/15 text-2xl font-semibold text-primary">{initials(worker.name)}</div>}
        </div>
        <span className={cn("absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-card", STATUS[status].dot)} />
      </div>
      <h3 className="relative font-semibold">{worker.name}</h3>
      <p className="relative text-sm text-primary">{worker.role || "Team member"}</p>
      <div className="relative my-3 flex justify-center"><StatusPill status={status} /></div>
      {worker.description && <p className="relative line-clamp-3 text-sm text-muted-foreground">{worker.description}</p>}
    </article>
  );
}

const initials = (n: string) => n.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?";

function WorkerDialog({ worker, photoUrl, onClose, onSaved }: {
  worker: Worker | null; photoUrl?: string | undefined; onClose: () => void; onSaved: () => void;
}) {
  const [name, setName] = useState(worker?.name ?? "");
  const [role, setRole] = useState(worker?.role ?? "");
  const [description, setDescription] = useState(worker?.description ?? "");
  const [status, setStatus] = useState<Status>(asStatus(worker?.status ?? "available"));
  const [file, setFile] = useState<File | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  const shownPhoto = preview ?? (removePhoto ? undefined : photoUrl);

  function pick(f: File | undefined) {
    if (!f) return;
    if (!f.type.startsWith("image/")) return setErr("Please choose an image file.");
    if (f.size > 5 * 1024 * 1024) return setErr("Photo must be 5 MB or smaller.");
    setErr(""); setFile(f); setRemovePhoto(false);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setErr("Name is required.");
    setBusy(true); setErr("");
    try {
      const fields = { name: name.trim(), role: role.trim(), description: description.trim(), status };
      let id = worker?.id;
      if (!id) {
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await supabase.from("workers").insert({ ...fields, created_by: user?.id ?? null }).select("id").single();
        if (error) throw error;
        id = data.id;
      }
      let photo_path = worker?.photo_path ?? null;
      const oldPath = worker?.photo_path ?? null;
      if (file) {
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
        const path = `${id}/${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
        if (error) throw error;
        photo_path = path;
      } else if (removePhoto) photo_path = null;
      const { error } = await supabase.from("workers").update({ ...fields, photo_path }).eq("id", id);
      if (error) throw error;
      if (oldPath && oldPath !== photo_path) await supabase.storage.from(BUCKET).remove([oldPath]);
      onSaved();
    } catch (x) {
      setErr(x instanceof Error ? x.message : "Could not save worker.");
    } finally { setBusy(false); }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>{worker ? "Edit worker" : "Add worker"}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border border-border bg-primary/15">
              {shownPhoto ? <img src={shownPhoto} alt="" className="h-full w-full object-cover" />
                : <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-primary">{initials(name)}</div>}
            </div>
            <div className="flex flex-wrap gap-2">
              <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
              <Button type="button" size="sm" variant="secondary" onClick={() => inputRef.current?.click()}>
                <Camera className="h-4 w-4" />{shownPhoto ? "Change photo" : "Upload photo"}
              </Button>
              {shownPhoto && (
                <Button type="button" size="sm" variant="ghost" onClick={() => { setFile(null); setRemovePhoto(true); if (inputRef.current) inputRef.current.value = ""; }}>
                  <X className="h-4 w-4" />Remove
                </Button>
              )}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label htmlFor="w-name">Name</Label><Input id="w-name" value={name} maxLength={100} onChange={(e) => setName(e.target.value)} /></div>
            <div className="space-y-1.5"><Label htmlFor="w-role">Role</Label><Input id="w-role" value={role} maxLength={100} placeholder="e.g. Designer" onChange={(e) => setRole(e.target.value)} /></div>
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(STATUS) as Status[]).map((s) => (
                <button type="button" key={s} onClick={() => setStatus(s)}
                  className={cn("rounded-full border px-3 py-1.5 text-xs font-medium transition-colors", status === s ? cn("border-transparent", STATUS[s].badge) : "border-border text-muted-foreground")}>
                  {STATUS[s].label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="w-desc">Short description</Label>
            <Textarea id="w-desc" rows={3} maxLength={500} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          {err && <p className="text-sm text-danger">{err}</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SignInDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setErr("");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) setErr(error.message); else onClose();
  }
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader><DialogTitle>Admin sign in</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5"><Label htmlFor="si-email">Email</Label><Input id="si-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="space-y-1.5"><Label htmlFor="si-pass">Password</Label><Input id="si-pass" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          {err && <p className="text-sm text-danger">{err}</p>}
          <Button type="submit" className="w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
