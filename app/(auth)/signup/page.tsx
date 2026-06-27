

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { User, School, Building2, ShieldCheck, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SignUpSelectionPage() {
    return (
        <div className="container mx-auto max-w-6xl px-4 py-12">
            <header className="mb-16 text-center space-y-4">
                <h1 className="text-5xl md:text-7xl font-bold font-headline tracking-tighter text-white">Join the Hub</h1>
                <p className="mt-2 text-xl text-muted-foreground max-w-2xl mx-auto">
                    Select your identity to access Uganda's premier DIY innovation laboratory.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Individual Card */}
                <Card className="flex flex-col text-center hover:border-primary transition-all duration-500 rounded-[2.5rem] bg-white/[0.03] border-white/5 overflow-hidden group">
                    <CardHeader className="p-8">
                        <div className="mx-auto rounded-2xl bg-primary/10 p-4 mb-4 group-hover:scale-110 transition-transform">
                            <User className="h-10 w-10 text-primary" />
                        </div>
                        <CardTitle className="text-3xl font-headline font-black">Individual</CardTitle>
                        <CardDescription className="text-sm">Solo makers & personal accounts.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow p-8 pt-0">
                        <ul className="text-xs text-muted-foreground space-y-3 mb-8">
                            <li className="flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-primary" /> Post DIY projects directly</li>
                            <li className="flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-primary" /> Receive direct sponsorship</li>
                            <li className="flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-primary" /> Full access to Louis AI Lab</li>
                        </ul>
                        <Button asChild className="w-full h-14 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20">
                            <Link href="/signup/individual">Register Personal</Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Supervisor Card */}
                <Card className="flex flex-col text-center hover:border-primary transition-all duration-500 rounded-[2.5rem] bg-white/[0.03] border-white/5 overflow-hidden group">
                    <CardHeader className="p-8">
                        <div className="mx-auto rounded-2xl bg-accent/10 p-4 mb-4 group-hover:scale-110 transition-transform">
                            <ShieldCheck className="h-10 w-10 text-accent" />
                        </div>
                        <CardTitle className="text-3xl font-headline font-black">Supervisor</CardTitle>
                        <CardDescription className="text-sm">For teachers, patrons, & guides.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow p-8 pt-0">
                        <ul className="text-xs text-muted-foreground space-y-3 mb-8">
                            <li className="flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-accent" /> Manage & register pupils</li>
                            <li className="flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-accent" /> Oversee student innovations</li>
                            <li className="flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-accent" /> Institutional verification node</li>
                        </ul>
                        <Button asChild className="w-full h-14 rounded-2xl font-bold text-lg shadow-xl shadow-accent/20" variant="secondary">
                            <Link href="/signup/supervisor">Register as Patron</Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Funder Portal Card */}
                <Card className="flex flex-col text-center border-2 border-primary/40 shadow-2xl shadow-primary/10 transition-all duration-500 rounded-[2.5rem] bg-primary/5 overflow-hidden group">
                    <CardHeader className="p-8">
                        <div className="mx-auto rounded-2xl bg-primary/20 p-4 mb-4 group-hover:scale-110 transition-transform">
                            <HeartHandshake className="h-10 w-10 text-primary" />
                        </div>
                        <CardTitle className="text-3xl font-headline font-black">Funder</CardTitle>
                        <CardDescription className="text-sm">For Universities & Investors.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow p-8 pt-0">
                        <ul className="text-xs text-white/60 space-y-3 mb-8">
                            <li className="flex items-center gap-2 font-bold text-white"><CheckCircle2 className="h-4 w-4 text-primary" /> Academic Enrollment Portal</li>
                            <li className="flex items-center gap-2 font-bold text-white"><CheckCircle2 className="h-4 w-4 text-primary" /> Private Angel Investing Node</li>
                            <li className="flex items-center gap-2 font-bold text-white"><CheckCircle2 className="h-4 w-4 text-primary" /> Strategize with Venture Data</li>
                        </ul>
                        <Button asChild className="w-full h-14 rounded-2xl font-black text-lg bg-primary text-black hover:bg-primary/90 shadow-2xl shadow-primary/30">
                            <Link href="/funder-registration">Register as Funder</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-16 text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                    Registering an NGO or Science Club? <Link href="/signup/organisation" className="underline text-primary font-bold">Use Organisation Registration</Link>
                </p>
                <div className="pt-4 flex items-center justify-center gap-2 text-white/40 uppercase font-black tracking-widest text-[10px]">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary hover:text-white transition-colors">
                        Authorize Login
                    </Link>
                </div>
            </div>
        </div>
    )
}
