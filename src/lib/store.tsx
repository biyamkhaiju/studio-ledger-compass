import { useServerFn } from "@tanstack/react-start";
import { fetchLedger,saveLedger } from "./ledger.functions";
import { ledgerSchema,emptyLedger,type LedgerData } from "./ledger-schema";
import { useAuth } from "./auth";
import { useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { StoreContext, type StoreValue } from "./contexts";
import type { InvitationCategory } from "./invitations";

export type Division = "wedding" | "website" | "ml";
export type ProjectStatus = "planning" | "in_progress" | "in_review" | "completed" | "on_hold" | "cancelled";

export interface Client {
  id: string;
  name: string;
  kind: "wedding" | "business" | "internal";
  email: string;
  phone: string;
  location: string;
  createdAt: string;
}
export interface Milestone { id: string; title: string; done: boolean }
export interface Project {
  id: string;
  name: string;
  division: Division;
  clientId: string;
  status: ProjectStatus;
  budget: number;
  startDate: string;
  deadline: string;
  description: string;
  milestones: Milestone[];
  manualProgress: number;
  invitationCategory: InvitationCategory | null;
  eventDate: string;
  eventTime: string;
  eventVenue: string;
  hosts: string;
  invitationMessage: string;
}
export interface Payment { id: string; projectId: string; invoiceId?: string | null; amount: number; date: string; note: string }
export interface Expense { id: string; projectId: string | null; category: string; amount: number; date: string; note: string }
export interface Activity { id: string; text: string; date: string }

export type Data = LedgerData;

export const DIVISIONS: Record<Division, { label: string; short: string }> = {
  wedding: { label: "Invitation Projects", short: "Invitation" },
  website: { label: "Websites & Business", short: "Website" },
  ml: { label: "ML / DL Projects", short: "ML/DL" },
};
export const STATUSES: Record<ProjectStatus, string> = {
  planning: "Planning",
  in_progress: "In Progress",
  in_review: "In Review",
  completed: "Completed",
  on_hold: "On Hold",
  cancelled: "Cancelled",
};

export const uid = () => crypto.randomUUID();
// ---------- calculations ----------
export const progressOf = (p: Project) =>
  p.milestones.length ? Math.round((p.milestones.filter((m) => m.done).length / p.milestones.length) * 100) : p.manualProgress;

export const paidFor = (d: Data, projectId: string) =>
  d.payments.filter((x) => x.projectId === projectId).reduce((s, x) => s + x.amount, 0);

export const outstandingFor = (d: Data, p: Project) =>
  p.status === "cancelled" ? 0 : Math.max(0, p.budget - paidFor(d, p.id));

export const isOverdue = (p: Project) =>
  !!p.deadline && p.status !== "completed" && p.status !== "cancelled" && p.deadline < new Date().toISOString().slice(0, 10);

export const daysUntil = (date: string) =>
  Math.ceil((new Date(date + "T00:00:00").getTime() - new Date(new Date().toISOString().slice(0, 10) + "T00:00:00").getTime()) / 86400e3);

export type RangeKey = "week" | "month" | "quarter" | "year";
export function rangeStart(r: RangeKey): string {
  const d = new Date();
  if (r === "week") d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  if (r === "month") d.setDate(1);
  if (r === "quarter") { d.setMonth(Math.floor(d.getMonth() / 3) * 3); d.setDate(1); }
  if (r === "year") { d.setMonth(0); d.setDate(1); }
  return d.toISOString().slice(0, 10);
}

export const npr = (n: number) => "NPR " + n.toLocaleString("en-IN");

// ---------- database-backed store ----------
type Store = StoreValue;
export function StoreProvider({children}:{children:ReactNode}) {
 const {session,ready}=useAuth();
 const fetchData=useServerFn(fetchLedger), saveData=useServerFn(saveLedger);
 const [data,setData]=useState<Data>(emptyLedger),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[error,setError]=useState("");
 const current=useRef<Data>(data), queue=useRef<Promise<unknown>>(Promise.resolve()), identity=useRef(session?.user.id);
 identity.current=session?.user.id;
 async function reload(){if(!session){setLoading(false);return;}const owner=session.user.id;const operation=queue.current.then(async()=>{if(identity.current!==owner)return;setLoading(true);try{const next=await fetchData();if(identity.current!==owner)return;current.current=next;setData(next);setError("");}catch(e){if(identity.current===owner)setError(e instanceof Error?e.message:"Could not load records.");}finally{if(identity.current===owner)setLoading(false);}});queue.current=operation;await operation;}
 useEffect(()=>{current.current=emptyLedger();setData(current.current);if(ready)void reload();},[session?.user.id,ready]);
 useEffect(()=>{const refresh=()=>{if(session&&!saving)void reload();};window.addEventListener("focus",refresh);const timer=window.setInterval(refresh,60000);return()=>{window.removeEventListener("focus",refresh);window.clearInterval(timer);};},[session?.user.id,saving]);
 const set=(fn:(d:Data)=>Data):Promise<boolean>=>{
 const owner=session?.user.id;
 const operation=queue.current.then(async()=>{if(!owner||identity.current!==owner){setError("Sign in to save records.");return false;}setSaving(true);try{const before=current.current,after=ledgerSchema.parse(fn(before));await saveData({data:{before,after}});if(identity.current!==owner)return false;current.current=after;setData(after);setError("");return true;}catch(e){setError(e instanceof Error?e.message:"Could not save records.");return false;}finally{setSaving(false);}});queue.current=operation;return operation;
 };
 const value:Store={data,set,log:text=>{void set(d=>({...d,activity:[{id:uid(),text,date:new Date().toISOString()},...d.activity]}));},loading,saving,error,reload};
 return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
export function useStore(){const store=useContext(StoreContext);if(!store)throw new Error("useStore outside provider");return store;}
