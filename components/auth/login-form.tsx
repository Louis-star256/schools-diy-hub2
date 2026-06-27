"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Eye, EyeOff, Languages, Globe, ShieldCheck, AlertCircle } from "lucide-react"
import { useAuth, useFirestore } from "@/firebase"
import { signInWithEmailAndPassword } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { User as UserProfile } from "@/lib/types"

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  language: z.string().default('en'),
  homeCountry: z.string().default('Uganda'),
})

export function LoginForm() {
    const { toast } = useToast()
    const auth = useAuth();
    const firestore = useFirestore();
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [currentHostname, setCurrentHostname] = useState("");

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setCurrentHostname(window.location.hostname);
        }
    }, []);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
            language: "en",
            homeCountry: "Uganda",
        },
    })

    const { isSubmitting } = form.formState

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredential.user;

            if (firestore) {
                const userRef = doc(firestore, 'users', user.uid);
                const userSnap = await getDoc(userRef);
                
                if (!userSnap.exists()) {
                    await setDoc(userRef, {
                        id: user.uid,
                        email: user.email,
                        fullName: user.displayName || 'Hub Innovator',
                        institutionType: 'Individual',
                        institutionRole: 'Pupil',
                        language: values.language,
                        homeCountry: values.homeCountry,
                        approved: true,
                        followers: 0,
                        bio: 'Innovation laboratory member.',
                    }, { merge: true });
                }

                const profileSnap = await getDoc(userRef);
                const profile = profileSnap.data() as UserProfile;
                
                if (profile?.institutionRole === 'Head' || profile?.institutionRole === 'Patron') {
                    toast({ title: "Authority Verified", description: "Admin laboratory portal initialized." });
                    router.push('/school/dashboard');
                    return;
                }

                if (profile?.institutionType === 'Organisation') {
                    toast({ title: "Partner Verified", description: "Venture portal initialized." });
                    router.push('/sponsor/dashboard');
                    return;
                }
            }

            toast({ title: "Authorization Success", description: `Welcome back to your laboratory.` });
            router.push('/ai-hub');
        } catch (error: any) {
            console.error("[LOGIN ERROR]", error.code, error.message);
            let title = "Login Refused";
            let message = `Diagnostic Code: ${error.code}. Check your security key or authorized domains.`;

            if (error.code === 'auth/operation-not-allowed') {
                title = "Provider Disabled";
                message = "CRITICAL: Ensure 'Email/Password' is active in Firebase Console > Authentication > Providers.";
            } else if (error.code === 'auth/unauthorized-domain') {
                title = "Domain Not Authorized";
                message = `Your current domain (${currentHostname}) is not in the 'Authorized domains' list in Firebase Settings.`;
            } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                message = "Invalid email or security key. Please check your credentials.";
            } else if (error.code === 'auth/network-request-failed') {
                message = "Network connection unstable. Retrying synchronization...";
            }
            
            toast({ variant: "destructive", title: title, description: message });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="language"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary"><Languages className="h-3 w-3" /> Language</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="h-10 bg-white/5 border-white/10 rounded-xl text-white">
                                            <SelectValue placeholder="Language" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-[#0B0F19] border-white/10 text-white">
                                        <SelectItem value="en">English</SelectItem>
                                        <SelectItem value="lg">Luganda</SelectItem>
                                        <SelectItem value="sw">Swahili</SelectItem>
                                        <SelectItem value="es">Español</SelectItem>
                                        <SelectItem value="fr">Français</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="homeCountry"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary"><Globe className="h-3 w-3" /> Country</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="h-10 bg-white/5 border-white/10 rounded-xl text-white">
                                            <SelectValue placeholder="Country" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-[#0B0F19] border-white/10 text-white">
                                        <SelectItem value="Uganda">Uganda</SelectItem>
                                        <SelectItem value="Kenya">Kenya</SelectItem>
                                        <SelectItem value="Nigeria">Nigeria</SelectItem>
                                        <SelectItem value="South Africa">South Africa</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Innovator Email</FormLabel>
                            <FormControl>
                                <Input placeholder="m@example.com" className="h-12 bg-white/5 border-white/10 rounded-xl text-white" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Security Key</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input 
                                        type={showPassword ? "text" : "password"} 
                                        {...field} 
                                        className="pr-10 h-12 bg-white/5 border-white/10 rounded-xl text-white"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full h-14 text-lg font-headline font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-primary/20" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
                    Authorize Access
                </Button>
                
                <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <p className="text-[10px] text-white font-black uppercase tracking-widest">Diagnostic Report</p>
                        <div className="text-[10px] text-muted-foreground font-bold leading-tight space-y-1">
                            <p>Project ID: <span className="text-white">studio-1216835987-c72bd</span></p>
                            <p className="text-primary font-black">Authorized Hostname: {currentHostname}</p>
                            <p>Paste the blue hostname above into your Firebase 'Authorized domains' list.</p>
                        </div>
                    </div>
                </div>
            </form>
        </Form>
    )
}
