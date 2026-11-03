import { useContext,useEffect,useState,type ReactNode } from "react";
import { AuthContext } from "./contexts";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/integrations/supabase/types";
import logo from "@/assets/sainox-logo.png.asset.json";
export function AuthProvider({children}:{children:ReactNode}) {
 const [session,setSession]=useState<Session|null>(null),[ready,setReady]=useState(false),[profile,setProfile]=useState<Tables<"profiles">|null>(null),[avatar,setAvatar]=useState("");
 async function refresh(){const {data:{user}}=await supabase.auth.getUser(); if(!user){setProfile(null);setAvatar("");return;} const {data,error}=await supabase.from("profiles").select("*").eq("id",user.id).maybeSingle(); if(error)throw error; setProfile(data); if(data?.avatar_path){const result=await supabase.storage.from("avatars").createSignedUrl(data.avatar_path,3600);setAvatar(result.data?.signedUrl??"");}else setAvatar("");}
 useEffect(()=>{supabase.auth.getSession().then(({data})=>{setSession(data.session);setReady(true);});const {data:{subscription}}=supabase.auth.onAuthStateChange((event,next)=>{if(["SIGNED_IN","SIGNED_OUT","USER_UPDATED","PASSWORD_RECOVERY"].includes(event))setSession(next);});return()=>subscription.unsubscribe();},[]);
 useEffect(()=>{void refresh().catch(()=>setProfile(null));},[session?.user.id]);
 return <AuthContext.Provider value={{session,ready,profile,avatar,refresh}}>{children}</AuthContext.Provider>;
}
export const useAuth=()=>useContext(AuthContext);

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
 const title=mode==="signin"?"Welcome back":mode==="signup"?"Create your account":"Reset your password";
 const action=mode==="signin"?"Sign in":mode==="signup"?"Create account":"Send reset link";
 const field="h-11 border-brand-line bg-brand-ink-raised text-brand-cream placeholder:text-brand-cream/40 focus-visible:ring-brand-ember";
 return <div className="fixed inset-0 z-50 overflow-y-auto bg-brand-ink text-brand-cream">
  <div className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-6 py-10">
   <h1 className="sr-only">SainoX Dashboard</h1>
   <div className="animate-brand-rise overflow-hidden">
    <img src={logo.url} alt="sainoX" className="mask-soft-edges mx-auto aspect-[12/5] w-full max-w-sm object-cover object-[center_52%]"/>
   </div>
   <p className="mt-1 text-center text-[11px] uppercase tracking-[0.35em] text-brand-cream/60 animate-brand-rise">Dashboard · Create with purpose</p>
   <div className="mt-8 rounded-2xl border border-brand-line bg-brand-ink-raised/60 p-6 shadow-brand animate-brand-rise sm:p-8" style={{animationDelay:"120ms"}}>
    <h2 className="font-brand text-2xl tracking-wide">{title}</h2>
    <div className="brand-divider mt-3 w-24"/>
    {mode==="reset"&&<p className="mt-3 text-sm text-brand-cream/60">Enter your email and we'll send you a link to choose a new password.</p>}
    <form className="mt-6 space-y-4" onSubmit={e=>{e.preventDefault();void submit();}}>
     <Input aria-label="Email" type="email" placeholder="Email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} className={field}/>
     {mode!=="reset"&&<Input aria-label="Password" type="password" placeholder="Password" autoComplete={mode==="signup"?"new-password":"current-password"} required minLength={mode==="signup"?8:undefined} value={password} onChange={e=>setPassword(e.target.value)} className={field}/>}
     {error&&<p role="alert" className="text-sm text-brand-flame">{error}</p>}
     {notice&&<p role="status" className="text-sm text-brand-cream/80">{notice}</p>}
     <Button variant="brand" size="lg" disabled={busy} className="w-full">{busy?"Please wait…":action}</Button>
    </form>
    <div className="mt-5 flex flex-wrap justify-between gap-2 text-sm">
     {mode==="signin"?<>
      <Button type="button" variant="brand-link" className="h-auto px-0" onClick={()=>switchTo("signup")}>Create an account</Button>
      <Button type="button" variant="brand-link" className="h-auto px-0" onClick={()=>switchTo("reset")}>Forgot password?</Button>
     </>:<Button type="button" variant="brand-link" className="h-auto px-0" onClick={()=>switchTo("signin")}>Back to sign in</Button>}
    </div>
   </div>
  </div>
 </div>;
}
