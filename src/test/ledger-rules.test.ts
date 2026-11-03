import {describe,it,expect} from "vitest";
import {emptyLedger,validateBackup,canAssign,invoiceTotal,invoiceStatus} from "@/lib/ledger-schema";
import {mergeBackup} from "@/lib/backup";
import {ledgerChanges} from "@/lib/ledger-changes";

describe("Ledger integrity",()=>{
 it("never overwrites existing records on import",()=>{
  const current=emptyLedger();current.clients=[{id:"00000000-0000-4000-8000-000000000001",name:"Original",kind:"business",email:"",phone:"",location:"",createdAt:"2026-11-03"}];
  const incoming={...current,clients:current.clients.map(c=>({...c,name:"Changed"}))};
  expect(mergeBackup(current,incoming).clients[0]?.name).toBe("Original");
 });
 it("rejects missing project clients",()=>{
  const data=emptyLedger();data.projects=[{id:"project",name:"Project",division:"website",clientId:"missing",status:"planning",budget:0,startDate:"2026-11-03",deadline:"",description:"",milestones:[],manualProgress:0}];
  expect(()=>validateBackup(data)).toThrow("missing related records");
 });
 it("unavailable workers cannot receive assignments",()=>expect(canAssign("unavailable")).toBe(false));
 it("workers on leave cannot receive assignments",()=>expect(canAssign("on_leave")).toBe(false));
 it("working workers can receive assignments",()=>expect(canAssign("working")).toBe(true));
 it("calculates invoice value and partial payments",()=>{
  expect(invoiceTotal([{id:"item",invoiceId:"invoice",description:"Work",quantity:2,rate:1500}])).toBe(3000);
  expect(invoiceStatus(3000,1000,"2026-11-04","2026-11-03")).toBe("Partially paid");
 });
 it("detaches retained payments before deleting invoices",()=>{
  const before=emptyLedger();before.invoices=[{id:"invoice",projectId:null,clientId:null,number:"1",clientName:"Client",clientEmail:"",issueDate:"2026-11-03",dueDate:"2026-11-04",notes:""}];before.payments=[{id:"payment",projectId:"",invoiceId:"invoice",amount:100,date:"2026-11-03",note:""}];
  const after={...before,invoices:[],payments:before.payments.map(p=>({...p,invoiceId:null}))};
  expect(ledgerChanges(before,after).map(c=>(c as {table:string}).table)).toEqual(["payments","invoices"]);
 });
 it("creates invoices before related payments",()=>{
  const after=emptyLedger();after.invoices=[{id:"invoice",projectId:null,clientId:null,number:"1",clientName:"Client",clientEmail:"",issueDate:"2026-11-03",dueDate:"2026-11-04",notes:""}];after.payments=[{id:"payment",projectId:"",invoiceId:"invoice",amount:100,date:"2026-11-03",note:""}];
  expect(ledgerChanges(emptyLedger(),after).map(c=>(c as {table:string}).table)).toEqual(["invoices","payments"]);
 });
});