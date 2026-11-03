import {useState} from "react";
import {Camera, Trash2} from "lucide-react";
import {useAuth} from "@/lib/auth";
import {supabase} from "@/integrations/supabase/client";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";

export function ProfileSettings() {
 const {session,profile,avatar,refresh}=useAuth();
 const [name,setName]=useState<string|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(""),[message,setMessage]=useState("");
 async function save(change:{display_name?:string;avatar_path?:string|null}) {
  if(!session)throw new Error("Sign in to update your profile.");
  const result=await supabase.from("profiles").upsert({id:session.user.id,...change}).select("id").single();
  if(result.error)throw new Error(result.error.message);
 }
 async function run(action:()=>Promise<void>) {
  setBusy(true);setError("");setMessage("");
  try {await action();await refresh();setMessage("Profile saved.");}
  catch(e){setError(e instanceof Error?e.message:"Could not save your profile.");}
  finally {setBusy(false);}
 }
 async function upload(file:File) {
  if(!session)return;
  if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>5*1024*1024){setError("Choose a JPEG, PNG or WebP image up to 5 MB.");return;}
  await run(async()=>{
   const path=`${session.user.id}/${crypto.randomUUID()}`;
   const result=await supabase.storage.from("avatars").upload(path,file,{contentType:file.type});
   if(result.error)throw new Error(result.error.message);
   try {await save({avatar_path:path});}
   catch(e){await supabase.storage.from("avatars").remove([path]);throw e;}
   if(profile?.avatar_path){const cleanup=await supabase.storage.from("avatars").remove([profile.avatar_path]);if(cleanup.error)throw new Error("New photo saved, but the old photo could not be removed. Please retry removal.");}
  });
 }
 return <div className="space-y-4">
  <div className="flex flex-wrap items-center gap-4">
   <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-xl font-semibold text-primary">{avatar?<img src={avatar} alt="Your profile photo" className="h-full w-full object-cover"/>:(profile?.display_name||session?.user.email||"?").slice(0,2).toUpperCase()}</span>
   <div className="space-y-2"><label className="grid gap-2 text-sm"><span className="flex items-center gap-2"><Camera className="h-4 w-4"/>Profile photo</span><Input aria-label="Upload profile photo" type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e=>{const file=e.target.files?.[0];e.target.value="";if(file)void upload(file);}}/></label>
   {profile?.avatar_path&&<Button variant="ghost" size="sm" disabled={busy} onClick={()=>void run(async()=>{const path=profile.avatar_path;if(!path)return;await save({avatar_path:null});const result=await supabase.storage.from("avatars").remove([path]);if(result.error)throw new Error(result.error.message);})}><Trash2 className="h-4 w-4"/>Remove photo</Button>}</div>
  </div>
  <label className="grid max-w-sm gap-2 text-sm">Display name<Input value={name??profile?.display_name??""} maxLength={100} onChange={e=>setName(e.target.value)}/></label>
  <p className="text-sm text-muted-foreground">{session?.user.email}</p>
  <Button disabled={busy} onClick={()=>void run(()=>save({display_name:(name??profile?.display_name??"").trim()}))}>Save profile</Button>
  {busy&&<p role="status" className="text-sm text-muted-foreground">Saving profile…</p>}
  {message&&<p role="status" className="text-sm text-success">{message}</p>}
  {error&&<p role="alert" className="text-sm text-danger">{error}</p>}
 </div>;
}