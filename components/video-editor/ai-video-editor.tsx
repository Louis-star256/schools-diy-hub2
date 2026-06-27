'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { suggestVideoEdits, SuggestVideoEditsOutput } from '@/ai/flows/suggest-video-edits';
import { useUser } from '@/firebase';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2, Wand2, Info, Scissors, Image as ImageIcon, Mic, Sliders, Type, Sun, Contrast, Trash2, Plus, Play, Pause } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const editorFormSchema = z.object({
  projectTitle: z.string().min(3, 'Project title is required.'),
  projectDescription: z.string().min(10, 'Project description is required.'),
  userRole: z.string().min(2, 'Your role is required.'),
  ageBracket: z.string().min(3, 'Your age bracket is required.'),
  userGoal: z.string().min(5, 'Your goal is required.'),
});

type EditorFormValues = z.infer<typeof editorFormSchema>;

type VideoEditState = {
  trimStart: number;
  trimEnd: number;
  filter: string;
  textOverlay: string;
  volume: number;
};

type ImageEditState = {
  brightness: number;
  contrast: number;
  saturation: number;
  filter: string;
};

export function AiVideoEditor() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('video');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Editing States
  const [videoEdits, setVideoEdits] = useState<VideoEditState>({
    trimStart: 0,
    trimEnd: 10,
    filter: 'none',
    textOverlay: '',
    volume: 100,
  });

  const [imageEdits, setImageEdits] = useState<ImageEditState>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    filter: 'none',
  });

  const form = useForm<EditorFormValues>({
    resolver: zodResolver(editorFormSchema),
    defaultValues: {
      projectTitle: '',
      projectDescription: '',
      userRole: 'Pupil',
      ageBracket: '13-15',
      userGoal: 'To create a viral video',
    },
  });

  const handleVideoMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const d = e.currentTarget.duration;
    setDuration(d);
    setVideoEdits(prev => ({ ...prev, trimEnd: d }));
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.currentTime >= videoEdits.trimEnd) {
        video.currentTime = videoEdits.trimStart;
        if (isPlaying) video.play();
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [videoEdits.trimStart, videoEdits.trimEnd, isPlaying]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'image') => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (type === 'video') {
        setVideoFile(file);
        setVideoUrl(url);
      } else {
        setImageFile(file);
        setImageUrl(url);
      }
    }
  };

  const handleGetAiSuggestions = async (data: EditorFormValues) => {
    if (!videoUrl || !videoRef.current) {
      setError('Please upload a video first.');
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const result = await suggestVideoEdits({ ...data, videoDuration: duration });
      setVideoEdits({
        trimStart: result.trimStart,
        trimEnd: result.trimEnd,
        filter: result.filter,
        textOverlay: result.textOverlay,
        volume: 100,
      });
    } catch (e: any) {
      setError(e.message || 'AI could not generate suggestions.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (!user) {
    return (
      <Alert>
        <AlertTitle>Please Log In</AlertTitle>
        <AlertDescription>You need to be logged in to use the AI Hub Editor.</AlertDescription>
      </Alert>
    );
  }

  const filters = [
    { name: 'None', value: 'none' },
    { name: 'Grayscale', value: 'grayscale(100%)' },
    { name: 'Sepia', value: 'sepia(100%)' },
    { name: 'Vibrant', value: 'saturate(200%)' },
    { name: 'Cool', value: 'hue-rotate(180deg)' },
    { name: 'Vintage', value: 'sepia(50%) contrast(120%)' },
  ];

  return (
    <div className="space-y-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="video"><Scissors className="mr-2 h-4 w-4" /> Video Editor</TabsTrigger>
          <TabsTrigger value="image"><ImageIcon className="mr-2 h-4 w-4" /> Image Filters</TabsTrigger>
          <TabsTrigger value="audio"><Mic className="mr-2 h-4 w-4" /> Audio Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="video" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 overflow-hidden bg-black flex flex-col">
              <div className="relative flex-1 min-h-[400px] flex items-center justify-center">
                {videoUrl ? (
                  <>
                    <video
                      ref={videoRef}
                      key={videoUrl}
                      src={videoUrl}
                      onLoadedMetadata={handleVideoMetadata}
                      className="w-full h-full object-contain"
                      style={{ filter: videoEdits.filter }}
                      muted={videoEdits.volume === 0}
                    />
                    {videoEdits.textOverlay && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none w-full">
                        <span className="bg-black/60 text-white px-4 py-2 rounded-lg text-2xl font-headline font-bold uppercase tracking-tight shadow-xl border-2 border-white/20">
                          {videoEdits.textOverlay}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
                        <Button variant="secondary" size="icon" className="h-16 w-16 rounded-full" onClick={togglePlay}>
                            {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
                        </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-12 text-muted-foreground flex flex-col items-center gap-4">
                    <div className="bg-white/10 p-6 rounded-full">
                        <Scissors className="h-12 w-12" />
                    </div>
                    <p>Upload a video to start editing like a pro.</p>
                    <Input type="file" accept="video/*" onChange={(e) => handleFileChange(e, 'video')} className="max-w-xs" />
                  </div>
                )}
              </div>
              <div className="bg-card p-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono">{videoEdits.trimStart.toFixed(1)}s</span>
                    <span className="text-xs font-mono">{videoEdits.trimEnd.toFixed(1)}s</span>
                </div>
                <Slider
                  defaultValue={[videoEdits.trimStart, videoEdits.trimEnd]}
                  max={duration || 100}
                  step={0.1}
                  onValueChange={([s, e]) => setVideoEdits(prev => ({ ...prev, trimStart: s, trimEnd: e }))}
                  className="mb-2"
                />
                <p className="text-[10px] text-muted-foreground text-center uppercase tracking-widest">Clip Timeline</p>
              </div>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wand2 className="h-4 w-4 text-primary" /> Louis AI Assistant
                  </CardTitle>
                  <CardDescription>Get expert edit suggestions based on your project goals.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Project Context</Label>
                    <Input placeholder="Project Title" {...form.register('projectTitle')} />
                    <Textarea placeholder="What is your goal?" className="h-20" {...form.register('userGoal')} />
                  </div>
                  <Button 
                    className="w-full" 
                    variant="outline" 
                    disabled={isLoading || !videoUrl} 
                    onClick={form.handleSubmit(handleGetAiSuggestions)}
                  >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                    Ask Louis to Edit
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Manual Tools</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2"><Sliders className="h-3 w-3" /> Filters</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {filters.map((f) => (
                        <Button
                          key={f.name}
                          variant={videoEdits.filter === f.value ? 'default' : 'outline'}
                          size="sm"
                          className="text-[10px] h-8 px-1"
                          onClick={() => setVideoEdits(prev => ({ ...prev, filter: f.value }))}
                        >
                          {f.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Type className="h-3 w-3" /> Text Overlay</Label>
                    <Input 
                      placeholder="Add a caption..." 
                      value={videoEdits.textOverlay}
                      onChange={(e) => setVideoEdits(prev => ({ ...prev, textOverlay: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Mic className="h-3 w-3" /> Volume</Label>
                    <Slider 
                        defaultValue={[videoEdits.volume]} 
                        max={100} 
                        onValueChange={([v]) => setVideoEdits(prev => ({ ...prev, volume: v }))} 
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="image" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="overflow-hidden bg-muted flex items-center justify-center aspect-square relative">
                {imageUrl ? (
                    <div className="relative w-full h-full">
                        <Image 
                            src={imageUrl} 
                            alt="Preview" 
                            fill 
                            className="object-contain transition-all"
                            style={{
                                filter: `${imageEdits.filter} brightness(${imageEdits.brightness}%) contrast(${imageEdits.contrast}%) saturate(${imageEdits.saturation}%)`
                            }}
                        />
                    </div>
                ) : (
                    <div className="text-center p-12">
                        <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p className="text-muted-foreground">Upload a project photo</p>
                        <Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'image')} className="mt-4" />
                    </div>
                )}
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Image Adjustments</CardTitle>
                    <CardDescription>Fine-tune your photos for the showcase.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label className="flex items-center gap-2"><Sun className="h-4 w-4" /> Brightness</Label>
                                <span className="text-xs font-mono">{imageEdits.brightness}%</span>
                            </div>
                            <Slider 
                                defaultValue={[imageEdits.brightness]} 
                                max={200} 
                                onValueChange={([v]) => setImageEdits(prev => ({ ...prev, brightness: v }))} 
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label className="flex items-center gap-2"><Contrast className="h-4 w-4" /> Contrast</Label>
                                <span className="text-xs font-mono">{imageEdits.contrast}%</span>
                            </div>
                            <Slider 
                                defaultValue={[imageEdits.contrast]} 
                                max={200} 
                                onValueChange={([v]) => setImageEdits(prev => ({ ...prev, contrast: v }))} 
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label className="flex items-center gap-2"><Sliders className="h-4 w-4" /> Saturation</Label>
                                <span className="text-xs font-mono">{imageEdits.saturation}%</span>
                            </div>
                            <Slider 
                                defaultValue={[imageEdits.saturation]} 
                                max={200} 
                                onValueChange={([v]) => setImageEdits(prev => ({ ...prev, saturation: v }))} 
                            />
                        </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t">
                        <Label>Artistic Filters</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {filters.map((f) => (
                                <Button
                                    key={f.name}
                                    variant={imageEdits.filter === f.value ? 'default' : 'outline'}
                                    onClick={() => setImageEdits(prev => ({ ...prev, filter: f.value }))}
                                >
                                    {f.name}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audio" className="mt-6">
            <Card className="max-w-2xl mx-auto">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                        <Mic className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle>Audio Polish</CardTitle>
                    <CardDescription>Optimize your voiceovers and project audio tracks.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="border-2 border-dashed rounded-lg p-12 text-center">
                        <p className="text-muted-foreground mb-4">Select an audio file or recorded clip</p>
                        <Input type="file" accept="audio/*" className="max-w-xs mx-auto" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <Label>Gain Control</Label>
                            <Slider defaultValue={[80]} max={100} />
                            <p className="text-[10px] text-muted-foreground">Adjust input level to prevent clipping.</p>
                        </div>
                        <div className="space-y-4">
                            <Label>Noise Reduction</Label>
                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1">Low</Button>
                                <Button variant="outline" className="flex-1">Med</Button>
                                <Button variant="outline" className="flex-1">High</Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full">Apply Audio Enhancement</Button>
                </CardFooter>
            </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center pt-8 border-t">
        <Button size="lg" className="px-12 rounded-full font-headline text-lg" disabled={!videoUrl && !imageUrl}>
            Apply Changes & Use in Project
        </Button>
      </div>
    </div>
  );
}
