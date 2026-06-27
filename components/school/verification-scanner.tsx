'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Camera, ShieldCheck, Loader2, RefreshCw, CheckCircle2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function VerificationScanner() {
  const [isOpen, setOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const getCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings to verify your account.',
      });
    }
  };

  useEffect(() => {
    if (isOpen && !capturedImage) {
      getCameraPermission();
    }
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen, capturedImage]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        // Stop the stream after capture
        if (video.srcObject) {
          (video.srcObject as MediaStream).getTracks().forEach(t => t.stop());
        }
      }
    }
  };

  const resetScanner = () => {
    setCapturedImage(null);
    setHasCameraPermission(null);
  };

  const handleFinalSubmit = () => {
    setIsCapturing(true);
    // Simulate upload
    setTimeout(() => {
      setIsCapturing(false);
      setOpen(false);
      resetScanner();
      toast({
        title: 'Documents Submitted',
        description: 'Louis is reviewing your institutional credentials. This usually takes 2-4 hours.',
      });
    }, 2000);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2 shadow-lg shadow-primary/20">
        <Camera className="h-4 w-4" />
        Scan Identity Docs
      </Button>

      <Dialog open={isOpen} onOpenChange={(val) => {
        if (!val) resetScanner();
        setOpen(val);
      }}>
        <DialogContent className="sm:max-w-2xl rounded-[2rem] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              Institutional Verification
            </DialogTitle>
            <DialogDescription>
              Scan your School Head ID or official registration certificate to unlock full administrative features.
            </DialogDescription>
          </DialogHeader>

          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border-4 border-muted group">
            {capturedImage ? (
              <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
            ) : (
              <>
                <video 
                  ref={videoRef} 
                  className="w-full h-full object-cover" 
                  autoPlay 
                  muted 
                  playsInline 
                />
                <div className="absolute inset-0 border-[20px] border-black/40 pointer-events-none">
                    <div className="w-full h-full border-2 border-dashed border-white/50 rounded-lg flex items-center justify-center">
                        <div className="text-white/20 uppercase font-black tracking-tighter text-4xl rotate-12">Place Document Here</div>
                    </div>
                </div>
              </>
            )}

            {!hasCameraPermission && hasCameraPermission !== null && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/90 p-6 text-center">
                <div className="space-y-4">
                  <Alert variant="destructive">
                    <AlertTitle>Camera Required</AlertTitle>
                    <AlertDescription>We need camera access to securely scan your documentation.</AlertDescription>
                  </Alert>
                  <Button onClick={getCameraPermission} variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" /> Try Again
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2 sm:justify-between items-center pt-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>JPEG Format • Encrypted Transmission</span>
            </div>
            <div className="flex gap-2">
                {capturedImage ? (
                    <>
                        <Button variant="outline" onClick={resetScanner}>Retake</Button>
                        <Button onClick={handleFinalSubmit} disabled={isCapturing} className="min-w-[140px]">
                            {isCapturing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                            Submit for Review
                        </Button>
                    </>
                ) : (
                    <Button 
                        disabled={!hasCameraPermission} 
                        onClick={handleCapture}
                        className="rounded-full h-14 w-14 p-0 bg-white hover:bg-white/90 text-black border-4 border-primary shadow-xl"
                    >
                        <div className="h-8 w-8 rounded-full border-2 border-black" />
                    </Button>
                )}
            </div>
          </DialogFooter>
          <canvas ref={canvasRef} className="hidden" />
        </DialogContent>
      </Dialog>
    </>
  );
}
