import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ProfileSettings } from "@/components/studio/ProfileSettings";
import { mergeBackup } from "@/lib/backup";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/studio/ui";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme";
import { Sun, Moon, Download } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — SainoX Dashboard" },
      { name: "description", content: "SainoX Dashboard workspace settings and data controls." },
      { property: "og:title", content: "Settings — SainoX Dashboard" },
      { property: "og:description", content: "SainoX Dashboard workspace settings and data controls." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { data, set, saving, error } = useStore();
  const [backup, setBackup] = useState<unknown>(null);
  const [importError, setImportError] = useState("");
  const [message, setMessage] = useState("");
  const { theme, setTheme } = useTheme();
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Settings" subtitle="Workspace and data" />
      <section className="space-y-4 border-b border-border py-5">
        <h2 className="font-semibold">Appearance</h2>
        <div className="flex gap-2">
          <Button variant={theme === "dark" ? "default" : "secondary"} aria-pressed={theme === "dark"} onClick={() => setTheme("dark")}><Moon className="h-4 w-4" />Dark</Button>
          <Button variant={theme === "light" ? "default" : "secondary"} aria-pressed={theme === "light"} onClick={() => setTheme("light")}><Sun className="h-4 w-4" />Light</Button>
        </div>
      </section>
      <section className="space-y-4 border-b border-border py-5">
        <h2 className="font-semibold">Profile</h2>
        <ProfileSettings />
      </section>
      <section className="space-y-4 py-5">
        <div>
          <h2 className="font-semibold">Your data</h2>
          <p className="mt-1 text-sm text-muted-foreground">Your records are saved securely to your private cloud account.</p>
          <p className="mt-2 text-sm text-muted-foreground">Import adds missing records only. Existing records are never overwritten.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" disabled={saving || !!error} onClick={() => {
            const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
            const a = document.createElement("a"); a.href = url; a.download = "sainox-dashboard-backup.json"; a.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
          }}><Download className="h-4 w-4" />Download backup</Button>
        </div>
        <label className="grid max-w-sm gap-2 text-sm">Import backup<Input aria-label="Import backup" type="file" accept="application/json,.json" disabled={saving} onChange={async e => {
          setBackup(null); setMessage(""); setImportError("");
          const file = e.target.files?.[0]; if (!file) return;
          try { const input: unknown = JSON.parse(await file.text()); mergeBackup(data, input); setBackup(input); }
          catch (e) { setImportError(e instanceof Error ? e.message : "Invalid backup."); }
          e.target.value = "";
        }} /></label>
        {backup !== null && <Button disabled={saving} onClick={async () => {
          if (await set(current => mergeBackup(current, backup))) { setBackup(null); setMessage("Backup imported without overwriting existing records."); }
        }}>Confirm import</Button>}
        {message && <p role="status" className="text-sm text-success">{message}</p>}
        {importError && <p role="alert" className="text-sm text-danger">{importError}</p>}
      </section>
    </div>
  );
}
