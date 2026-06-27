"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Lock, X, Camera, Languages, Globe } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useAuth, useFirestore, useStorage } from "@/firebase"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, arrayUnion, writeBatch } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { useRouter } from "next/navigation"
import { Textarea } from "../ui/textarea"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  accountType: z.enum(['Individual', 'Pupil']).default('Individual'),
  language: z.string().default('en'),
  homeCountry: z.string().default('Uganda'),
  homeAddress: z.string().min(2, { message: "Location is required." }),
  personalContacts: z.string().min(2, { message: "Contact is required." }),
  profilePicture: z.any().refine((file) => file && file.length > 0, "A profile picture is required to identify your account."),
  bio: z.string().min(10, { message: "Please tell us a little about yourself (at least 10 characters)." }),
  levelOfStudies: z.string().optional(),
  ageBracket: z.enum(["6-9", "10-12", "13-15", "16-18", "18+"]).optional(),
  institutionType: z.enum(['Primary Institution', 'Secondary Institution', 'Tertiary Institution']).optional(),
}).refine((data) => {
    if (data.accountType === 'Pupil') {
        return !!data.levelOfStudies && data.levelOfStudies.trim() !== '' && !!data.ageBracket && !!data.institutionType;
    }
    return true;
}, {
    message: 'Level of studies, age bracket, and institution category are required for Pupil accounts.',
    path: ['ageBracket'], 
});

