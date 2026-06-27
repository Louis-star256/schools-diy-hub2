'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, 
  Smartphone, 
  CheckCircle2, 
  Loader2, 
  DollarSign,
  Zap,
  ShieldCheck,
  Rocket,
  Heart,
  ArrowRight
} from 'lucide-react';
import { useFirestore, useUser } from '@/firebase';
import { doc, updateDoc, increment, collection, serverTimestamp, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function MtnIcon() {
    return (
        <div className="relative h-8 w-12 bg-[#FFCC00] rounded-sm flex items-center justify-center border border-black/10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            <span className="text-[10px] font-black text-[#003399] tracking-tighter z-10">MTN</span>
            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-[#003399] rounded-full opacity-20" />
        </div>
    );
}

function AirtelIcon() {
    return (
        <div className="relative h-8 w-12 bg-[#FF0000] rounded-sm flex items-center justify-center border border-white/10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            <span className="text-[10px] font-black text-white italic z-10">airtel</span>
            <div className="absolute top-0 left-0 h-full w-1 bg-white/20" />
        </div>
    );
}

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: {
    id: string;
    title: string;
    userId: string;
  };
  isCreatorDonation?: boolean;
}

export function PaymentDialog({ open, onOpenChange, project, isCreatorDonation }: PaymentDialogProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'MTN' | 'Airtel' | 'Card'>('MTN');
  const [isProcessing, setIsProcessing] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  const handleProcessPayment = async () => {
    if (!selectedTier || !firestore || !user) {
        toast({ title: "Authorization Required", description: "Sign in to activate the payment node." });
        return;
    }
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: selectedTier,
          currency: 'USD',
          projectId: project.id,
          senderId: user.uid,
          receiverId: isCreatorDonation ? 'creator-louis-direct' : project.userId,
          email: user.email,
          firstName: user.displayName || 'Innovator',
        })
      });

      const result = await response.json();

      if (result.error) throw new Error(result.error);

      // Create transaction record in Firestore
      await addDoc(collection(firestore, 'transactions'), {
        senderId: user.uid,
        receiverId: isCreatorDonation ? 'creator-louis-direct' : project.userId,
        projectId: project.id,
        amount: selectedTier,
        currency: 'USD',
        type: isCreatorDonation ? 'creator_donation' : 'project_gift',
        method: paymentMethod,
        status: 'pending',
        createdAt: serverTimestamp(),
        providerRef: result.data.txRef,
        isCreatorDonation: !!isCreatorDonation
      });

      if (!isCreatorDonation) {
        const pRef = doc(firestore, 'projects', project.id);
        await updateDoc(pRef, {
          raisedAmount: increment(selectedTier),
          sponsors: increment(1),
          isSponsored: true
        });
      }

      toast({ title: 'Venture Path Established', description: `Directing to secure payment node...` });
      setRedirectUrl(result.data.redirectUrl);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Transmission Error', description: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
        if (!val) {
            setRedirectUrl(null);
            setSelectedTier(null);
        }
        onOpenChange(val);
    }}>
      <DialogContent className="sm:max-w-[550px] rounded-[3.5rem] bg-[#05070A] border-white/10 p-0 overflow-hidden text-white shadow-[0_0_100px_rgba(0,0,0,0.9)]">
        {!redirectUrl ? (
          <div className="flex flex-col h-full">
            <div className="p-10 pb-6 bg-gradient-to-br from-primary/20 via-transparent to-transparent border-b border-white/5">
                <div className="flex items-center gap-6 mb-4">
                    <div className="h-16 w-16 bg-primary rounded-[1.5rem] flex items-center justify-center text-black shadow-2xl shadow-primary/30 transform rotate-3">
                        {isCreatorDonation ? <Heart className="h-8 w-8 text-black fill-current" /> : <Zap className="h-8 w-8 text-black" />}
                    </div>
                    <div>
                        <DialogTitle className="text-4xl font-black font-headline tracking-tighter leading-none">
                            {isCreatorDonation ? 'Hub Donation' : 'Project Venture'}
                        </DialogTitle>
                        <DialogDescription className="text-[11px] text-primary font-black uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
                           <ShieldCheck className="h-3 w-3" /> Secure Node: {user?.uid?.slice(0, 8)}
                        </DialogDescription>
                    </div>
                </div>
            </div>

            <div className="p-10 space-y-10">
                <div className="space-y-4">
                    <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-primary/60 ml-4">Venture Amount (USD)</Label>
                    <div className="relative group">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            <DollarSign className="text-primary h-10 w-10 group-focus-within:scale-110 transition-transform" />
                        </div>
                        <Input 
                            type="number" 
                            placeholder="0.00" 
                            className="h-24 pl-20 bg-white/5 border-white/10 rounded-[2.5rem] text-5xl font-black font-headline focus-visible:ring-primary shadow-inner text-white placeholder:text-white/10"
                            onChange={(e) => setSelectedTier(parseFloat(e.target.value))}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-primary/60 ml-4">Authorized Gateways</Label>
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { id: 'MTN', name: 'MTN MoMo', icon: MtnIcon },
                            { id: 'Airtel', name: 'Airtel Pay', icon: AirtelIcon },
                            { id: 'Card', name: 'Visa/Master', icon: () => <CreditCard className="h-8 w-8 text-blue-500" /> }
                        ].map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setPaymentMethod(m.id as any)}
                                className={cn(
                                    "flex flex-col items-center gap-3 p-6 rounded-[2rem] border-2 transition-all group h-32 justify-center",
                                    paymentMethod === m.id ? "border-primary bg-primary/10" : "border-white/5 bg-white/[0.02] hover:bg-white/5"
                                )}
                            >
                                <div className="transition-transform group-hover:scale-110">
                                    <m.icon />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-tighter text-white/60">{m.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <DialogFooter className="p-10 pt-0">
              <Button 
                disabled={!selectedTier || isProcessing} 
                className="w-full h-24 rounded-[3rem] text-3xl font-headline font-black uppercase tracking-tighter bg-primary text-black shadow-2xl shadow-primary/40 active:scale-95 transition-all group overflow-hidden"
                onClick={handleProcessPayment}
              >
                {isProcessing ? (
                  <div className="flex items-center">
                    <Loader2 className="mr-3 h-10 w-10 animate-spin" />
                    Initializing Node...
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    {isCreatorDonation ? 'Complete Hub Donation' : `Commit $${selectedTier || 0} Venture`} <Rocket className="h-10 w-10 group-hover:translate-x-1 group-hover:translate-y-[-4px] transition-transform" />
                  </div>
                )}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="py-24 text-center space-y-12 p-12 bg-gradient-to-br from-[#05070A] via-primary/5 to-black">
            <div className="relative h-40 w-40 mx-auto">
                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="relative h-full w-full bg-green-500/10 text-green-500 rounded-[3.5rem] flex items-center justify-center border-4 border-green-500/30 shadow-[0_0_60px_rgba(34,197,94,0.3)]">
                  <ShieldCheck className="h-24 w-24" />
                </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-6xl font-black font-headline tracking-tighter leading-none">Security Node <br /> Active</h3>
              <p className="text-muted-foreground text-xl max-w-sm mx-auto font-medium leading-relaxed">
                Louis has established a safe venture bridge. Finalize your **${selectedTier}** contribution via the official gateway.
              </p>
            </div>
            <Button asChild className="h-28 w-full px-12 text-4xl font-headline font-black rounded-[3.5rem] shadow-2xl shadow-primary/50 bg-primary text-black hover:bg-primary/90 active:scale-95 transition-all">
                <a href={redirectUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-4">
                    Complete Hub Venture <ArrowRight className="h-10 w-10" />
                </a>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
