import type { Json } from "@/integrations/supabase/types";
import type { LedgerData } from "./ledger-schema";

const tableMap = {clients:"clients",projects:"projects",invoices:"invoices",invoiceItems:"invoice_items",payments:"payments",expenses:"expenses",activity:"activity",assignments:"project_workers"} as const;
const snake:Record<string,string>={clientId:"client_id",projectId:"project_id",invoiceId:"invoice_id",workerId:"worker_id",startDate:"start_date",manualProgress:"manual_progress",clientName:"client_name",clientEmail:"client_email",issueDate:"issue_date",dueDate:"due_date",invitationCategory:"invitation_category",eventDate:"event_date",eventTime:"event_time",eventVenue:"event_venue",invitationMessage:"invitation_message"};
// Empty optional links and dates are stored as NULL; "" is not a valid uuid/date.
const nullWhenEmpty=new Set(["clientId","projectId","invoiceId","deadline","eventDate"]);
export function ledgerChanges(before:LedgerData,after:LedgerData):Json[] {
 const changes:Json[]=[];
 const keys=Object.keys(tableMap) as (keyof typeof tableMap)[];
 for(const key of keys) for(const row of after[key]) {
  if(JSON.stringify(before[key].find(x=>x.id===row.id))===JSON.stringify(row))continue;
  const mapped:Record<string,Json>={};
  for(const [field,value] of Object.entries(row)) {
   if(field==="createdAt")continue;
   const target=key==="activity"&&field==="date"?"created_at":snake[field]??field;
   mapped[target]=(nullWhenEmpty.has(field)&&value==="")?null:value as Json;
  }
  changes.push({table:tableMap[key],operation:"upsert",id:row.id,row:mapped});
 }
 for(const key of [...keys].reverse()) for(const row of before[key]) if(!after[key].some(x=>x.id===row.id))changes.push({table:tableMap[key],operation:"delete",id:row.id});
 return changes;
}
