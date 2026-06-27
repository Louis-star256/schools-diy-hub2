
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  GraduationCap, 
  DollarSign, 
  ArrowLeft, 
  Loader2, 
  ShieldCheck, 
  Globe, 
  Briefcase,
  Zap,
  Building2,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore, useStorage } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const schoolSchema = z.object({
  institutionName: z.string().min(3, 'Official name is required.'),
  department: z.string().optional(),
  repName: z.string().min(2, 'Representative name is required.'),
  jobTitle: z.string().optional(),
  email: z.string().email('Valid institutional email is required.'),
  password: z.string().min(8, 'Security key must be at least 8 characters.'),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  perks: z.array(z.string()).min(1, 'Select at least one perk.'),
  interests: z.array(z.string()).min(1, 'Select at least one interest.'),
  verificationFile: z.any().refine((f) => f && f.length > 0, 'Proof of affiliation is required.'),
  terms: z.boolean().refine((v) => v === true, 'You must accept the terms.'),
});

const investorSchema = z.object({
  fullName: z.string().min(3, 'Full legal name is required.'),
  jobTitle: z.string().optional(),
  company: z.string().optional(),
  proLink: z.string().url('Invalid URL').optional().or(z.literal('')),
  email: z.string().email('Valid email is required.'),
  password: z.string().min(8, 'Security key must be at least 8 characters.'),
  whatsapp: z.string().min(5, 'WhatsApp number is required.'),
  fundingStyle: z.array(z.string()).min(1, 'Select at least one style.'),
  budgetRange: z.string().min(1, 'Please select a budget range.'),
  verificationFile: z.any().refine((f) => f && f.length > 0, 'Identification is required.'),
  terms: z.boolean().refine((v) => v === true, 'You must accept the terms.'),
});

const PERKS = [
  'Full Academic Scholarships',
  'Direct Admission / University Placements',
  'School-Backed Research Grants',
  'Access to Labs & Machinery',
  'Academic Mentorship'
];

const INTERESTS = [
  'Robotics & Mechatronics',
  'Mechanical Engineering',
  'Software & Artificial Intelligence',
  'Renewable Energy & Agri-Tech',
  'Fine Arts & Industrial Design'
];

const FUNDING_STYLES = [
  'Direct Cash Grants',
  'Equity Investment',
  'Material Supply',
  'Mentorship & Guidance'
];

const BUDGET_RANGES = [
  'Under UGX 1,500,000',
  'UGX 1,500,000 - UGX 7,500,000',
  'UGX 7,500,000 - UGX 35,000,000',
  'Above UGX 35,000,000'
];

