import { createContext,useContext,useEffect,useState,type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/integrations/supabase/types";
const Ctx=createContext<{session:Session|null;ready:boolean;profile:Tables<"profiles">|null;avatar:string;refresh:()=>Promise<void>}>({session:null,ready:false,profile:null,avatar:"",refresh:async()=>{}});
export function AuthProvider({children}:{children:ReactNode}) {
 const [session,setSession]=useState<Session|null>(null),[ready,setReady]=useState(false),[profile,setProfile]=useState<Tables<"profiles">|null>(null),[avatar,setAvatar]=useState("");
 async function refresh(){const {data:{user}}=await supabase.auth.getUser(); if(!user){setProfile(null);setAvatar("");return;} const {data,error}=await supabase.from("profiles").select("*").eq("id",user.id).single(); if(error)throw error; setProfile(data); if(data.avatar_path){const result=await supabase.storage.from("avatars").createSignedUrl(data.avatar_path,3600);setAvatar(result.data?.signedUrl??"");}else setAvatar("");}
 useEffect(()=>{supabase.auth.getSession().then(({data})=>{setSession(data.session);setReady(true);});const {data:{subscription}}=supabase.auth.onAuthStateChange((event,next)=>{if(["SIGNED_IN","SIGNED_OUT","USER_UPDATED"].includes(event))setSession(next);});return()=>subscription.unsubscribe();},[]);
 useEffect(()=>{void refresh().catch(()=>setProfile(null));},[session?.user.id]);
 return <Ctx.Provider value={{session,ready,profile,avatar,refresh}}>{children}</Ctx.Provider>;
}
export const useAuth=()=>useContext(Ctx);
export function SignInPanel(){const [email,setEmail]=useState(""),[password,setPassword]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false);return <div className="mx-auto max-w-md py-16"><h1 className="text-3xl font-semibold">SainoX Dashboard</h1><h2 className="mt-8 text-xl">Sign in</h2><form className="mt-5 space-y-4" onSubmit={async e=>{e.preventDefault();setBusy(true);const {error}=await supabase.auth.signInWithPassword({email,password});setError(error?.message??"");setBusy(false);}}><Input aria-label="Email" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/><Input aria-label="Password" type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}/>{error&&<p role="alert" className="text-danger text-sm">{error}</p>}<Button disabled={busy} className="w-full">{busy?"Signing in…":"Sign in"}</Button></form></div>;}