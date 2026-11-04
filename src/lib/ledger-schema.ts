import { z } from "zod";
import { INVITATION_CATEGORIES } from "./invitations";

const id = z.string().min(1).max(100);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const money = z.number().finite().nonnegative();
export const clientSchema = z.object({ id, name: z.string().trim().min(1).max(200), kind: z.enum(["wedding", "business", "internal"]), email: z.string().max(254), phone: z.string().max(100), location: z.string().max(300), createdAt: z.string() });
export const projectSchema = z.object({ id, name: z.string().trim().min(1).max(200), division: z.enum(["wedding", "website", "ml"]), clientId: z.string(), status: z.enum(["planning", "in_progress", "in_review", "completed", "on_hold", "cancelled"]), budget: money, startDate: date, deadline: z.union([date,z.literal("")]), description: z.string().max(10000), milestones: z.array(z.object({id,title:z.string().min(1),done:z.boolean()})), manualProgress: z.number().int().min(0).max(100),
 // Invitation details (only used by invitation projects; older backups default to empty).
 invitationCategory: z.enum(INVITATION_CATEGORIES).nullable().default(null), eventDate: z.union([date,z.literal("")]).default(""), eventTime: z.string().max(100).default(""), eventVenue: z.string().max(500).default(""), hosts: z.string().max(500).default(""), invitationMessage: z.string().max(5000).default("") });
export const paymentSchema = z.object({id,projectId:z.string(),invoiceId:z.string().nullable().optional(),amount:money.positive(),date,note:z.string().max(10000)});
export const expenseSchema = z.object({id,projectId:z.string().nullable(),category:z.string().min(1),amount:money.positive(),date,note:z.string().max(10000)});
export const invoiceSchema = z.object({id,projectId:z.string().nullable(),clientId:z.string().nullable(),number:z.string().trim().min(1).max(100),clientName:z.string().min(1),clientEmail:z.string(),issueDate:date,dueDate:date,notes:z.string()});
export const itemSchema = z.object({id,invoiceId:id,description:z.string().trim().min(1),quantity:z.number().finite().positive(),rate:money});
export const assignmentSchema = z.object({id,projectId:id,workerId:id});
export const ledgerSchema = z.object({clients:z.array(clientSchema),projects:z.array(projectSchema),payments:z.array(paymentSchema),expenses:z.array(expenseSchema),activity:z.array(z.object({id,text:z.string(),date:z.string()})),invoices:z.array(invoiceSchema).default([]),invoiceItems:z.array(itemSchema).default([]),assignments:z.array(assignmentSchema).default([])});
export type LedgerData = z.infer<typeof ledgerSchema>;
export type Invoice = z.infer<typeof invoiceSchema>;
export type InvoiceItem = z.infer<typeof itemSchema>;
export const emptyLedger = (): LedgerData => ({clients:[],projects:[],payments:[],expenses:[],activity:[],invoices:[],invoiceItems:[],assignments:[]});
export const invoiceTotal = (items: InvoiceItem[]) => Math.round(items.reduce((sum,item)=>sum+item.quantity*item.rate,0)*100)/100;
export function invoiceStatus(total:number,paid:number,due:string,today=new Date().toISOString().slice(0,10)) { return paid>=total && total>0 ? "Paid" : due<today ? "Overdue" : paid>0 ? "Partially paid" : "Unpaid"; }
export const canAssign = (status:string) => status==="available" || status==="working";
export function validateBackup(input:unknown):LedgerData {
 const data=ledgerSchema.parse(input);
 const clients=new Set(data.clients.map(x=>x.id)), projects=new Set(data.projects.map(x=>x.id)), invoices=new Set(data.invoices.map(x=>x.id));
 for(const rows of Object.values(data)) { if(new Set(rows.map(x=>x.id)).size!==rows.length) throw new Error("Duplicate record IDs in backup."); }
 if(data.projects.some(x=>x.clientId&&!clients.has(x.clientId)) || data.payments.some(x=>(x.projectId&&!projects.has(x.projectId))||(x.invoiceId&&!invoices.has(x.invoiceId))) || data.expenses.some(x=>x.projectId&&!projects.has(x.projectId)) || data.invoiceItems.some(x=>!invoices.has(x.invoiceId))) throw new Error("Backup contains missing related records.");
 return data;
}