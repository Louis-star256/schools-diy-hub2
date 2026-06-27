
'use client';

import Link from "next/link";
import { Logo } from "./logo";
import { Button } from "./ui/button";
import { Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { PaymentDialog } from "./payments/payment-dialog";

export function Footer() {
    const [showCreatorDonation, setShowCreatorDonation] = useState(false);
    const [year, setYear] = useState<number | null>(null);

    useEffect(() => {
        setYear(new Date().getFullYear());
    }, []);

    return (
        <footer className="border-t bg-black/80 backdrop-blur-3xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <div className="container mx-auto px-6 py-16 md:px-12">
                <div className="flex flex-col items-center justify-between gap-12 lg:flex-row">
                    <div className="flex flex-col items-center lg:items-start gap-4">
                        <Logo />
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-[0.2em]">
                            © {year ?? ''} School's DIY Hub. All Rights Reserved.
                        </p>
                    </div>

                    <nav className="flex flex-wrap items-center justify-center gap-8">
                        <Link href="/how-to-use" className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors">How to Use</Link>
                        <Link href="/about" className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors">About Mission</Link>
                        <Link href="/feedback" className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors">Feedback</Link>
                        <Link href="/terms" className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors">Terms</Link>
                    </nav>

                    <Button 
                        size="xl" 
                        variant="default" 
                        className="rounded-full bg-primary text-black font-black hover:bg-primary/90 px-10 h-16 shadow-2xl shadow-primary/30 group active:scale-95 transition-all"
                        onClick={() => setShowCreatorDonation(true)}
                    >
                        <Zap className="mr-3 h-6 w-6 group-hover:animate-pulse" /> Donate
                    </Button>
                </div>
            </div>

            <PaymentDialog 
                open={showCreatorDonation} 
                onOpenChange={setShowCreatorDonation} 
                isCreatorDonation={true}
                project={{
                    id: 'hub-direct-node',
                    title: 'Support the Vision of School\'s DIY Hub',
                    userId: 'hub-direct'
                }}
            />
        </footer>
    )
}
