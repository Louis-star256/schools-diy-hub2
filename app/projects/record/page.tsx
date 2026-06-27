
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Camera,
  Loader2,
  Upload,
  Circle,
  Square,
  Video,
  Mic,
  SwitchCamera,
  Image as ImageIcon,
} from 'lucide-react';
import { useFirebaseApp, useUser } from '@/firebase';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';

type Mode = 'video' | 'photo' | 'audio';
type FacingMode = 'user' | 'environment';

export default function RecordVideoPage() {
  const { toast } = useToast();
  const router = useRouter();
  const app = useFirebaseApp();
  const { user } = useUser();

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [mode, setMode] = useState<Mode>('video');
  const [facingMode, setFacingMode] = useState<FacingMode>('environment');
  const [hasPermission, setHasPermission] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const getMedia = useCallback(async () => {
    stopStream();
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasPermission(false);
      return;
    }
    
    let constraints: MediaStreamConstraints = {};
    if (mode === 'audio') {
        constraints = { audio: true, video: false };
    } else {
        constraints = { audio: true, video: { facingMode } };
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        if (mode === 'audio') {
            videoRef.current.srcObject = null;
        } else {
            videoRef.current.srcObject = stream;
        }
      }
      setHasPermission(true);
    } catch (error) {
      console.error('Error accessing media device:', error);
      setHasPermission(false);
      toast({
        variant: 'destructive',
        title: 'Media Access Denied',
        description: `Please enable ${mode === 'audio' ? 'microphone' : 'camera and microphone'} permissions to use this feature.`,
      });
    }
  }, [mode, facingMode, toast, stopStream]);

  useEffect(() => {
    getMedia();
    return () => {
      stopStream();
    };
  }, [getMedia, stopStream]);

  const handleStartRecording = () => {
    if (streamRef.current) {
      setRecordedChunks([]);
      setMediaUrl(null);
      const mimeType = mode === 'video' ? 'video/webm' : 'audio/webm';
      mediaRecorderRef.current = new MediaRecorder(streamRef.current, { mimeType });
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setMediaUrl(url);
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleTakePhoto = () => {
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
            setMediaUrl(null); // Clear any previous recording
        }
    }
  };

  const handleSwitchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const handleUploadAndCreate = async () => {
    if (!user || !app) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to create a project.',
      });
      return;
    }

    let blob: Blob | null = null;
    let fileType = '';
    let targetParam = '';
    let folder = '';

    if (mode === 'photo' && capturedImage) {
        const res = await fetch(capturedImage);
        blob = await res.blob();
        fileType = 'jpeg';
        targetParam = 'imageUrl';
        folder = 'project-images';
    } else if (recordedChunks.length > 0) {
        if(mode === 'video') {
            blob = new Blob(recordedChunks, { type: 'video/webm' });
            fileType = 'webm';
            targetParam = 'videoUrl';
            folder = 'project-videos';
        } else if (mode === 'audio') {
            blob = new Blob(recordedChunks, { type: 'audio/webm' });
            fileType = 'webm';
            targetParam = 'audioUrl';
            folder = 'project-audio';
        }
    }

    if (!blob) {
        toast({ variant: 'destructive', title: 'No media to upload' });
        return;
    }

    setIsUploading(true);
    const storage = getStorage(app);
    const storageRef = ref(storage, `${folder}/${user.uid}/${Date.now()}.${fileType}`);
    const uploadTask = uploadBytesResumable(storageRef, blob);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error('Upload failed:', error);
        toast({ variant: 'destructive', title: 'Upload Failed', description: error.message });
        setIsUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          toast({ title: 'Upload Complete!', description: 'Redirecting to create your project...' });
          router.push(`/projects/new?${targetParam}=${encodeURIComponent(downloadURL)}`);
        });
      }
    );
  };
  
  const resetCapture = () => {
      setMediaUrl(null);
      setCapturedImage(null);
      setRecordedChunks([]);
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 md:px-6 md:py-12">
      <header className="mb-8 text-center">
        <div className="inline-block rounded-full bg-primary/10 p-4 mb-4">
          <Camera className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold font-headline tracking-tight">Create Media</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Record a video, take a photo, or capture audio for your project.
        </p>
      </header>
      <Tabs value={mode} onValueChange={(value) => setMode(value as Mode)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="video"><Video className="mr-2" />Video</TabsTrigger>
          <TabsTrigger value="photo"><ImageIcon className="mr-2" />Photo</TabsTrigger>
          <TabsTrigger value="audio"><Mic className="mr-2" />Audio</TabsTrigger>
        </TabsList>
        <Card className="mt-4">
            <CardContent className="pt-6 space-y-4">
                <div className="w-full aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center relative">
                    {mediaUrl ? (
                         mode === 'video' ? (
                            <video src={mediaUrl} className="w-full h-full object-cover" controls autoPlay />
                         ) : (
                            <div className="p-4 flex flex-col items-center gap-4">
                               <p className="font-semibold text-center">Audio Recorded!</p>
                               <audio src={mediaUrl} controls />
                            </div>
                         )
                    ) : capturedImage ? (
                        <Image src={capturedImage} alt="Captured photo" layout="fill" objectFit="contain" />
                    ) : (
                        <>
                         { mode !== 'audio' ? (
                             <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                         ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                <Mic className="h-16 w-16" />
                                <p className="mt-2">Ready to record audio</p>
                            </div>
                         )}
                         <canvas ref={canvasRef} className="hidden" />
                        </>
                    )}
                </div>
                 {!hasPermission && (
                    <Alert variant="destructive">
                    <AlertTitle>Permission Required</AlertTitle>
                    <AlertDescription>Please allow media access in your browser to use this feature.</AlertDescription>
                    </Alert>
                )}
                {isUploading ? (
                    <div className="space-y-2 text-center">
                        <p className="font-semibold">Uploading...</p>
                        <Progress value={uploadProgress} />
                        <p className="text-sm text-muted-foreground">{Math.round(uploadProgress)}% complete</p>
                    </div>
                ) : mediaUrl || capturedImage ? (
                     <div className="border-t pt-4 space-y-4 text-center">
                        <p className="font-semibold">Media Captured!</p>
                         <div className="flex justify-center gap-4">
                            <Button size="lg" onClick={handleUploadAndCreate}><Upload className="mr-2" /> Use this Media</Button>
                            <Button size="lg" variant="outline" onClick={resetCapture}>Capture Again</Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center items-center gap-4">
                        {mode === 'photo' ? (
                            <Button size="lg" onClick={handleTakePhoto} disabled={!hasPermission}>
                                <Camera className="mr-2" /> Take Photo
                            </Button>
                        ) : !isRecording ? (
                            <Button size="lg" onClick={handleStartRecording} disabled={!hasPermission}>
                                <Circle className="mr-2 fill-red-500 text-red-500" /> Start Recording
                            </Button>
                        ) : (
                            <Button size="lg" variant="destructive" onClick={handleStopRecording}>
                                <Square className="mr-2" /> Stop Recording
                            </Button>
                        )}
                        {mode !== 'audio' && (
                             <Button size="icon" variant="outline" onClick={handleSwitchCamera} disabled={!hasPermission || isRecording}>
                                <SwitchCamera />
                                <span className="sr-only">Switch Camera</span>
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
