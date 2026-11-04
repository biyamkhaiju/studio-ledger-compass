import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { guestSlug } from "./invitations";

export type Guest = Tables<"invitation_guests">;
export type GuestInput = { name: string; relation: string; phone: string };

const key = (projectId: string) => ["invitation-guests", projectId] as const;

function fail(error: { message: string; code?: string } | null): void {
  if (!error) return;
  throw new Error(error.code === "23505" ? "That link is already taken — please try again." : error.message);
}

/** Guests of one invitation project, oldest first. */
export function useGuests(projectId: string) {
  return useQuery({
    queryKey: key(projectId),
    queryFn: async () => {
      const result = await supabase.from("invitation_guests").select("*").eq("project_id", projectId).order("created_at").order("name");
      fail(result.error);
      return result.data ?? [];
    },
  });
}

/** Guest counts per project for overview pages. */
export function useGuestCounts() {
  return useQuery({
    queryKey: ["invitation-guests", "counts"],
    queryFn: async () => {
      const counts: Record<string, number> = {};
      for (let start = 0; ; start += 1000) {
        const result = await supabase.from("invitation_guests").select("project_id").order("id").range(start, start + 999);
        fail(result.error);
        const rows = result.data ?? [];
        for (const row of rows) counts[row.project_id] = (counts[row.project_id] ?? 0) + 1;
        if (rows.length < 1000) return counts;
      }
    },
  });
}

const clean = (g: GuestInput) => ({ name: g.name.trim().slice(0, 200), relation: g.relation.trim().slice(0, 200), phone: g.phone.trim().slice(0, 50) });

export function useGuestActions(projectId: string) {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["invitation-guests"] });
  const add = useMutation({
    mutationFn: async (guests: GuestInput[]) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in to add guests.");
      const rows = guests.map(clean).filter((g) => g.name).map((g) => ({ ...g, project_id: projectId, user_id: user.id, slug: guestSlug(g.name) }));
      if (!rows.length) throw new Error("Enter at least one guest name.");
      for (let i = 0; i < rows.length; i += 500) fail((await supabase.from("invitation_guests").insert(rows.slice(i, i + 500))).error);
      return rows.length;
    },
    onSettled: refresh,
  });
  const update = useMutation({
    mutationFn: async ({ guest, input }: { guest: Guest; input: GuestInput }) => {
      const next = clean(input);
      if (!next.name) throw new Error("Guest name is required.");
      // The link follows the name, so a corrected spelling gets a matching link.
      const slug = next.name === guest.name ? guest.slug : guestSlug(next.name);
      fail((await supabase.from("invitation_guests").update({ ...next, slug }).eq("id", guest.id)).error);
    },
    onSettled: refresh,
  });
  const remove = useMutation({
    mutationFn: async (ids: string[]) => {
      if (!ids.length) return;
      fail((await supabase.from("invitation_guests").delete().in("id", ids)).error);
    },
    onSettled: refresh,
  });
  return { add, update, remove };
}
