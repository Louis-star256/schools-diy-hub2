
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
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Loader2, X, Camera, Globe } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useAuth, useFirestore, useStorage } from "@/firebase"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  name: z.string().min(2, { message: "School name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  institutionType: z.enum(['Primary Institution', 'Secondary Institution', 'Tertiary Institution']),
  homeCountry: z.string().default('Uganda'),
  address: z.string().min(5, { message: "Address is required." }),
  contact: z.string().min(5, { message: "Contact information is required." }),
  badgeFile: z.any().refine((file) => file && file.length > 0, "An official institutional badge or logo is required."),
})

export function SchoolSignUpForm() {
    const { toast } = useToast()
    const auth = useAuth();
    const firestore = useFirestore();
    const storage = useStorage();
    const router = useRouter();
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            institutionType: "Secondary Institution",
            homeCountry: "Uganda",
            address: "",
            contact: "",
        },
    })

    const { isSubmitting } = form.formState

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!firestore || !storage) {
            toast({ variant: "destructive", title: "Sign Up Failed", description: "Storage connection error." });
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
            const schoolUser = userCredential.user;

            let finalBadgeUrl = "";
            const file = values.badgeFile?.[0];
            if (file) {
                const storageRef = ref(storage, `school-badges/${schoolUser.uid}`);
                const snapshot = await uploadBytes(storageRef, file);
                finalBadgeUrl = await getDownloadURL(snapshot.ref);
            }

            const schoolProfile = {
                id: schoolUser.uid,
                name: values.name,
                email: values.email,
                homeCountry: values.homeCountry,
                institutionType: values.institutionType,
                address: values.address,
                contact: values.contact,
                badgeUrl: finalBadgeUrl,
                institutionRole: 'Head',
            };
            
            const schoolDocRef = doc(firestore, 'schools', schoolUser.uid);
            await setDoc(schoolDocRef, schoolProfile);

            // Create a user profile for the head too
            const userProfile = {
                id: schoolUser.uid,
                fullName: `Head of ${values.name}`,
                email: values.email,
                schoolId: schoolUser.uid,
                homeCountry: values.homeCountry,
                institutionRole: 'Head',
                institutionType: values.institutionType,
                profilePicture: finalBadgeUrl,
                approved: true,
                followers: 0,
                bio: `Administrator for ${values.name} in ${values.homeCountry}`,
            };
            await setDoc(doc(firestore, 'users', schoolUser.uid), userProfile);

            toast({
                title: "School Account Created!",
                description: "Your institution has been registered. You can now log in.",
            })
            router.push('/login');
        } catch (error: any) {
             toast({
                variant: "destructive",
                title: "Sign Up Failed",
                description: error.message,
            })
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <div className="flex flex-col items-center gap-4 mb-4">
                    <FormField
                        control={form.control}
                        name="badgeFile"
                        render={({ field: { onChange, value, ...rest } }) => (
                            <FormItem className="text-center">
                                <FormLabel className="mb-2 block font-bold text-primary">Required: Official Institutional Badge</FormLabel>
                                <div className={cn(
                                    "relative h-32 w-32 rounded-lg border-4 border-dashed flex items-center justify-center overflow-hidden bg-muted transition-colors",
                                    previewUrl ? "border-primary" : "border-primary/50"
                                )}>
                                    {previewUrl ? (
                                        <Image src={previewUrl} alt="Badge" fill className="object-contain" />
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <Camera className="h-8 w-8 text-muted-foreground mb-1" />
                                            <span className="text-[10px] text-muted-foreground uppercase font-bold">Select Badge</span>
                                        </div>
                                    )}
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
                                </div>
                                {previewUrl && (
                                    <Button 
                                        type="button" 
                                        size="icon" 
                                        variant="destructive" 
                                        className="h-6 w-6 absolute -mt-32 ml-28 rounded-full shadow-lg"
                                        onClick={() => {
                                            setPreviewUrl(null);
                                            onChange(undefined);
                                        }}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>School Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Springfield High" {...field} />
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
                                <FormLabel className="flex items-center gap-2"><Globe className="h-3 w-3" /> Home Country</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Country" />
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
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>School Email</FormLabel>
                            <FormControl>
                                <Input placeholder="contact@springfieldhigh.edu" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>School Address</FormLabel>
                            <FormControl>
                                <Input placeholder="123 Education Lane, City" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="contact"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Contact Info</FormLabel>
                                <FormControl>
                                    <Input placeholder="Phone number or email" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="institutionType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Institution Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Primary Institution">Primary Institution</SelectItem>
                                        <SelectItem value="Secondary Institution">Secondary Institution</SelectItem>
                                        <SelectItem value="Tertiary Institution">Tertiary Institution</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                 <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full h-12 text-lg font-headline" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create School Account
                </Button>
            </form>
        </Form>
    )
}
