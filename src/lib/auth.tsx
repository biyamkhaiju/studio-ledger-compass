import { createContext,useContext,useEffect,useState,type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/integrations/supabase/types";
const Ctx=createContext<{session:Session|null;ready:boolean;profile:Tables<"profiles">|null;avatar:string;refresh:()=>Promise<void>}>({session:null,ready:false,profile:null,avatar:"",refresh:async()=>{}});
export function AuthProvider({children}:{children:ReactNode}) {
 const [session,setSession]=useState<Session|null>(null),[ready,setReady]=useState(false),[profile,setProfile]=useState<Tables<"profiles">|null>(null),[avatar,setAvatar]=useState("");
 async function refresh(){const {data:{user}}=await supabase.auth.getUser(); if(!user){setProfile(null);setAvatar("");return;} const {data,error}=await supabase.from("profiles").select("*").eq("id",user.id).maybeSingle(); if(error)throw error; setProfile(data); if(data?.avatar_path){const result=await supabase.storage.from("avatars").createSignedUrl(data.avatar_path,3600);setAvatar(result.data?.signedUrl??"");}else setAvatar("");}
 useEffect(()=>{supabase.auth.getSession().then(({data})=>{setSession(data.session);setReady(true);});const {data:{subscription}}=supabase.auth.onAuthStateChange((event,next)=>{if(["SIGNED_IN","SIGNED_OUT","USER_UPDATED","PASSWORD_RECOVERY"].includes(event))setSession(next);});return()=>subscription.unsubscribe();},[]);
 useEffect(()=>{void refresh().catch(()=>setProfile(null));},[session?.user.id]);
 return <Ctx.Provider value={{session,ready,profile,avatar,refresh}}>{children}</Ctx.Provider>;
}
export const useAuth=()=>useContext(Ctx);

type Mode="signin"|"signup"|"reset";
export function SignInPanel(){
 const [mode,setMode]=useState<Mode>("signin"),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[error,setError]=useState(""),[notice,setNotice]=useState(""),[busy,setBusy]=useState(false);
 const switchTo=(next:Mode)=>{setMode(next);setError("");setNotice("");};
 async function submit(){
  setBusy(true);setError("");setNotice("");
  try{
   if(mode==="signin"){const {error}=await supabase.auth.signInWithPassword({email:email.trim(),password});if(error)throw error;}
   else if(mode==="signup"){
    if(password.length<8)throw new Error("Use at least 8 characters for your password.");
    const {data,error}=await supabase.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:window.location.origin}});
    if(error)throw error;
    if(!data.session)setNotice("Check your inbox and click the confirmation link, then sign in.");
   } else {
    const {error}=await supabase.auth.resetPasswordForEmail(email.trim(),{redirectTo:`${window.location.origin}/reset-password`});
    if(error)throw error;
    setNotice("If an account exists for this email, a link to set a new password is on its way.");
   }
  }catch(e){setError(e instanceof Error?e.message:"Something went wrong. Please retry.");}
  finally{setBusy(false);}
 }
 const title=mode==="signin"?"Sign in":mode==="signup"?"Create account":"Reset password";
 const action=mode==="signin"?"Sign in":mode==="signup"?"Create account":"Send reset link";
 return <div className="mx-auto max-w-md py-16">
  <h1 className="text-3xl font-semibold">SainoX Dashboard</h1>
  <h2 className="mt-8 text-xl">{title}</h2>
  {mode==="reset"&&<p className="mt-2 text-sm text-muted-foreground">Enter your email and we'll send you a link to choose a new password.</p>}
  <form className="mt-5 space-y-4" onSubmit={e=>{e.preventDefault();void submit();}}>
   <Input aria-label="Email" type="email" placeholder="Email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/>
   {mode!=="reset"&&<Input aria-label="Password" type="password" placeholder="Password" autoComplete={mode==="signup"?"new-password":"current-password"} required minLength={mode==="signup"?8:undefined} value={password} onChange={e=>setPassword(e.target.value)}/>}
   {error&&<p role="alert" className="text-danger text-sm">{error}</p>}
   {notice&&<p role="status" className="text-success text-sm">{notice}</p>}
   <Button disabled={busy} className="w-full">{busy?"Please wait…":action}</Button>
  </form>
  <div className="mt-4 flex flex-wrap justify-between gap-2 text-sm">
   {mode==="signin"?<>
    <Button type="button" variant="link" className="px-0" onClick={()=>switchTo("signup")}>Create an account</Button>
    <Button type="button" variant="link" className="px-0" onClick={()=>switchTo("reset")}>Forgot password?</Button>
   </>:<Button type="button" variant="link" className="px-0" onClick={()=>switchTo("signin")}>Back to sign in</Button>}
  </div>
 </div>;
}
