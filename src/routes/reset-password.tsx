import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Choose a new password — SainoX Dashboard" },
      { name: "description", content: "Set a new password for your SainoX Dashboard account." },
      { property: "og:title", content: "Choose a new password — SainoX Dashboard" },
      { property: "og:description", content: "Set a new password for your SainoX Dashboard account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const { session, ready } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) return setError("Use at least 8 characters.");
    if (password !== confirm) return setError("The two passwords don't match.");
    setBusy(true); setError("");
    const { error: e2 } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (e2) return setError(e2.message);
    void navigate({ to: "/" });
  }

  return (
    <div className="mx-auto max-w-md py-16">
      <h1 className="text-3xl font-semibold">Choose a new password</h1>
      {!ready ? (
        <p className="mt-6 text-sm text-muted-foreground">Checking your link…</p>
      ) : !session ? (
        <p className="mt-6 text-sm text-muted-foreground">This reset link has expired or was already used. Go back to sign in and request a new one.</p>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-4">
          <Input aria-label="New password" type="password" placeholder="New password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          <Input aria-label="Confirm new password" type="password" placeholder="Confirm new password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          {error && <p role="alert" className="text-sm text-danger">{error}</p>}
          <Button disabled={busy} className="w-full">{busy ? "Saving…" : "Save new password"}</Button>
        </form>
      )}
    </div>
  );
}
