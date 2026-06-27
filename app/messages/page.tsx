'use client';

import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CameraPreviewPage() {
    const [hasCameraPermission, setHasCameraPermission] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        const getCameraPermission = async () => {
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error('Camera API not supported in this browser.');
            setHasCameraPermission(false);
            return;
          }
          try {
            const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
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
              description: 'Please enable camera permissions in your browser settings to use this feature.',
            });
          }
        };
    
        getCameraPermission();

        // Clean up the stream when the component unmounts
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
      }, [toast]);
      
    const handleRecordClick = () => {
        // Placeholder for recording logic
        setIsRecording(prev => !prev);
    }

    return (
        <div className="container mx-auto max-w-2xl px-4 py-8 md:px-6 md:py-12">
             <header className="mb-8 text-center">
                 <div className="inline-block rounded-full bg-primary/10 p-4 mb-4">
                    <Camera className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-headline tracking-tight">Camera Preview</h1>
                <p className="mt-2 text-lg text-muted-foreground">This is the first step to creating video content. Let's make sure your camera is working!</p>
            </header>
            <Card>
                <CardHeader>
                    <CardTitle>Live Feed</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="w-full aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center">
                        <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                    </div>
                    { !hasCameraPermission && (
                        <Alert variant="destructive">
                            <AlertTitle>Camera Access Required</AlertTitle>
                            <AlertDescription>
                                Please allow camera access in your browser settings to use this feature.
                            </AlertDescription>
                        </Alert>
                    )}
                    <div className="flex justify-center gap-4">
                        <Button size="lg" onClick={handleRecordClick} disabled={!hasCameraPermission}>
                            <Video className="mr-2" />
                            {isRecording ? 'Stop Recording' : 'Start Recording'}
                        </Button>
                        <Button size="lg" variant="secondary" disabled>
                           Upload
                        </Button>
                    </div>
                     <p className="text-xs text-center text-muted-foreground">Recording and uploading are not yet implemented. This is a visual demonstration.</p>
                </CardContent>
            </Card>
        </div>
    )
}
