
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
    Video, 
    Camera, 
    Upload, 
    Music, 
    CheckCircle2, 
    Loader2, 
    Trash2, 
    RotateCw, 
    Sun, 
    Volume2, 
    VolumeX, 
    Play, 
    Pause, 
    Plus,
    X,
    Rocket,
    Zap,
    ChevronRight,
    ChevronLeft,
    Database
} from 'lucide-react';
import { useUser, useFirebaseApp, useStorage } from '@/firebase';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { localMediaDB } from '@/lib/local-media';

const MUSIC_LIBRARY = [
  { id: 'chill', name: 'Chill Vibes', category: 'Chill', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 'tech', name: 'Innovation Pulse', category: 'Tech', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 'motivational', name: 'Peak Success', category: 'Motivational', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
  { id: 'cinematic', name: 'Epic Journey', category: 'Cinematic', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
];

export function MediaStudio() {
  const [step, setStep] = useState(1);
  const { user } = useUser();
  const app = useFirebaseApp();
  const storage = useStorage();
  const firestore = app ? getFirestore(app) : null;
  const router = useRouter();
  const { toast } = useToast();

  const [mediaType, setMediaType] = useState<'video' | 'image' | null>(null);
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  
  const [brightness, setBrightness] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSavedLocally, setIsSavedLocally] = useState(false);

  const [selectedMusic, setSelectedMusic] = useState<typeof MUSIC_LIBRARY[0] | null>(null);
  const [musicVolume, setMusicVolume] = useState(50);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const musicFileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [complexity, setComplexity] = useState('Beginner');
  const [category, setCategory] = useState('Technology');

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async (type: 'video' | 'image') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setMediaType(type);
      setMediaUrl(null);
      setMediaBlob(null);
      setIsSavedLocally(false);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Camera Error', description: 'Please enable camera permissions.' });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    const recorder = new MediaRecorder(streamRef.current, { mimeType: 'video/webm' });
    mediaRecorderRef.current = recorder;
    setRecordedChunks([]);
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) setRecordedChunks(prev => [...prev, e.data]);
    };
    recorder.onstop = async () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      setMediaBlob(blob);
      setMediaUrl(URL.createObjectURL(blob));
      
      // Save locally to device to save storage costs/bandwidth if user restarts
      const localId = `studio-draft-${Date.now()}`;
      await localMediaDB.saveMedia(localId, blob);
      setIsSavedLocally(true);
    };
    recorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    stopCamera();
    setStep(2);
  };

  const takePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(videoRef.current, 0, 0);
    canvas.toBlob(async (blob) => {
        if (blob) {
            setMediaBlob(blob);
            setMediaUrl(URL.createObjectURL(blob));
            setMediaType('image');
            stopCamera();
            setStep(2);
            
            const localId = `studio-photo-${Date.now()}`;
            await localMediaDB.saveMedia(localId, blob);
            setIsSavedLocally(true);
        }
    }, 'image/jpeg');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const type = file.type.startsWith('video/') ? 'video' : 'image';
        setMediaType(type);
        setMediaBlob(file);
        setMediaUrl(URL.createObjectURL(file));
        setStep(2);
        setIsSavedLocally(true);
    }
  };

  const handleMusicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const customMusic = { id: 'custom', name: file.name, category: 'Upload', url: URL.createObjectURL(file) };
        setSelectedMusic(customMusic);
    }
  };

  const toggleMusic = () => {
    if (audioRef.current) {
        if (isMusicPlaying) audioRef.current.pause();
        else audioRef.current.play();
        setIsMusicPlaying(!isMusicPlaying);
    }
  };

  const handlePublish = async () => {
    if (!firestore || !storage || !user || !mediaBlob) return;

    setIsUploading(true);
    const fileExt = mediaType === 'video' ? 'webm' : 'jpg';
    const mediaPath = `studio-uploads/${user.uid}/${Date.now()}.${fileExt}`;
    const mediaRef = ref(storage, mediaPath);
    const uploadTask = uploadBytesResumable(mediaRef, mediaBlob);

    uploadTask.on('state_changed', 
      (snap) => setUploadProgress((snap.bytesTransferred / snap.totalBytes) * 100),
      (err) => {
          setIsUploading(false);
          toast({ variant: 'destructive', title: 'Upload Failed', description: err.message });
      },
      async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          
          await addDoc(collection(firestore, 'projects'), {
              title,
              description,
              skillLevel: complexity,
              category,
              imageUrl: mediaType === 'image' ? downloadUrl : 'https://picsum.photos/seed/studio/800/600',
              videoUrl: mediaType === 'video' ? downloadUrl : null,
              userId: user.uid,
              likes: 0,
              materials: [],
              instructions: 'Project created in Studio.',
              createdAt: serverTimestamp(),
          });

          toast({ title: 'Innovation Launched!', description: 'Your project is now in the Showcase.' });
          router.push('/projects');
      }
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
      <section className="space-y-6 lg:sticky lg:top-24">
        <div className="relative aspect-[4/5] md:aspect-video rounded-[3rem] overflow-hidden bg-black shadow-2xl border-4 border-[#1F2937] group">
            {mediaUrl ? (
                mediaType === 'video' ? (
                    <video 
                        src={mediaUrl} 
                        className="w-full h-full object-cover" 
                        controls={step > 1}
                        autoPlay 
                        loop 
                        muted={isMuted}
                        style={{ filter: `brightness(${brightness}%)`, transform: `rotate(${rotation}deg)` }}
                    />
                ) : (
                    <Image 
                        src={mediaUrl} 
                        alt="Studio Preview" 
                        fill 
                        className="object-cover transition-all" 
                        style={{ filter: `brightness(${brightness}%)`, transform: `rotate(${rotation}deg)` }}
                    />
                )
            ) : (
                <div className="w-full h-full flex items-center justify-center relative">
                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                    {!mediaType && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-12 text-center text-white space-y-6">
                            <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
                                <Zap className="h-10 w-10 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black font-headline tracking-tighter">Initialize Studio</h3>
                                <p className="text-sm text-muted-foreground">Select a capture mode to start your innovation journey.</p>
                            </div>
                            <div className="flex gap-4">
                                <Button onClick={() => startCamera('video')} className="rounded-full h-12 px-6 gap-2"><Video className="h-4 w-4" /> Video</Button>
                                <Button onClick={() => startCamera('image')} variant="secondary" className="rounded-full h-12 px-6 gap-2"><Camera className="h-4 w-4" /> Photo</Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {isSavedLocally && (
                <div className="absolute top-6 left-6 z-30">
                    <div className="bg-green-500/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-green-500/30 flex items-center gap-2">
                        <Database className="h-3 w-3 text-green-500" />
                        <span className="text-[9px] font-black uppercase text-green-500 tracking-widest">Saved Locally</span>
                    </div>
                </div>
            )}

            {mediaType && step === 1 && (
                <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-6 z-20">
                    {mediaType === 'video' ? (
                        !isRecording ? (
                            <Button onClick={startRecording} className="h-20 w-20 rounded-full bg-red-600 hover:bg-red-700 p-0 border-4 border-white shadow-2xl scale-110">
                                <div className="h-8 w-8 bg-white rounded-sm" />
                            </Button>
                        ) : (
                            <Button onClick={stopRecording} className="h-20 w-20 rounded-full bg-black border-4 border-white animate-pulse">
                                <div className="h-8 w-8 bg-red-600 rounded-sm" />
                            </Button>
                        )
                    ) : (
                        <Button onClick={takePhoto} className="h-20 w-20 rounded-full bg-white hover:bg-muted border-8 border-primary/20 shadow-2xl" />
                    )}
                </div>
            )}

            {step === 2 && (
                <div className="absolute top-6 right-6 flex flex-col gap-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="secondary" className="rounded-full h-10 w-10 bg-black/60 backdrop-blur text-white border-white/10" onClick={() => setRotation(r => r + 90)}>
                        <RotateCw className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="secondary" className="rounded-full h-10 w-10 bg-black/60 backdrop-blur text-white border-white/10" onClick={() => setBrightness(b => b === 150 ? 100 : 150)}>
                        <Sun className="h-4 w-4" />
                    </Button>
                    {mediaType === 'video' && (
                        <Button size="icon" variant="secondary" className="rounded-full h-10 w-10 bg-black/60 backdrop-blur text-white border-white/10" onClick={() => setIsMuted(!isMuted)}>
                            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </Button>
                    )}
                    <Button size="icon" variant="destructive" className="rounded-full h-10 w-10" onClick={() => { setMediaUrl(null); setStep(1); setMediaType(null); }}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>

        <div className="flex items-center justify-between px-6 pt-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center">
                    <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm transition-all",
                        step >= i ? "bg-primary text-black shadow-[0_0_20px_rgba(var(--primary),0.3)]" : "bg-[#1F2937] text-muted-foreground"
                    )}>
                        {step > i ? <CheckCircle2 className="h-5 w-5" /> : i}
                    </div>
                    {i < 3 && <div className={cn("w-12 h-1 mx-2 rounded-full", step > i ? "bg-primary" : "bg-[#1F2937]")} />}
                </div>
            ))}
        </div>
      </section>

      <section className="space-y-8 bg-[#0B0F19] lg:p-8 rounded-[3rem] border border-[#1F2937] shadow-xl">
        
        {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <header>
                    <h2 className="text-4xl font-black font-headline tracking-tighter text-white">Capture Reality</h2>
                    <p className="text-muted-foreground mt-2">All media is saved locally on your device to save storage costs.</p>
                </header>

                <div className="grid grid-cols-1 gap-4">
                    <div 
                        className="group p-8 rounded-3xl border-2 border-dashed border-[#1F2937] hover:border-primary/40 transition-all cursor-pointer bg-white/5"
                        onClick={() => document.getElementById('file-upload')?.click()}
                    >
                        <div className="flex items-center gap-6">
                            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Upload className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-white">Import from Device</h4>
                                <p className="text-sm text-muted-foreground">Select existing photos or videos (Max 50MB)</p>
                            </div>
                        </div>
                        <input id="file-upload" type="file" className="hidden" accept="video/*,image/*" onChange={handleFileUpload} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Button onClick={() => startCamera('video')} variant="outline" className="h-32 rounded-3xl flex-col gap-3 border-[#1F2937] bg-white/5">
                            <Video className="h-8 w-8 text-primary" />
                            <span className="font-bold">Record Video</span>
                        </Button>
                        <Button onClick={() => startCamera('image')} variant="outline" className="h-32 rounded-3xl flex-col gap-3 border-[#1F2937] bg-white/5">
                            <Camera className="h-8 w-8 text-secondary" />
                            <span className="font-bold">Take Photo</span>
                        </Button>
                    </div>
                </div>

                <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10">
                    <div className="flex gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                            <Database className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h5 className="font-bold text-white">Storage Saver Protocol</h5>
                            <p className="text-xs text-muted-foreground mt-1">We save a copy to your phone's memory. This helps us keep the Hub free and accessible for all inventors.</p>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <header className="flex items-center justify-between">
                    <div>
                        <h2 className="text-4xl font-black font-headline tracking-tighter text-white">Refine Work</h2>
                        <p className="text-muted-foreground">Editing locally from device memory.</p>
                    </div>
                    <Button size="icon" variant="ghost" className="rounded-full" onClick={() => setStep(1)}><ChevronLeft /></Button>
                </header>

                <div className="space-y-6">
                    <Card className="bg-black/40 border-[#1F2937] rounded-3xl overflow-hidden shadow-2xl">
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                                    <Music className="h-5 w-5 text-[#3B82F6]" /> Add Background Music
                                </h3>
                                <Button variant="ghost" size="sm" className="text-xs h-8" onClick={() => musicFileInputRef.current?.click()}>
                                    <Plus className="h-3 w-3 mr-1" /> Upload Track
                                </Button>
                                <input type="file" ref={musicFileInputRef} className="hidden" accept="audio/*" onChange={handleMusicUpload} />
                            </div>

                            <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
                                {MUSIC_LIBRARY.map((track) => (
                                    <button 
                                        key={track.id}
                                        onClick={() => {
                                            setSelectedMusic(track);
                                            setIsMusicPlaying(true);
                                        }}
                                        className={cn(
                                            "flex-shrink-0 px-4 py-3 rounded-2xl border-2 transition-all text-left min-w-[140px]",
                                            selectedMusic?.id === track.id ? "border-[#3B82F6] bg-[#3B82F6]/10" : "border-[#1F2937] bg-white/5"
                                        )}
                                    >
                                        <p className="text-[10px] font-black uppercase text-[#3B82F6] mb-1">{track.category}</p>
                                        <p className="text-xs font-bold text-white truncate">{track.name}</p>
                                    </button>
                                ))}
                            </div>

                            {selectedMusic && (
                                <div className="p-4 rounded-2xl bg-[#1F2937]/40 border border-white/5 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Button size="icon" className="h-10 w-10 rounded-full bg-[#3B82F6]" onClick={toggleMusic}>
                                                {isMusicPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                                            </Button>
                                            <div>
                                                <p className="text-xs font-bold text-white">Mixing: {selectedMusic.name}</p>
                                                <audio ref={audioRef} src={selectedMusic.url} autoPlay={isMusicPlaying} loop />
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedMusic(null)}><X className="h-4 w-4" /></Button>
                                    </div>
                                    <div className="space-y-2">
                                        <Slider defaultValue={[musicVolume]} max={100} onValueChange={([v]) => { setMusicVolume(v); if(audioRef.current) audioRef.current.volume = v / 100; }} />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Button onClick={() => setStep(3)} className="w-full h-16 rounded-3xl text-xl font-headline shadow-2xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] border-none group">
                        Enter Project Details <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
            </div>
        )}

        {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <header className="flex items-center justify-between">
                    <div>
                        <h2 className="text-4xl font-black font-headline tracking-tighter text-white">Innovation ID</h2>
                        <p className="text-muted-foreground">Describe your creation for the global laboratory.</p>
                    </div>
                    <Button size="icon" variant="ghost" className="rounded-full" onClick={() => setStep(2)}><ChevronLeft /></Button>
                </header>

                <div className="space-y-6">
                    <div className="space-y-2 group">
                        <Label className="text-xs font-black uppercase tracking-widest text-primary/80 group-focus-within:text-primary transition-colors">Project Title</Label>
                        <Input 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Solar Powered Water Filter" 
                            className="h-14 rounded-2xl bg-white/5 border-[#1F2937] focus:border-primary text-lg font-bold" 
                        />
                    </div>

                    <div className="space-y-2 group">
                        <Label className="text-xs font-black uppercase tracking-widest text-primary/80 group-focus-within:text-primary transition-colors">Description</Label>
                        <Textarea 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What problem does this solve?" 
                            className="min-h-[120px] rounded-2xl bg-white/5 border-[#1F2937] focus:border-primary text-base" 
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Category</Label>
                            <Select onValueChange={setCategory} defaultValue={category}>
                                <SelectTrigger className="h-12 rounded-2xl bg-white/5 border-[#1F2937]"><SelectValue /></SelectTrigger>
                                <SelectContent className="rounded-2xl bg-[#0B0F19] border-[#1F2937]">
                                    <SelectItem value="Technology">Technology</SelectItem>
                                    <SelectItem value="Agriculture">Agriculture</SelectItem>
                                    <SelectItem value="Energy">Energy</SelectItem>
                                    <SelectItem value="Environment">Environment</SelectItem>
                                    <SelectItem value="Robotics">Robotics</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Complexity</Label>
                            <Select onValueChange={setComplexity} defaultValue={complexity}>
                                <SelectTrigger className="h-12 rounded-2xl bg-white/5 border-[#1F2937]"><SelectValue /></SelectTrigger>
                                <SelectContent className="rounded-2xl bg-[#0B0F19] border-[#1F2937]">
                                    <SelectItem value="Beginner">Beginner</SelectItem>
                                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                                    <SelectItem value="Advanced">Advanced</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {isUploading ? (
                        <div className="space-y-4 py-4">
                            <div className="flex justify-between text-xs font-black uppercase text-primary">
                                <span className="flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin" /> Transmission Active</span>
                                <span>{Math.round(uploadProgress)}%</span>
                            </div>
                            <Progress value={uploadProgress} className="h-2 bg-[#1F2937] [&>div]:bg-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]" />
                        </div>
                    ) : (
                        <Button 
                            onClick={handlePublish} 
                            disabled={!title || !description || isUploading}
                            className="w-full h-16 rounded-3xl text-xl font-headline shadow-2xl bg-primary text-black border-none hover:shadow-primary/20 scale-100 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            Launch Innovation <Rocket className="ml-2 h-6 w-6" />
                        </Button>
                    )}
                </div>
            </div>
        )}

      </section>
    </div>
  );
}
