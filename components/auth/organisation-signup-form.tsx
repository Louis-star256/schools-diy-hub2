
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
import { Loader2, X, Camera, Building2, HeartHandshake } from "lucide-react"
import { useAuth, useFirestore, useStorage } from "@/firebase"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { useRouter } from "next/navigation"
import { Textarea } from "../ui/textarea"
import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Checkbox } from "../ui/checkbox"

const INTEREST_AREAS = [
  "Technology", "Robotics", "Agriculture", "Clean Energy", "Waste Management", "Public Health", "Education Tools", "Manual Crafts"
];

const formSchema = z.object({
  name: z.string().min(2, { message: "Organisation name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  address: z.string().min(5, { message: "Address is required." }),
  contact: z.string().min(5, { message: "Contact information is required." }),
  description: z.string().min(10, { message: "Please provide a short description." }),
  sponsorshipType: z.enum(['Funding', 'Mentorship', 'Partnership']).default('Funding'),
  interestAreas: z.array(z.string()).min(1, "Select at least one area of interest."),
  logoFile: z.any().refine((file) => file && file.length > 0, "An official organisation logo is required."),
})

export function OrganisationSignUpForm() {
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
            address: "",
            contact: "",
            description: "",
            sponsorshipType: "Funding",
            interestAreas: [],
        },
    })

    const { isSubmitting } = form.formState

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!firestore || !storage) {
            toast({ variant: "destructive", title: "Sign Up Failed", description: "Database connection error." });
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
            const orgUser = userCredential.user;

            let finalLogoUrl = "";
            const file = values.logoFile?.[0];
            if (file) {
                const storageRef = ref(storage, `organisation-logos/${orgUser.uid}`);
                const snapshot = await uploadBytes(storageRef, file);
                finalLogoUrl = await getDownloadURL(snapshot.ref);
            }

            const orgProfile = {
                id: orgUser.uid,
                name: values.name,
                email: values.email,
                institutionType: 'Organisation',
                address: values.address,
                contact: values.contact,
                badgeUrl: finalLogoUrl,
                bio: values.description,
                institutionRole: 'Head',
                interestAreas: values.interestAreas,
                sponsorshipType: values.sponsorshipType,
            };
            
            const schoolDocRef = doc(firestore, 'schools', orgUser.uid); 
            await setDoc(schoolDocRef, orgProfile);

            // Create user profile for the org lead
            const userProfile = {
                id: orgUser.uid,
                fullName: values.name,
                email: values.email,
                institutionType: 'Organisation',
                institutionRole: 'Head',
                profilePicture: finalLogoUrl,
                approved: true,
                followers: 0,
                bio: values.description,
                interestAreas: values.interestAreas,
                sponsorshipType: values.sponsorshipType,
            };
            await setDoc(doc(firestore, 'users', orgUser.uid), userProfile);

            toast({
                title: "Venture Registered!",
                description: "Welcome! Your partner account is ready for funding and mentorship.",
            })
            router.push('/login');
        } catch (error: any) {
             toast({
                variant: "destructive",
                title: "Registration Failed",
                description: error.message,
            })
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
                <div className="flex justify-center">
                    <FormField
                        control={form.control}
                        name="logoFile"
                        render={({ field: { onChange, value, ...rest } }) => (
                            <FormItem className="text-center">
                                <FormLabel className="mb-2 block font-bold text-primary uppercase tracking-widest text-[10px]">Official Logo</FormLabel>
                                <div className={cn(
                                    "relative h-32 w-32 rounded-2xl border-4 border-dashed flex items-center justify-center overflow-hidden bg-muted transition-colors",
                                    previewUrl ? "border-primary" : "border-primary/50"
                                )}>
                                    {previewUrl ? (
                                        <Image src={previewUrl} alt="Logo" fill className="object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <Building2 className="h-8 w-8 text-muted-foreground mb-1" />
                                            <span className="text-[10px] text-muted-foreground uppercase font-bold">Upload</span>
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
                                <FormLabel>Firm / Organisation Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Innovate Venture Lab" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Official Work Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="partnerships@org.org" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-4 rounded-xl border p-4 bg-primary/5">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                        <HeartHandshake className="h-4 w-4 text-primary" />
                        Venture Focus
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="sponsorshipType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Primary Sponsorship Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Funding">Financial Funding</SelectItem>
                                            <SelectItem value="Mentorship">Technical Mentorship</SelectItem>
                                            <SelectItem value="Partnership">Corporate Partnership</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    
                    <FormField
                        control={form.control}
                        name="interestAreas"
                        render={() => (
                            <FormItem>
                                <div className="mb-2">
                                    <FormLabel>Areas of Interest</FormLabel>
                                    <p className="text-[10px] text-muted-foreground">Select the innovation sectors you want to support.</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {INTEREST_AREAS.map((area) => (
                                        <FormField
                                            key={area}
                                            control={form.control}
                                            name="interestAreas"
                                            render={({ field }) => {
                                                return (
                                                    <FormItem key={area} className="flex items-center space-x-3 space-y-0">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value?.includes(area)}
                                                                onCheckedChange={(checked) => {
                                                                    return checked
                                                                        ? field.onChange([...field.value, area])
                                                                        : field.onChange(field.value?.filter((value) => value !== area))
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="text-xs font-normal cursor-pointer">{area}</FormLabel>
                                                    </FormItem>
                                                )
                                            }}
                                        />
                                    ))}
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Headquarters Address</FormLabel>
                            <FormControl>
                                <Input placeholder="Street, City, Country" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="contact"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Public Contact Info</FormLabel>
                            <FormControl>
                                <Input placeholder="Phone, Website or Social Link" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>About the Organisation</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Vision mission, and what kind of innovations you are looking for." className="min-h-[100px]" {...field} />
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
                            <FormLabel>Portal Password</FormLabel>
                            <FormControl>
                                <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full h-12 text-lg font-headline shadow-xl shadow-primary/10" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Register Venture Firm
                </Button>
            </form>
        </Form>
    )
}
