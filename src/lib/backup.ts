import {validateBackup,type LedgerData} from "./ledger-schema";
export function mergeBackup(current:LedgerData,input:unknown){
 const incoming=validateBackup(input);const merged={...current};
 const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
 const legacyId=(entity:string,id:string)=>{let hash=2166136261;for(const ch of entity+":"+id)hash=Math.imul(hash^ch.charCodeAt(0),16777619);const h=(hash>>>0).toString(16).padStart(8,"0");return `${h}-0000-4000-8000-${h}0000`;};
 const mapped=(entity:string,id:string)=>uuid.test(id)?id:legacyId(entity,id);
 for(const key of Object.keys(current) as (keyof LedgerData)[]){const rows=incoming[key].map(row=>{const out:Record<string,unknown>={...row,id:mapped(key,row.id)};for(const [field,entity] of [["clientId","clients"],["projectId","projects"],["invoiceId","invoices"],["workerId","workers"]] as const){const value=out[field];if(typeof value==="string"&&value)out[field]=mapped(entity,value);}return out;});const existing=new Set(current[key].map(x=>x.id));(merged[key] as unknown[])= [...current[key],...rows.filter(x=>!existing.has(String(x["id"])))];}
 return validateBackup(merged);
}