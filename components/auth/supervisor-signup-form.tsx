
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
import { Loader2, Camera, X, Globe } from "lucide-react"
import { useAuth, useFirestore, useCollection, useMemoFirebase, useStorage } from "@/firebase"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc, collection, query } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import type { School } from "@/lib/types"
import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  schoolId: z.string().min(1, { message: "Please select your institution." }),
  homeCountry: z.string().default('Uganda'),
  personalContacts: z.string().min(2, { message: "Contact is required." }),
  profilePicture: z.any().refine((file) => file && file.length > 0, "A profile picture is required."),
})

export function SupervisorSignUpForm() {
    const { toast } = useToast()
    const auth = useAuth();
    const firestore = useFirestore();
    const storage = useStorage();
    const router = useRouter();
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const schoolsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'schools')) : null, [firestore]);
    const { data: schools } = useCollection<School>(schoolsQuery);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            schoolId: "",
            homeCountry: "Uganda",
            personalContacts: "",
        },
    })

    const { isSubmitting } = form.formState

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!firestore || !storage) {
            toast({ variant: "destructive", title: "Error", description: "Database error." });
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

            const selectedSchool = schools?.find(s => s.id === values.schoolId);

            const profile = {
                id: user.uid,
                fullName: values.fullName,
                email: values.email,
                schoolId: values.schoolId,
                homeCountry: values.homeCountry,
                institutionRole: 'Patron',
                institutionType: selectedSchool?.type || 'Secondary Institution',
                personalContacts: values.personalContacts,
                profilePicture: finalProfilePicture,
                bio: `Supervisor at ${selectedSchool?.name || 'an institution'}`,
                approved: true,
                followers: 0,
            };
            
            await setDoc(doc(firestore, 'users', user.uid), profile);

            toast({
                title: "Patron Account Created!",
                description: "Welcome! Your verified account is ready.",
            })
            router.push('/school/dashboard');
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex justify-center mb-6">
                    <FormField
                        control={form.control}
                        name="profilePicture"
                        render={({ field: { onChange, value, ...rest } }) => (
                            <FormItem className="text-center">
                                <FormLabel className="mb-2 block font-bold text-primary">Required: Your Profile Photo</FormLabel>
                                <div className={cn(
                                    "relative h-32 w-32 rounded-full border-4 border-dashed flex items-center justify-center overflow-hidden bg-muted transition-colors",
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
                        name="fullName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Mr. John Doe" {...field} />
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
                            <FormLabel>Work Email</FormLabel>
                            <FormControl>
                                <Input placeholder="john@school.edu" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="schoolId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Select Your Institution</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a school..." />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {schools?.map(school => (
                                        <SelectItem key={school.id} value={school.id}>
                                            {school.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="personalContacts"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Contact Info</FormLabel>
                            <FormControl>
                                <Input placeholder="Phone number" {...field} />
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
                    Register as Patron
                </Button>
            </form>
        </Form>
    )
}
