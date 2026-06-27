"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
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
import { Loader2, UserPlus, Info, Camera, X } from "lucide-react"
import { useFirestore, useUser, useStorage } from "@/firebase"
import { doc, setDoc } from "firebase/firestore"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import Image from "next/image"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  email: z.string().email("Valid email is required."),
  ageBracket: z.enum(["6-9", "10-12", "13-15", "16-18", "18+"]),
  levelOfStudies: z.string().min(2, "Level of studies is required."),
  profilePicture: z.any().refine((file) => file && file.length > 0, "A profile picture is required."),
})

interface AddStudentDialogProps {
  schoolId: string;
  institutionType: string;
}

export function AddStudentDialog({ schoolId, institutionType }: AddStudentDialogProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const { user: supervisor } = useUser()
  const firestore = useFirestore()
  const storage = useStorage()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      ageBracket: "13-15",
      levelOfStudies: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore || !supervisor || !storage) return;

    try {
      const studentId = `pupil_${Date.now()}`;
      
      let finalProfilePicture = "";
      const file = values.profilePicture?.[0];
      if (file) {
          const storageRef = ref(storage, `profile-pictures/${studentId}`);
          const snapshot = await uploadBytes(storageRef, file);
          finalProfilePicture = await getDownloadURL(snapshot.ref);
      }

      const pupilProfile = {
        id: studentId,
        fullName: values.fullName,
        email: values.email,
        ageBracket: values.ageBracket,
        levelOfStudies: values.levelOfStudies,
        profilePicture: finalProfilePicture,
        schoolId,
        institutionType,
        institutionRole: 'Pupil',
        supervisorId: supervisor.uid,
        approved: true,
        followers: 0,
        bio: `Pupil at institution. Supervised by ${supervisor.displayName || 'a Patron'}.`,
      };

      await setDoc(doc(firestore, 'users', studentId), pupilProfile);

      toast({
        title: "Pupil Pre-registered!",
        description: `${values.fullName} has been added to your institution list.`,
      })
      setOpen(false)
      form.reset()
      setPreviewUrl(null)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to add student",
        description: error.message,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" /> Add Student
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Register a New Pupil</DialogTitle>
          <DialogDescription>
            Add a student to your institution. They will be able to showcase projects under your supervision.
          </DialogDescription>
        </DialogHeader>
        
        <Alert className="bg-primary/5">
            <Info className="h-4 w-4" />
            <AlertTitle>Supervisor Action</AlertTitle>
            <AlertDescription className="text-xs">
                As a Supervisor, you are pre-registering this student. All innovators MUST have a verified profile picture.
            </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="flex justify-center">
                <FormField
                    control={form.control}
                    name="profilePicture"
                    render={({ field: { onChange, value, ...rest } }) => (
                        <FormItem className="text-center">
                            <FormLabel className="text-xs font-bold text-primary">Required: Student Profile Photo</FormLabel>
                            <div className={cn(
                                "relative h-24 w-24 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden bg-muted mx-auto",
                                previewUrl ? "border-primary" : "border-primary/50"
                            )}>
                                {previewUrl ? (
                                    <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <Camera className="h-6 w-6 text-muted-foreground" />
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
                                    className="h-5 w-5 absolute -mt-24 ml-20 rounded-full"
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

            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Alice Wonder" {...field} />
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
                  <FormLabel>Student Email</FormLabel>
                  <FormControl>
                    <Input placeholder="alice@school.edu" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="ageBracket"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Age Bracket</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select age" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="6-9">6-9</SelectItem>
                            <SelectItem value="10-12">10-12</SelectItem>
                            <SelectItem value="13-15">13-15</SelectItem>
                            <SelectItem value="16-18">16-18</SelectItem>
                            <SelectItem value="18+">18+</SelectItem>
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
                    <FormLabel>Level of Study</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g. Senior 2" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Register Pupil
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
