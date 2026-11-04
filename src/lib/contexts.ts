// Shared React contexts live in this small, dependency-free module on purpose.
// When a provider module (store.tsx, auth.tsx, theme.tsx) is reloaded during
// development, Vite re-executes it; if it also created its context, consumers
// and the already-mounted provider would hold two different context objects
// and every useStore() call would throw "useStore outside provider".
// Keeping the context objects here gives them one identity for the app's life.
import { createContext } from "react";
import type { Session } from "@supabase/supabase-js";
import type { Tables } from "@/integrations/supabase/types";
import type { LedgerData } from "./ledger-schema";
import type { Theme } from "./theme-preference";
import type { InvitationCategory } from "./invitations";

export interface StoreValue {
  data: LedgerData;
  set: (fn: (d: LedgerData) => LedgerData) => Promise<boolean>;
  log: (text: string) => void;
  loading: boolean;
  saving: boolean;
  error: string;
  reload: () => Promise<void>;
}
export const StoreContext = createContext<StoreValue | null>(null);

export interface AuthValue {
  session: Session | null;
  ready: boolean;
  profile: Tables<"profiles"> | null;
  avatar: string;
  refresh: () => Promise<void>;
}
export const AuthContext = createContext<AuthValue>({ session: null, ready: false, profile: null, avatar: "", refresh: async () => {} });

export const ThemeContext = createContext<{ theme: Theme; setTheme: (theme: Theme) => void } | null>(null);

export type QuickCreateKind = "wedding" | "website" | "ml" | "client" | "payment" | "expense";
/** Optional presets: invitation category for new invitation projects, project for payments/expenses. */
export type QuickCreateOptions = { category?: InvitationCategory; projectId?: string };
export const QuickCreateContext = createContext<(k: QuickCreateKind, options?: QuickCreateOptions) => void>(() => {});