export function SignUpForm() {
    const { toast } = useToast()
    const auth = useAuth();
    const firestore = useFirestore();
    const storage = useStorage();
    const router = useRouter();
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            accountType: "Individual",
            language: "en",
            homeCountry: "Uganda",
            homeAddress: "",
            personalContacts: "",
            bio: "",
            institutionType: "Secondary Institution",
        },
    });

    const { isSubmitting } = form.formState;
    const accountType = form.watch('accountType');

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!firestore || !storage) {
             toast({
                variant: "destructive",
                title: "Sign Up Failed",
                description: "Database connection refused. Try again.",
            });
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredential.user;

            let finalProfilePicture = "";
            const file = values.profilePicture?.[0];
            
            if (file) {
                const storageRef = ref(storage, `profile-pictures/${user.uid}`);
                const snapshot = await uploadBytes(storageRef, file);
                finalProfilePicture = await getDownloadURL(snapshot.ref);
            }

            const batch = writeBatch(firestore);

            const userProfile: any = {
                id: user.uid,
                email: values.email,
                fullName: values.fullName,
                institutionRole: values.accountType === 'Pupil' ? 'Pupil' : 'Patron',
                institutionType: values.accountType === 'Pupil' ? (values.institutionType || 'Secondary Institution') : 'Individual',
                homeAddress: values.homeAddress,
                personalContacts: values.personalContacts,
                bio: values.bio,
                profilePicture: finalProfilePicture,
                interestInInnovation: values.bio,
                language: values.language,
                homeCountry: values.homeCountry,
                approved: true,
                followers: 0,
                createdAt: new Date(),
            };

            if (values.accountType === 'Pupil') {
                userProfile.levelOfStudies = values.levelOfStudies;
                userProfile.ageBracket = values.ageBracket;
            }
            
            const userDocRef = doc(firestore, 'users', user.uid);
            batch.set(userDocRef, userProfile, { merge: true });

            // Add user to general chat
            const generalChatRef = doc(firestore, 'chatRooms', 'general');
            batch.update(generalChatRef, {
                userIds: arrayUnion(user.uid)
            });

            await batch.commit();

            toast({
                title: "Welcome to the Hub!",
                description: "Your account is now verified and active.",
            })
            router.push('/ai-hub');
        } catch (error: any) {
             console.error("[SIGNUP ERROR]", error.code);
             let title = "Registration Refused";
             let message = error.message;

             if (error.code === 'auth/operation-not-allowed') {
                title = "Provider Missing";
                message = "CRITICAL: You must enable 'Email/Password' in the Firebase Console > Authentication > Sign-in method tab.";
             } else if (error.code === 'auth/unauthorized-domain') {
                title = "Domain Blocked";
                message = "CRITICAL: Your current website domain is not authorized. Go to Firebase Console > Authentication > Settings > Authorized domains and add this URL.";
             } else if (error.code === 'auth/email-already-in-use') {
                message = "This innovator email is already registered. Please log in.";
             }

             toast({
                variant: "destructive",
                title: title,
                description: message,
            })
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 <FormField
                    control={form.control}
                    name="accountType"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel>Account Type</FormLabel>
                            <FormControl>
                                <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-1"
                                >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                    <RadioGroupItem value="Individual" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                    Individual / Solo Innovator (Independent)
                                    </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                    <RadioGroupItem value="Pupil" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                    Pupil / Student (Requires School Info)
                                    </FormLabel>
                                </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {accountType === 'Individual' && (
                    <Alert className="bg-primary/5">
                        <Lock className="h-4 w-4 text-primary" />
                        <AlertTitle>Independent Account</AlertTitle>
                        <AlertDescription className="text-xs">
                            Individual accounts are managed by you only. Your location and contacts remain private.
                        </AlertDescription>
                    </Alert>
                )}

                <div className="flex justify-center mb-6">
                    <FormField
                        control={form.control}
                        name="profilePicture"
                        render={({ field: { onChange, value, ...rest } }) => (
                            <FormItem className="text-center">
                                <FormLabel className="mb-2 block font-bold text-primary">Required: Your Profile Photo</FormLabel>
                                <div className="relative group mx-auto">
                                    <div className={cn(
                                        "h-32 w-32 rounded-full border-4 border-dashed flex items-center justify-center overflow-hidden bg-muted transition-colors",
                                        previewUrl ? "border-primary" : "border-primary/50"
                                    )}>
                                        {previewUrl ? (
                                            <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <Camera className="h-8 w-8 text-muted-foreground mb-1" />
                                                <span className="text-[10px] text-muted-foreground uppercase font-bold">Select Photo</span>
                                            </div>
                                        )}
                                    </div>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setPreviewUrl(URL.createObjectURL(file));
                                                onChange(e.target.files);
                                            }
                                        }}
                                        {...rest}
                                    />
                                    {previewUrl && (
                                        <Button 
                                            type="button" 
                                            size="icon" 
                                            variant="destructive" 
                                            className="h-6 w-6 absolute top-0 right-0 rounded-full shadow-lg"
                                            onClick={() => {
                                                setPreviewUrl(null);
                                                onChange(undefined);
                                            }}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    )}
                                </div>
                                <FormDescription className="text-[10px] mt-2">
                                    Clear photo required for Lab Verification.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Jane Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="homeCountry"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                    <Globe className="h-3 w-3" /> Home Country
                                </FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Country" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Uganda">Uganda</SelectItem>
                                        <SelectItem value="Kenya">Kenya</SelectItem>
                                        <SelectItem value="Tanzania">Tanzania</SelectItem>
                                        <SelectItem value="Rwanda">Rwanda</SelectItem>
                                        <SelectItem value="Nigeria">Nigeria</SelectItem>
                                        <SelectItem value="South Africa">South Africa</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="jane.doe@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="language"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                    <Languages className="h-3 w-3" /> Preferred Language
                                </FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Language" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="en">English</SelectItem>
                                        <SelectItem value="lg">Luganda</SelectItem>
                                        <SelectItem value="sw">Swahili</SelectItem>
                                        <SelectItem value="es">Español</SelectItem>
                                        <SelectItem value="fr">Français</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                 <FormField
                    control={form.control}
                    name="personalContacts"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Contact Info</FormLabel>
                            <FormControl>
                                <Input placeholder="Your phone or other contact" {...field} />
                            </FormControl>
                            <FormDescription className="text-[10px]">
                                Strictly private for Lab Verification.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="homeAddress"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Location (City/Address)</FormLabel>
                            <FormControl>
                                <Input placeholder="City, Country" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                {accountType === 'Pupil' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="institutionType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Institution Category</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Category" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Primary Institution">Primary</SelectItem>
                                            <SelectItem value="Secondary Institution">Secondary</SelectItem>
                                            <SelectItem value="Tertiary Institution">Tertiary</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="levelOfStudies"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Level of Studies</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Senior 4" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )}

                <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Bio & Interest in Innovation</FormLabel>
                            <FormControl>
                                <Textarea placeholder="What are you building?" {...field} />
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
                            <FormLabel>Security Key (Password)</FormLabel>
                            <FormControl>
                                <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                <Button type="submit" className="w-full h-12 text-lg font-headline font-black uppercase tracking-widest" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Activate Lab Identity'}
                </Button>
            </form>
        </Form>
    )
}