export default function FunderRegistrationPage() {
  const [view, setView] = useState<'choice' | 'school' | 'investor'>('choice');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const storage = useStorage();
  const router = useRouter();

  const schoolForm = useForm<z.infer<typeof schoolSchema>>({
    resolver: zodResolver(schoolSchema),
    defaultValues: { perks: [], interests: [], terms: false },
  });

  const investorForm = useForm<z.infer<typeof investorSchema>>({
    resolver: zodResolver(investorSchema),
    defaultValues: { fundingStyle: [], terms: false },
  });

  const handleUpload = async (file: File, userId: string, folder: string) => {
    if (!storage) return '';
    const storageRef = ref(storage, `${folder}/${userId}/${Date.now()}-${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  };

  const onSchoolSubmit = async (values: z.infer<typeof schoolSchema>) => {
    if (!firestore || !storage) return;
    setIsSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      
      const docUrl = await handleUpload(values.verificationFile[0], user.uid, 'funder-verification');

      const profile = {
        id: user.uid,
        fullName: values.institutionName,
        email: values.email,
        institutionType: 'Organisation',
        institutionRole: 'Head',
        representative: values.repName,
        repTitle: values.jobTitle,
        department: values.department,
        website: values.website,
        perks: values.perks,
        interestAreas: values.interests,
        verificationUrl: docUrl,
        approved: false,
        walletBalance: 0,
        followers: 0,
        funderType: 'Academic',
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(firestore, 'users', user.uid), profile);
      
      toast({ title: 'Application Transmitted', description: 'Institutional enrollment is under review by Louis.' });
      router.push('/login');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Transmission Error', description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onInvestorSubmit = async (values: z.infer<typeof investorSchema>) => {
    if (!firestore || !storage) return;
    setIsSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      
      const idUrl = await handleUpload(values.verificationFile[0], user.uid, 'investor-id');

      const profile = {
        id: user.uid,
        fullName: values.fullName,
        email: values.email,
        institutionType: 'Organisation',
        institutionRole: 'Head',
        jobTitle: values.jobTitle,
        company: values.company,
        professionalLink: values.proLink,
        whatsapp: values.whatsapp,
        fundingStyle: values.fundingStyle,
        budgetRange: values.budgetRange,
        verificationUrl: idUrl,
        approved: false,
        walletBalance: 0,
        followers: 0,
        funderType: 'Private',
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(firestore, 'users', user.uid), profile);
      
      toast({ title: 'Venture Key Generated', description: 'Investor identity initialized and under verification.' });
      router.push('/login');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Transmission Error', description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-24 max-w-6xl space-y-12">
      <header className="text-center space-y-4">
        <h1 className="text-5xl md:text-7xl font-bold font-headline tracking-tighter text-white">
          Funder <span className="text-primary italic">Registration</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
          Support Uganda's next generation of innovators, builders, and creators.
        </p>
      </header>

      {view === 'choice' && (
        <div className="grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Card className="rounded-[3rem] border-2 border-white/5 bg-white/[0.03] hover:border-primary/40 transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform">
                <GraduationCap className="h-48 w-48 text-primary" />
            </div>
            <CardHeader className="p-10 space-y-4 relative z-10">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <GraduationCap className="h-8 w-8" />
              </div>
              <CardTitle className="text-4xl font-headline font-black">Academic Institution</CardTitle>
              <CardDescription className="text-lg leading-relaxed">
                Universities, admissions offices, and academic foundations seeking to sponsor, recruit, or mentor talented students.
              </CardDescription>
            </CardHeader>
            <CardFooter className="p-10 pt-0 relative z-10">
              <Button onClick={() => setView('school')} size="xl" className="w-full rounded-full gap-2">
                Register Institution <ArrowLeft className="h-5 w-5 rotate-180" />
              </Button>
            </CardFooter>
          </Card>

          <Card className="rounded-[3rem] border-2 border-white/5 bg-white/[0.03] hover:border-primary/40 transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform">
                <DollarSign className="h-48 w-48 text-primary" />
            </div>
            <CardHeader className="p-10 space-y-4 relative z-10">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <DollarSign className="h-8 w-8" />
              </div>
              <CardTitle className="text-4xl font-headline font-black">Private Investor</CardTitle>
              <CardDescription className="text-lg leading-relaxed">
                Angel investors, diaspora sponsors, and mentors funding projects using personal resources to drive local growth.
              </CardDescription>
            </CardHeader>
            <CardFooter className="p-10 pt-0 relative z-10">
              <Button onClick={() => setView('investor')} size="xl" variant="secondary" className="w-full rounded-full gap-2">
                Register as Investor <ArrowLeft className="h-5 w-5 rotate-180" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {view === 'school' && (
        <Card className="max-w-4xl mx-auto rounded-[3.5rem] bg-[#0A0C14] border-white/10 shadow-2xl animate-in slide-in-from-right-4 duration-500 overflow-hidden">
          <CardHeader className="bg-primary/10 border-b border-white/5 p-10">
            <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center text-black">
                    <ShieldCheck className="h-7 w-7" />
                </div>
                <Button variant="ghost" onClick={() => setView('choice')} className="text-white/40 hover:text-white">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Choice
                </Button>
            </div>
            <CardTitle className="text-4xl font-headline font-black text-white">Secure Institutional Enrollment</CardTitle>
            <CardDescription className="text-primary/60 font-bold uppercase tracking-[0.2em] text-xs">Innovation Partner Protocol v2.0</CardDescription>
          </CardHeader>
          <form onSubmit={schoolForm.handleSubmit(onSchoolSubmit)}>
            <CardContent className="p-10 space-y-10">
                <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase text-primary tracking-[0.3em]">Institution Information</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/60">Official Institution Name</Label>
                            <Input placeholder="e.g., Makerere University" {...schoolForm.register('institutionName')} className="h-12 bg-white/5 border-white/10" />
                            {schoolForm.formState.errors.institutionName && <p className="text-xs text-destructive">{schoolForm.formState.errors.institutionName.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/60">Department or Faculty</Label>
                            <Input placeholder="e.g., College of Engineering" {...schoolForm.register('department')} className="h-12 bg-white/5 border-white/10" />
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/60">Representative Name</Label>
                            <Input placeholder="Authorized official name" {...schoolForm.register('repName')} className="h-12 bg-white/5 border-white/10" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/60">Job Title / Role</Label>
                            <Input placeholder="e.g., Admissions Director" {...schoolForm.register('jobTitle')} className="h-12 bg-white/5 border-white/10" />
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/60">Institutional Email</Label>
                            <Input type="email" placeholder="admin@univ.ac.ug" {...schoolForm.register('email')} className="h-12 bg-white/5 border-white/10" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/60">Portal Security Key</Label>
                            <Input type="password" {...schoolForm.register('password')} className="h-12 bg-white/5 border-white/10" />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase text-primary tracking-[0.3em]">🎓 Perks & Interests</h3>
                    <div className="grid md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase text-white/40">Academic Perks Offered</Label>
                            <div className="space-y-3">
                                {PERKS.map(perk => (
                                    <div key={perk} className="flex items-center space-x-3">
                                        <Controller
                                            name="perks"
                                            control={schoolForm.control}
                                            render={({ field }) => (
                                                <Checkbox 
                                                    id={`perk-${perk}`}
                                                    checked={field.value.includes(perk)}
                                                    onCheckedChange={(checked) => {
                                                        const newVal = checked 
                                                            ? [...field.value, perk]
                                                            : field.value.filter(v => v !== perk);
                                                        field.onChange(newVal);
                                                    }}
                                                />
                                            )}
                                        />
                                        <label htmlFor={`perk-${perk}`} className="text-sm font-medium text-white/80 cursor-pointer">{perk}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase text-white/40">Target Project Interests</Label>
                            <div className="space-y-3">
                                {INTERESTS.map(interest => (
                                    <div key={interest} className="flex items-center space-x-3">
                                        <Controller
                                            name="interests"
                                            control={schoolForm.control}
                                            render={({ field }) => (
                                                <Checkbox 
                                                    id={`interest-${interest}`}
                                                    checked={field.value.includes(interest)}
                                                    onCheckedChange={(checked) => {
                                                        const newVal = checked 
                                                            ? [...field.value, interest]
                                                            : field.value.filter(v => v !== interest);
                                                        field.onChange(newVal);
                                                    }}
                                                />
                                            )}
                                        />
                                        <label htmlFor={`interest-${interest}`} className="text-sm font-medium text-white/80 cursor-pointer">{interest}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6 bg-white/[0.02] p-8 rounded-3xl border border-white/5">
                    <h3 className="text-xs font-black uppercase text-primary tracking-[0.3em]">📜 Verification & Security</h3>
                    <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/60">Proof of Affiliation (ID / Letter)</Label>
                        <Input type="file" {...schoolForm.register('verificationFile')} className="bg-black/40 border-dashed border-2 border-white/10 h-16 pt-4" />
                    </div>
                    <div className="flex items-start space-x-4 pt-4">
                        <Controller
                            name="terms"
                            control={schoolForm.control}
                            render={({ field }) => (
                                <Checkbox 
                                    id="terms-school" 
                                    checked={field.value} 
                                    onCheckedChange={field.onChange} 
                                    className="mt-1"
                                />
                            )}
                        />
                        <label htmlFor="terms-school" className="text-xs text-white/40 leading-relaxed italic">
                            I agree to respect intellectual property rights and not use creator projects without proper authorization. I understand that my institutional profile must be verified by Louis before full portal access.
                        </label>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-10 pt-0">
                <Button disabled={isSubmitting} className="w-full h-20 rounded-3xl text-2xl font-headline font-black uppercase tracking-tighter bg-primary text-black shadow-2xl shadow-primary/30 active:scale-95 transition-all">
                    {isSubmitting ? <Loader2 className="mr-3 h-8 w-8 animate-spin" /> : <ShieldCheck className="mr-3 h-8 w-8" />}
                    Register Academic Funder
                </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {view === 'investor' && (
        <Card className="max-w-4xl mx-auto rounded-[3.5rem] bg-[#0A0C14] border-white/10 shadow-2xl animate-in slide-in-from-left-4 duration-500 overflow-hidden">
          <CardHeader className="bg-primary/10 border-b border-white/5 p-10">
            <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center text-black">
                    <Zap className="h-7 w-7" />
                </div>
                <Button variant="ghost" onClick={() => setView('choice')} className="text-white/40 hover:text-white">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Choice
                </Button>
            </div>
            <CardTitle className="text-4xl font-headline font-black text-white">Private Investor Enrollment</CardTitle>
            <CardDescription className="text-primary/60 font-bold uppercase tracking-[0.2em] text-xs">Venture Access Node v2.0</CardDescription>
          </CardHeader>
          <form onSubmit={investorForm.handleSubmit(onInvestorSubmit)}>
            <CardContent className="p-10 space-y-10">
                <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase text-primary tracking-[0.3em]">Personal Information</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/60">Full Legal Name</Label>
                            <Input placeholder="Your full identity" {...investorForm.register('fullName')} className="h-12 bg-white/5 border-white/10" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/60">Profession / Job Title</Label>
                            <Input placeholder="e.g., Venture Partner" {...investorForm.register('jobTitle')} className="h-12 bg-white/5 border-white/10" />
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/60">Email Address</Label>
                            <Input type="email" placeholder="invest@venture.com" {...investorForm.register('email')} className="h-12 bg-white/5 border-white/10" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/60">Security Key</Label>
                            <Input type="password" {...investorForm.register('password')} className="h-12 bg-white/5 border-white/10" />
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/60">WhatsApp / Phone</Label>
                            <Input placeholder="+256..." {...investorForm.register('whatsapp')} className="h-12 bg-white/5 border-white/10" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/60">Professional Link (LinkedIn/Bio)</Label>
                            <Input placeholder="https://linkedin.com/in/..." {...investorForm.register('proLink')} className="h-12 bg-white/5 border-white/10" />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase text-primary tracking-[0.3em]">💰 Venture Parameters</h3>
                    <div className="grid md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase text-white/40">Funding Style</Label>
                            <div className="space-y-3">
                                {FUNDING_STYLES.map(style => (
                                    <div key={style} className="flex items-center space-x-3">
                                        <Controller
                                            name="fundingStyle"
                                            control={investorForm.control}
                                            render={({ field }) => (
                                                <Checkbox 
                                                    id={`style-${style}`}
                                                    checked={field.value.includes(style)}
                                                    onCheckedChange={(checked) => {
                                                        const newVal = checked 
                                                            ? [...field.value, style]
                                                            : field.value.filter(v => v !== style);
                                                        field.onChange(newVal);
                                                    }}
                                                />
                                            )}
                                        />
                                        <label htmlFor={`style-${style}`} className="text-sm font-medium text-white/80 cursor-pointer">{style}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase text-white/40">Budget Per Creator</Label>
                            <Controller
                                name="budgetRange"
                                control={investorForm.control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger className="h-12 bg-white/5 border-white/10">
                                            <SelectValue placeholder="Select Funding Range" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#0B0F19] border-white/10">
                                            {BUDGET_RANGES.map(range => (
                                                <SelectItem key={range} value={range}>{range}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-6 bg-white/[0.02] p-8 rounded-3xl border border-white/5">
                    <h3 className="text-xs font-black uppercase text-primary tracking-[0.3em]">📜 Verification & Security</h3>
                    <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/60">ID / Passport / Driver's License</Label>
                        <Input type="file" {...investorForm.register('verificationFile')} className="bg-black/40 border-dashed border-2 border-white/10 h-16 pt-4" />
                    </div>
                    <div className="flex items-start space-x-4 pt-4">
                        <Controller
                            name="terms"
                            control={investorForm.control}
                            render={({ field }) => (
                                <Checkbox 
                                    id="terms-investor" 
                                    checked={field.value} 
                                    onCheckedChange={field.onChange} 
                                    className="mt-1"
                                />
                            )}
                        />
                        <label htmlFor="terms-investor" className="text-xs text-white/40 leading-relaxed italic">
                            I agree not to exploit, copy, or misuse creator projects without permission. I authorize Louis to perform background verification on my professional profile.
                        </label>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-10 pt-0">
                <Button disabled={isSubmitting} className="w-full h-20 rounded-3xl text-2xl font-headline font-black uppercase tracking-tighter bg-primary text-black shadow-2xl shadow-primary/30 active:scale-95 transition-all">
                    {isSubmitting ? <Loader2 className="mr-3 h-8 w-8 animate-spin" /> : <Rocket className="mr-3 h-8 w-8" />}
                    Register as Private Investor
                </Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  );
}
